export type Tone = 'professional' | 'casual' | 'concise';

export const VALID_TONES: Tone[] = ['professional', 'casual', 'concise'];

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  tone: Tone;
}

export interface RegenerateRequest {
  conversationId: string;
  messageId: string;
  tone: Tone;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

