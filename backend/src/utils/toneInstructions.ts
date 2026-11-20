import { Tone } from '../types';

export const toneInstructions: Record<Tone, string> = {
  professional:
    'Respond in a formal, structured, professional manner. Explain technical concepts clearly with appropriate depth and use proper terminology. Structure your responses logically.',
  casual:
    'Respond in a friendly, approachable, natural and conversational manner. Use simple language, contractions, and a warm tone as if speaking to a friend.',
  concise:
    'Respond with short, direct and informative answers. Avoid unnecessary explanations, filler words, or padding. Get to the point immediately.',
};

export const getSystemPrompt = (tone: Tone): string => {
  return `You are a helpful AI assistant. ${toneInstructions[tone]}`;
};

export const getFollowUpPrompt = (): string => {
  return `Based on the conversation above, generate exactly 2-3 relevant follow-up questions the user might want to ask next. 
Return ONLY a JSON array of strings with the questions, nothing else. 
Example: ["What is X?", "How does Y work?", "Can you explain Z?"]`;
};

