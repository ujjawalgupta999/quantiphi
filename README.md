# AI Chat Assistant

A production-quality, full-stack AI Chat Assistant built with React, Node.js, OpenAI, and MongoDB — similar to ChatGPT.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## Features

- 🤖 **Real AI Integration** — GPT-4o-mini via OpenAI API
- ⚡ **Real-time Streaming** — Server-Sent Events (SSE) for token-by-token responses
- 🎭 **Dynamic Tone Selection** — Professional, Casual, and Concise modes applied server-side
- 💾 **Persistent History** — MongoDB Atlas stores conversations and messages
- 🔄 **Regenerate Responses** — Re-generate any AI response with a click
- 💡 **Smart Follow-ups** — Context-aware follow-up question suggestions
- 🎨 **Modern Dark UI** — Responsive, premium design with Tailwind CSS
- 🔍 **Conversation Search** — Filter conversations by keyword
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| Backend | Node.js, Express, TypeScript, OpenAI SDK |
| Database | MongoDB Atlas, Mongoose |
| Streaming | Server-Sent Events (SSE) with Fetch ReadableStream |

## Project Structure

```
Quantiphi/
├── frontend/              # React + Vite frontend
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       ├── services/      # API client
│       └── types/         # TypeScript types
├── backend/               # Express + Node.js backend
│   └── src/
│       ├── config/        # DB connection
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       ├── controllers/   # Request handlers
│       ├── services/      # Business logic
│       ├── middleware/     # Error handling
│       └── utils/         # Helpers
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/conversations` | Create a new conversation |
| `GET` | `/api/conversations` | List all conversations |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation |
| `POST` | `/api/chat/send` | Send message (SSE stream) |
| `POST` | `/api/chat/regenerate` | Regenerate response (SSE stream) |

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- OpenAI API key

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Quantiphi
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aichat
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev    # Development with hot reload
npm run build  # Compile TypeScript
npm start      # Run compiled output
```

### 3. Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:5000
```

```bash
npm run dev    # Vite dev server at http://localhost:5173
npm run build  # Production build
```

## Architectural Decisions

### SSE over WebSockets
Server-Sent Events are used for streaming because the communication is unidirectional (server → client). SSE is simpler, works over HTTP/1.1, and doesn't require a separate protocol upgrade. POST requests initiate the stream since we need to send a request body.

### Backend tone injection
Tones are translated to system prompts on the backend (`toneInstructions.ts`), not the frontend. This prevents clients from tampering with the system prompt and centralizes the tone logic.

### Separate Conversations and Messages collections
Messages are stored in a separate collection indexed by `conversationId`. This keeps conversations lightweight for listing and allows efficient pagination of messages in the future.

### AbortController for cancellation
Both `sendMessage` and `regenerate` accept an `AbortController` signal. The SSE fetch can be cancelled mid-stream, which stops both the HTTP connection and the OpenAI stream.

### Optimistic UI updates
User messages and streaming assistant messages are added to state immediately (before API confirmation) for a snappy UX. Real IDs from the server replace temp IDs on the `done` event.

## Security

- API keys are stored only in backend environment variables
- Prompt length is capped at 10,000 characters
- Tone values are validated against an allowlist
- Conversation IDs are validated as MongoDB ObjectIds before queries
- CORS is restricted to the configured `FRONTEND_URL`
- Internal errors are not exposed to clients in production

## License

MIT
