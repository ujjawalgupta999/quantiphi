/**
 * env.ts — Centralized environment loader and validator.
 *
 * Import this module FIRST at the top of server.ts (before any other local
 * imports) so that process.env is fully populated before modules that depend
 * on environment variables are initialized.
 *
 * Uses an explicit __dirname-based path so the .env file is always resolved
 * relative to the backend root, regardless of the working directory from
 * which the process is started.
 */

import path from 'path';
import dotenv from 'dotenv';

// Resolve the backend root directory (two levels up from src/config/)
const envPath = path.resolve(__dirname, '..', '..', '.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
  // .env missing is not fatal here — variables may be injected by the host
  // environment. We will validate required vars below.
  console.warn(`⚠️  Could not load .env file at ${envPath}: ${result.error.message}`);
}

// Required environment variables — the app cannot run without these
const REQUIRED_VARS = ['MONGODB_URI', 'OPENAI_API_KEY'] as const;

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(', ')}\n` +
    `   Make sure backend/.env exists and contains all required keys.\n` +
    `   See backend/.env.example for reference.`
  );
  process.exit(1);
}

// Export typed accessors so the rest of the codebase never needs process.env directly
export const env = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: process.env.MONGODB_URI as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

