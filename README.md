# DevRev

React + Tailwind starter with reusable UI components and a real AI response prototype.

## Stack

- React (Vite)
- Tailwind CSS v4
- OpenAI-compatible chat completions API

## Run

1. Install dependencies:
   `npm install`
2. Copy environment file:
   `cp .env.example .env.local`
3. Set your API key in `.env.local`
4. Start development:
   `npm run dev`

## Environment Variables

- `VITE_OPENAI_API_KEY`: your API key
- `VITE_AI_BASE_URL`: API base URL (default `https://api.openai.com/v1`)
- `VITE_AI_MODEL`: model name (default `gpt-4o-mini`)

## Notes

This is a prototype setup where the API key is read by the client app via Vite env vars. For production, move AI calls to a backend API route so secrets stay server-side.
