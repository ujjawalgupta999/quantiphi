import { Conversation, Message, Tone, StreamEvent } from '../types/chat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const chatApi = {
  // Conversations
  getConversations: () =>
    request<{ success: boolean; data: Conversation[] }>('/api/conversations'),

  getConversation: (id: string) =>
    request<{ success: boolean; data: { conversation: Conversation; messages: Message[] } }>(
      `/api/conversations/${id}`
    ),

  createConversation: (title: string, tone: Tone) =>
    request<{ success: boolean; data: Conversation }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, tone }),
    }),

  deleteConversation: (id: string) =>
    request<{ success: boolean }>(`/api/conversations/${id}`, {
      method: 'DELETE',
    }),

  updateTone: (id: string, tone: Tone) =>
    request<{ success: boolean; data: Conversation }>(`/api/conversations/${id}/tone`, {
      method: 'PATCH',
      body: JSON.stringify({ tone }),
    }),

  // Chat - returns a ReadableStream
  sendMessage: async (
    conversationId: string | null,
    content: string,
    tone: Tone,
    signal: AbortSignal,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, content, tone }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to send message');
    }

    await readSSEStream(response, onEvent);
  },

  regenerate: async (
    conversationId: string,
    messageId: string,
    tone: Tone,
    signal: AbortSignal,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> => {
    const response = await fetch(`${API_URL}/api/chat/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, messageId, tone }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to regenerate');
    }

    await readSSEStream(response, onEvent);
  },
};

async function readSSEStream(
  response: Response,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.slice(6));
            onEvent(eventData as StreamEvent);
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

