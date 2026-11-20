import dotenv from 'dotenv';
import path from 'path';

// 1. Run dotenv.config() at the very top using explicit path to backend/.env
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });
// Also run default config as fallback for current working directory
dotenv.config();

// 2. Accept either GROQ_API_KEY or OPENAI_API_KEY for seamless Groq integration
const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;

// Required environment variables — the app cannot run without these
const missing: string[] = [];
if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
if (!apiKey) missing.push('GROQ_API_KEY or OPENAI_API_KEY');

if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(', ')}\n` +
    `   Make sure backend/.env exists and contains all required keys.\n` +
    `   See backend/.env.example for reference.`
  );
  process.exit(1);
}

// Check if placeholder key is still being used
if (
  apiKey === 'your_actual_groq_api_key_here' ||
  apiKey === 'gsk_your_groq_api_key_here' ||
  apiKey === 'your_openai_api_key_here'
) {
  console.warn(
    '⚠️  WARNING: GROQ_API_KEY / OPENAI_API_KEY is set to a placeholder value in backend/.env.\n' +
    '   Please replace it with your actual Groq API key from https://console.groq.com'
  );
}

// Export typed accessors so the rest of the codebase never needs process.env directly
export const env = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: process.env.MONGODB_URI as string,
  GROQ_API_KEY: apiKey as string,
  OPENAI_API_KEY: apiKey as string,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
