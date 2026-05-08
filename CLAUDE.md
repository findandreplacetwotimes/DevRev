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

#### 3. Send to Timeline ✅ COMPLETE (with full visual feedback)
- ✅ **Timeline Data Infrastructure**
  - Added `history: []` field to projects in IssuesContext
  - Timeline events: `{ id, timestamp, actorInitial, type, attribute, detail }`
  - Persisted via localStorage + patchProject
  
- ✅ **Real Timeline Display**
  - DocumentHistoryPlaceholder accepts real history data
  - Groups events by timestamp
  - Falls back to placeholder when empty
  
- ✅ **Message Posting UI (Latest Session)**
  - **Two inline icon buttons** appear on hover (DevRev pattern)
    - Copy (clipboard icon) - copies message to clipboard
    - Post to Timeline (arrow-up icon) - posts to history
  - Positioned below message bubble with proper styling
  - Only enabled in project chat with valid projectId
  - Creates "Discussion" events instantly
  
- ✅ **Polished Tooltips**
  - 400ms hover delay with smooth fade-in + scale animation
  - Dark background with arrow pointer
  - Uses `--foreground-primary` from Arcade design system
  - Labels: "Copy message" and "Post to timeline"
  
- ✅ **Success Feedback**
  - Icon changes to checkmark with bounce animation
  - Color shifts to jabuticaba purple (intelligence color)
  - Tooltip updates to "Posted!"
  - Feedback clears after 1.5s
  
- ✅ **Timeline Auto-Switch & Highlight**
  - Automatically switches to History tab after posting
  - Highlights posted message with yellow fade animation
  - Uses arcade-compatible caution yellow (hsl 48 100% 85%)
  - Smooth scroll to highlighted event
  - Animation duration: 2.5s fade-out
  - Auto-clears highlight after 3s

**Current Implementation (Phase 1 + Polish):**
- Two-icon hover pattern (Copy + Post to Timeline)
- Polished tooltips with animations
- Success feedback (checkmark, bounce, color change)
- Direct posting (no preview dialog)
- Hardcoded actor initial ("M" for MVP)
- Full visual feedback: tab switch + yellow highlight + smooth scroll

**Deferred to Phase 2:**
- AI summarization before posting
- Preview dialog with editable summary

**Deferred to Phase 3:**
- Multi-message selection
- Batch summarization

**Known Issue (Frontend Design):**
- Icon container styling may still appear "dangling" (frontend-design skill was running but outcome pending)

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
- `src/components/DocumentHistoryPlaceholder.jsx` - Real history rendering + highlight animation + scroll-to-view
- `src/components/MessageBubble.jsx` - Two-icon hover UI (copy + post) with tooltips and success feedback
- `src/components/ChatWindow.jsx` - Post to timeline handler with onTimelinePosted callback
- `src/components/ProjectPage.jsx` - Tab switching + highlight state management + handler registration
- `src/components/AppWorkspaceLayout.jsx` - Coordinate timeline posting between ChatWindow and ProjectPage via refs
- `src/lib/timelineHelpers.js` - Timestamp formatting, event creation
- `src/index.css` - Multiple animations: highlight-fade, tooltip-in, post-success

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
- [x] Hover reveals 2 icons (copy + post) on chat messages
- [x] Tooltips appear on icon hover with 400ms delay
- [x] Copy icon copies message to clipboard
- [x] Post icon posts to timeline with success feedback
- [x] Success animation: checkmark + purple + bounce + "Posted!" tooltip
- [x] Auto-switch to History tab after posting
- [x] Highlight posted message with yellow fade
- [x] Smooth scroll to highlighted event
- [x] Timeline persists across refresh
- [x] Timestamps format correctly
- [ ] Icon container styling polish (frontend-design task pending)
- [ ] Test with multiple posts in succession
- [ ] Test long message text wrapping
- [ ] Optional: Add toast notification for copy success

## Next Session TODO

1. **Check Frontend Design Output:**
   - Review frontend-design skill output for icon container styling improvements
   - Apply any suggested changes to make icons feel less "dangling"
   - May need manual refinement if skill didn't complete

2. **Test & Polish:**
   - Verify multi-message posting in succession
   - Test copy functionality with special characters
   - Test edge cases (very long messages, emoji, markdown)
   - Optional: Add subtle toast for copy success

3. **Commit & PR:**
   - Commit all changes for Part 3 completion
   - Update commit message with full feature list
   - Consider creating PR for feat/project-chat-interactions branch

4. **Phase 2 - AI Summarization (Optional):**
   - Create SummarizeDialog component
   - Computer generates summary before posting
   - User can edit summary
   - Fallback to manual if AI fails

5. **Phase 3 - Multi-Select (Optional):**
   - Checkbox on hover for selection
   - Floating action bar when messages selected
   - Batch posting with combined summary

6. **Part 2 - Branch Out Topic (If needed):**
   - Plan the threading/branching UX
   - Design data structure for sub-threads

## Recent Work (Current Session)

**Parallel Implementation (3 agents):**
1. **Tooltips Agent** - Added polished tooltips with 400ms delay, smooth animations
2. **Timeline Feedback Agent** - Implemented auto-switch to History + yellow highlight animation
3. **Frontend Design Skill** - Attempted icon container styling improvements (status pending)

**Key Improvements This Session:**
- Replaced single + button with two-icon pattern (Copy + Post)
- Added professional tooltips with Arcade design system integration
- Implemented success feedback (checkmark, color change, bounce animation)
- Added auto-switch to History tab when posting
- Implemented yellow highlight animation on posted messages
- Added smooth scroll to highlighted events
- Coordinated state between ChatWindow, AppWorkspaceLayout, ProjectPage, DocumentHistoryPlaceholder

## Commits

- `009211f` - Add Computer agent to project chat with weekly rundown
- `3634001` - Implement Send to Timeline feature (Phase 1 MVP)
- (pending) - Add hover icons, tooltips, success feedback, and timeline auto-switch with highlight
