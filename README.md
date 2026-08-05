# DevRev

React + Tailwind starter with reusable UI components and a real AI response prototype.

## Stack

- React (Vite)
- Tailwind CSS v4
- Storybook
- Vitest and Testing Library
- OpenAI-compatible chat completions API

## Prerequisites

- Node.js 24
- npm 11 or newer

If you use nvm, run `nvm use` from the repository root.

## Setup

1. Install dependencies:
   `npm ci`
2. Copy environment file:
   `cp .env.example .env.local`
3. Set the values needed for the features you are developing in `.env.local`.
4. Start development:
   `npm run dev`

The application is available at `http://localhost:5173` by default. Run `npm run storybook` to develop components in Storybook at `http://localhost:6006`.

## Environment Variables

- `VITE_OPENAI_API_KEY`: your API key
- `VITE_AI_BASE_URL`: API base URL (default `https://api.openai.com/v1`)
- `VITE_AI_MODEL`: model name (default `gpt-4o-mini`)
- `KV_REST_API_URL`: Vercel KV REST endpoint used by the issues API
- `KV_REST_API_TOKEN`: Vercel KV REST token used by the issues API

## Checks

Run the complete local verification suite before opening a pull request:

`npm run check`

Individual commands are also available: `npm run lint`, `npm run typecheck`, `npm test`, `npm run format:check`, `npm run build`, and `npm run build-storybook`.

## Notes

This is a prototype setup where the API key is read by the client app via Vite env vars. For production, move AI calls to a backend API route so secrets stay server-side.
