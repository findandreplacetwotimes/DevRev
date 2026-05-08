# DevRev Project Chat Prototype

## Project Overview

React + Tailwind project management app with AI-powered chat capabilities. Building out collaborative project chat features with agent integration.

## Current Work: Project Chat Interactions (feat/project-chat-interactions)

### Three-Part Feature Set

1. **Internal Chat Room**
   - ✅ Computer identity with Arcade design system
     - Two-bar logo (Computer branding from arcade-prototyper)
     - Jabuticaba purple background (intelligence color: hsl(259 94% 44%))
   - ✅ Computer appears as teammate in group chats
   - ✅ @mention detection (@computer, @Computer, @agent, @AI) to invoke Computer
   - ✅ Weekly rundown message on chat open
     - Posts once per session after 2s delay
     - Mocks project analytics (completed tasks, PRs, milestones, velocity)
   - Status: Complete - Ready for testing

2. **Branch Out Topic Interaction**
   - Create focused sub-threads from main project chat
   - Context preservation
   - Status: Not started

3. **Send to Timeline**
   - Summarize threads/messages
   - Post summaries to project timeline
   - Status: Not started

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- Claude API (Sonnet 4.6)
- Storybook for component development

## Code Conventions

- Prefer editing existing components over creating new ones
- Keep components in `src/components/`
- Add Storybook stories for new UI components
- Use Tailwind utility classes for styling
- No TypeScript (pure JS/JSX)

## Environment

- Dev server: `npm run dev` (http://localhost:5174)
- Storybook: `npm run storybook`
- AI calls currently client-side (prototype; move to backend for production)

## Next Steps

1. Review existing chat components (ChatWindow, ChatHeader, AiMessageBubble)
2. Design internal chat room component
3. Plan data structure for messages, threads, and agent interactions
