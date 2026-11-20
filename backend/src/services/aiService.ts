import OpenAI from 'openai';
import { Response } from 'express';
import { ChatMessage, Tone } from '../types';
import { getSystemPrompt, getFollowUpPrompt } from '../utils/toneInstructions';
import { env } from '../config/env';

// Lazy singleton — initialized on first request with Groq configuration
let groqClient: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!groqClient) {
    const apiKey = env.GROQ_API_KEY || env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY / OPENAI_API_KEY is not set');
    }

    // OpenAI SDK configured with Groq's endpoint
    groqClient = new OpenAI({
      apiKey,
      baseURL: env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1',
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
  const model = env.OPENAI_MODEL || 'llama-3.3-70b-versatile';

  const systemMessage: ChatMessage = {
    role: 'system',
    content: getSystemPrompt(tone),
  };

  const fullMessages = [systemMessage, ...messages];

  try {
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
  } catch (error: any) {
    console.error('❌ [aiService] Groq chat completion stream failed:');
    console.error(`   Status: ${error?.status || error?.statusCode || 'N/A'}`);
    console.error(`   Message: ${error?.message || String(error)}`);
    if (error?.error) {
      console.error('   Error payload:', JSON.stringify(error.error, null, 2));
    }
    throw error;
  }
};

export const generateFollowUpSuggestions = async (
  messages: ChatMessage[]
): Promise<string[]> => {
  const client = getClient();
  const model = env.OPENAI_MODEL || 'llama-3.3-70b-versatile';

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
  } catch (error: any) {
    console.error('⚠️ [aiService] Follow-up suggestion generation failed:');
    console.error(`   Status: ${error?.status || 'N/A'}, Message: ${error?.message || error}`);
    return [];
  }
};

export const generateTitleFromPrompt = async (prompt: string): Promise<string> => {
  const client = getClient();
  const model = env.OPENAI_MODEL || 'llama-3.3-70b-versatile';

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
  } catch (error: any) {
    console.error('⚠️ [aiService] Title generation fallback used:');
    console.error(`   Status: ${error?.status || 'N/A'}, Message: ${error?.message || error}`);
    return prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt;
  }
};
