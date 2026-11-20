import React, { useEffect, useRef } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { Message, Conversation, Tone } from '../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  messages: Message[];
  activeConversation: Conversation | null;
  isStreaming: boolean;
  error: string | null;
  tone: Tone;
  onSendMessage: (content: string) => void;
  onStopStreaming: () => void;
  onRegenerate: (messageId: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  onDismissError: () => void;
}

const WELCOME_PROMPTS = [
  'What can you help me with today?',
  'Explain quantum computing in simple terms',
  'Help me write a professional email',
  'What are best practices for React?',
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  activeConversation,
  isStreaming,
  error,
  onSendMessage,
  onStopStreaming,
  onRegenerate,
  onSuggestionClick,
  onDismissError,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmptyState = !activeConversation && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmptyState ? (
          // Welcome Screen
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">How can I help you?</h2>
            <p className="text-gray-500 text-sm mb-10 text-center max-w-md">
              I'm your AI assistant. Ask me anything — I can answer questions, help with
              writing, explain concepts, debug code, and much more.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {WELCOME_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/50 border border-white/5 text-left hover:bg-gray-800 hover:border-white/10 transition-all duration-200 group"
                >
                  <MessageSquare
                    size={16}
                    className="text-indigo-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm text-gray-300 leading-snug">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message List
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                onRegenerate={msg.role === 'assistant' ? onRegenerate : undefined}
                onSuggestionClick={onSuggestionClick}
                isStreaming={isStreaming}
              />
            ))}

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <span>{error}</span>
                <button onClick={onDismissError} className="text-red-500 hover:text-red-300 text-xs underline">
                  Dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default ChatWindow;

