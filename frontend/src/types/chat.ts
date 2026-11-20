export type Tone = 'professional' | 'casual' | 'concise';

export interface Message {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  suggestions?: string[];
}

export interface Conversation {
  _id: string;
  title: string;
  tone: Tone;
  createdAt: string;
  updatedAt: string;
}

export interface StreamEvent {
  type: 'init' | 'chunk' | 'done' | 'error';
  content?: string;
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
  messageId?: string;
  suggestions?: string[];
  error?: string;
}
