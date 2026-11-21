import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation, Message, Tone, StreamEvent } from '../types/chat';
import { chatApi } from '../services/chatApi';

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [tone, setTone] = useState<Tone>('professional');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load all conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  const selectConversation = useCallback(async (conv: Conversation) => {
    if (isStreaming) return;
    setError(null);
    setActiveConversation(conv);
    setTone(conv.tone as Tone);
    try {
      const res = await chatApi.getConversation(conv._id);
      setMessages(res.data.messages);
    } catch (err) {
      setError('Failed to load conversation messages');
      console.error(err);
    }
  }, [isStreaming]);

  const startNewConversation = useCallback(() => {
    if (isStreaming) return;
    setActiveConversation(null);
    setMessages([]);
    setError(null);
  }, [isStreaming]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversation?._id === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    }
  }, [activeConversation]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      setError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Optimistically add user message
      const tempUserMsgId = `temp-user-${Date.now()}`;
      const tempAssistantMsgId = `temp-assistant-${Date.now()}`;

      const userMsg: Message = {
        _id: tempUserMsgId,
        conversationId: activeConversation?._id || '',
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        _id: tempAssistantMsgId,
        conversationId: activeConversation?._id || '',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      let currentConvId = activeConversation?._id || null;
      let finalAssistantId = tempAssistantMsgId;

      try {
        await chatApi.sendMessage(
          currentConvId,
          content.trim(),
          tone,
          controller.signal,
          (event: StreamEvent) => {
            switch (event.type) {
              case 'init':
                if (event.conversationId) {
                  currentConvId = event.conversationId;
                  // Update temp messages with real conversationId
                  setMessages((prev) =>
                    prev.map((m) =>
                      m._id === tempUserMsgId
                        ? { ...m, conversationId: event.conversationId! }
                        : m
                    )
                  );
                }
                if (event.userMessageId) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m._id === tempUserMsgId ? { ...m, _id: event.userMessageId! } : m
                    )
                  );
                }
                break;

              case 'chunk':
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === finalAssistantId || m._id === tempAssistantMsgId
                      ? { ...m, content: m.content + (event.content || '') }
                      : m
                  )
                );
                break;

              case 'done':
                if (event.assistantMessageId) {
                  finalAssistantId = event.assistantMessageId;
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === tempAssistantMsgId || m._id === finalAssistantId
                      ? {
                          ...m,
                          _id: event.assistantMessageId || m._id,
                          isStreaming: false,
                          suggestions: event.suggestions,
                          conversationId: event.conversationId || m.conversationId,
                        }
                      : m
                  )
                );

                // Update or add conversation in list
                if (event.conversationId) {
                  loadConversations();
                  if (!activeConversation) {
                    // Reload active conversation from API
                    chatApi.getConversation(event.conversationId).then((res) => {
                      setActiveConversation(res.data.conversation);
                    });
                  }
                }
                break;

              case 'error':
                setError(event.error || 'An error occurred');
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === tempAssistantMsgId
                      ? { ...m, content: 'Error generating response.', isStreaming: false }
                      : m
                  )
                );
                break;
            }
          }
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to send message. Please try again.');
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempAssistantMsgId
                ? { ...m, content: 'Error generating response.', isStreaming: false }
                : m
            )
          );
        } else {
          // Aborted — clean up streaming state
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempAssistantMsgId ? { ...m, isStreaming: false } : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, activeConversation, tone, loadConversations]
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!activeConversation || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Mark message as streaming
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, content: '', isStreaming: true, suggestions: undefined } : m
        )
      );

      try {
        await chatApi.regenerate(
          activeConversation._id,
          messageId,
          tone,
          controller.signal,
          (event: StreamEvent) => {
            switch (event.type) {
              case 'chunk':
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === messageId
                      ? { ...m, content: m.content + (event.content || '') }
                      : m
                  )
                );
                break;

              case 'done':
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === messageId
                      ? { ...m, isStreaming: false, suggestions: event.suggestions }
                      : m
                  )
                );
                break;

              case 'error':
                setError(event.error || 'Error regenerating response');
                setMessages((prev) =>
                  prev.map((m) =>
                    m._id === messageId
                      ? { ...m, content: 'Error regenerating response.', isStreaming: false }
                      : m
                  )
                );
                break;
            }
          }
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Failed to regenerate. Please try again.');
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, content: 'Error regenerating response.', isStreaming: false }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId ? { ...m, isStreaming: false } : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [activeConversation, isStreaming, tone]
  );

  const changeTone = useCallback(
    async (newTone: Tone) => {
      setTone(newTone);
      if (activeConversation) {
        setActiveConversation((prev) => (prev ? { ...prev, tone: newTone } : null));
        setConversations((prev) =>
          prev.map((c) => (c._id === activeConversation._id ? { ...c, tone: newTone } : c))
        );
        try {
          await chatApi.updateTone(activeConversation._id, newTone);
        } catch (err) {
          console.error('Failed to update conversation tone:', err);
        }
      }
    },
    [activeConversation]
  );

  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return {
    conversations: filteredConversations,
    activeConversation,
    messages,
    isStreaming,
    tone,
    error,
    searchQuery,
    setSearchQuery,
    sendMessage,
    regenerateMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
    stopStreaming,
    changeTone,
    setError,
  };
}

