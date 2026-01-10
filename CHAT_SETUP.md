# AI Chat Setup

This project includes an AI-powered chat feature using Google's Gemini model via the AI SDK.

## Setup

### 1. Get a Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variable

Add your Google AI API key to your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

**Note:** The `.env` file is gitignored and should never be committed to version control.

### 3. Access the Chat

Once configured, navigate to `/games/{gameId}/chat` in your application to access the AI chat interface.

## Files Created

- `src/routes/api/chat.ts` - API endpoint that handles chat requests using Google's Gemini model
- `src/routes/_auth/games/$gameId/chat.tsx` - Chat UI component
- `CHAT_SETUP.md` - This setup guide

## How It Works

The chat feature uses:
- **AI SDK** (`ai` package) for streaming AI responses
- **Google AI SDK** (`@ai-sdk/google`) for accessing Gemini models
- **@ai-sdk/react** for the `useChat` hook that manages chat state
- **TanStack Router** for routing and server handlers

The API route (`/api/chat`) receives messages, calls the Gemini model, and streams responses back to the client.
The UI route uses the `useChat` hook to manage message state and communicate with the API.
