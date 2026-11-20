import OpenAI from 'openai';
import { Response } from 'express';
import { ChatMessage, Tone } from '../types';
import { getSystemPrompt, getFollowUpPrompt } from '../utils/toneInstructions';
import { env } from '../config/env';

// Lazy singleton — initialized on first request so env is guaranteed loaded
let groqClient: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!groqClient) {
    // Uses OpenAI SDK with Groq's OpenAI-compatible endpoint
    groqClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
    });
  }
  return groqClient;
};

export const streamChatResponse = async (
  res: Response,
  messages: ChatMessage[],
  tone: Tone
): Promise<string> => {
  const client = getClient();
  const model = env.OPENAI_MODEL;

  const systemMessage: ChatMessage = {
    role: 'system',
    content: getSystemPrompt(tone),
  };

  const fullMessages = [systemMessage, ...messages];

  const stream = await client.chat.completions.create({
    model,
    messages: fullMessages,
    stream: true,
    max_tokens: 2000,
    temperature: 0.7,
  });

  let fullContent = '';

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullContent += delta;
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: delta })}\n\n`);
    }

    if (chunk.choices[0]?.finish_reason === 'stop') {
      break;
    }
  }

  return fullContent;
};

export const generateFollowUpSuggestions = async (
  messages: ChatMessage[]
): Promise<string[]> => {
  const client = getClient();
  const model = env.OPENAI_MODEL;

  const followUpMessage: ChatMessage = {
    role: 'user',
    content: getFollowUpPrompt(),
  };

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [...messages, followUpMessage],
      max_tokens: 300,
      temperature: 0.8,
    });

    const rawContent = response.choices[0]?.message?.content || '[]';
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).filter((s): s is string => typeof s === 'string');
    }
    return [];
  } catch {
    return [];
  }
};

export const generateTitleFromPrompt = async (prompt: string): Promise<string> => {
  const client = getClient();
  const model = env.OPENAI_MODEL;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: `Generate a short, descriptive title (max 6 words) for a chat conversation that starts with this message: "${prompt}". Return ONLY the title, no quotes or punctuation.`,
        },
      ],
      max_tokens: 20,
      temperature: 0.5,
    });
    return response.choices[0]?.message?.content?.trim() || prompt.substring(0, 50);
  } catch {
    return prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
  }
};
