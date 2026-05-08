# DevRev Project Chat Prototype

## Project Overview

React + Tailwind project management app with AI-powered chat capabilities. Building out collaborative project chat features with agent integration.

## Current Branch: feat/project-chat-interactions

### Completed Features

#### 1. Internal Chat Room ✅ COMPLETE
- ✅ **Computer Identity** (Arcade design system)
  - Two-bar logo from arcade-prototyper
  - Jabuticaba purple background (intelligence color: hsl(259 94% 44%))
  - Distinct from human teammates
  
- ✅ **@Mention Invocation**
  - Detects `@computer`, `@Computer`, `@agent`, `@AI`
  - Computer responds when mentioned
  - Uses Computer-specific AI prompt
  
- ✅ **Weekly Rundown (Proactive)**
  - Posts once per session, 2s after opening project chat
  - Mock analytics: completion %, issues closed, blockers, days to milestone
  - Project-focused (not team velocity)

#### 3. Send to Timeline ✅ PHASE 1 COMPLETE
- ✅ **Timeline Data Infrastructure**
  - Added `history: []` field to projects in IssuesContext
  - Timeline events: `{ id, timestamp, actorInitial, type, attribute, detail }`
  - Persisted via localStorage + patchProject
  
- ✅ **Real Timeline Display**
  - DocumentHistoryPlaceholder accepts real history data
  - Groups events by timestamp
  - Falls back to placeholder when empty
  
- ✅ **Message Posting UI**
  - Hover action (+ button) on group chat messages
  - Only enabled in project chat with valid projectId
  - Creates "Discussion" events instantly
  - No AI processing (Phase 2)

**Phase 1 MVP Implementation:**
- Single message posting with hover action
- Direct posting (no preview dialog)
- Hardcoded actor initial ("M" for MVP)

**Deferred to Phase 2:**
- AI summarization before posting
- Preview dialog with editable summary

**Deferred to Phase 3:**
- Multi-message selection
- Batch summarization

### 2. Branch Out Topic ⏸️ NOT STARTED
- Create focused sub-threads from main chat
- Context preservation
- Status: Planned but not implemented

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- AI: OpenRouter (free models) - currently using `qwen/qwen3-32b`
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
- AI: OpenRouter API with free model tier
- Key in `.env.local`: `VITE_OPENAI_API_KEY`

## Key Files Modified

**Computer Agent (Part 1):**
- `src/components/MessageBubble.jsx` - Computer avatar with two-bar logo
- `src/components/ChatWindow.jsx` - Weekly rundown, @mention handling
- `src/lib/mentionDetection.js` - @mention pattern detection
- `src/lib/aiClient.js` - OpenRouter integration with headers

**Send to Timeline (Part 3):**
- `src/context/IssuesContext.jsx` - Added history field to projects
- `src/components/DocumentHistoryPlaceholder.jsx` - Real history rendering
- `src/components/MessageBubble.jsx` - Hover action button
- `src/components/ChatWindow.jsx` - Post to timeline handler
- `src/components/ProjectPage.jsx` - Pass history to timeline
- `src/components/AppWorkspaceLayout.jsx` - Extract & pass projectId
- `src/lib/timelineHelpers.js` - Timestamp formatting, event creation

## Plans & Documentation

- **Implementation plan**: `.claude/plans/send-to-timeline.md`
- **Session tracking**: Project plans now stored in `.claude/plans/` (project-local)

## Testing Checklist

**Part 1 - Computer Agent:**
- [x] Computer appears with purple avatar in project chat
- [x] Weekly rundown posts after 2s
- [x] @computer triggers AI response
- [x] Messages render properly

**Part 3 - Send to Timeline:**
- [x] Hover reveals + button on chat messages
- [x] Clicking button posts to timeline
- [x] History tab shows posted messages
- [x] Timeline persists across refresh
- [x] Timestamps format correctly
- [ ] Test with multiple posts
- [ ] Test long message text wrapping

## Next Session TODO

1. **Test & Polish Phase 1:**
   - Verify multi-message posting
   - Add success toast notification (currently console.log)
   - Test edge cases (very long messages, special characters)

2. **Phase 2 - AI Summarization (Optional):**
   - Create SummarizeDialog component
   - Computer generates summary before posting
   - User can edit summary
   - Fallback to manual if AI fails

3. **Phase 3 - Multi-Select (Optional):**
   - Checkbox on hover for selection
   - Floating action bar when messages selected
   - Batch posting with combined summary

4. **Part 2 - Branch Out Topic (If needed):**
   - Plan the threading/branching UX
   - Design data structure for sub-threads

## Commits

- `009211f` - Add Computer agent to project chat with weekly rundown
- `3634001` - Implement Send to Timeline feature (Phase 1 MVP)
