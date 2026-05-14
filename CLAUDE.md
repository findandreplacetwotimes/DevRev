# DevRev Project Chat Prototype

## Project Overview

React + Tailwind project management app with AI-powered chat capabilities. Building out collaborative project chat features with agent integration.

## Current Work

### Active Branch: feat/project-chat-interactions 🚧 IN PROGRESS
**Status**: Computer page rebuilt with pixel-accurate design system match

Recent updates:
- **Computer Page Rebuild** ✅ - Full redesign matching `~/dev/open-design/.od/projects/4d4d97fc-5f48-4b50-b49b-9c305f27edaa` reference
  - Sidebar: 240px width, DevRev design system tokens (husk neutrals, fg/bg semantic colors)
  - Message bubbles: hsl(var(--bg-layer-01)) background, 12px border-radius, 12px/16px padding
  - Computer avatar: husk-600 background with white two-bar icon (matches extracted SVG)
  - Chat header: 14px text-system-medium, 16px icon, proper spacing
  - Input area: 24px border-radius, focus ring on shuiguo-400, send button purple when active
  - Typography: text-body (16px) for messages, text-system (14px) for UI elements
- **Floating Chat Windows** ✅ - Messenger-style windows with drag, minimize, messaging
- **Invite Flow** ✅ - Add collaborators to chats with InvitePanel
- **Arcade Design** ✅ - All components use design system tokens

**Files modified**: ComputerPage.jsx (major rebuild), FloatingChatWindow.jsx, MinimizedChatTabs.jsx, InvitePanel.jsx, AppWorkspaceLayout.jsx, NavPanel.jsx, IssuesContext.jsx, aiClient.js, index.css

**Next**: Test Computer page in browser, verify design system tokens render correctly

---

## Previous Branch: feat/nav-hierarchy ✅ MERGED
**PR**: https://github.com/findandreplacetwotimes/DevRev/pull/2

---

## Completed Features (feat/project-chat-interactions)

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
  
- ✅ **Message Posting UI**
  - **Two inline icon buttons** in card-style container on hover
    - Copy (clipboard icon) - copies message to clipboard
    - Post to Timeline (arrow-up icon) - posts to history
  - White card background with subtle shadow
  - Rounded corners (12px) with hover states per button
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

**Phase 1 Implementation - COMPLETE ✅**
- Two-icon hover pattern in card container
- Polished tooltips with animations
- Success feedback (checkmark, bounce, color change)
- Direct posting (no preview dialog)
- Hardcoded actor initial ("M" for MVP)
- Full visual feedback: tab switch + yellow highlight + smooth scroll

**Future Phases (marked for later):**
- **Phase 2**: AI summarization before posting + preview dialog with editable summary
- **Phase 3**: Multi-message selection + batch posting with combined summary

#### 4. Floating Chat Windows ✅ COMPLETE
- ✅ **Messenger-Style UI**
  - White cards with Arcade design system
  - Floating bottom-right position
  - Draggable by header
  - Multiple windows stack horizontally
  
- ✅ **Window Controls**
  - Invite button (👤+) - opens InvitePanel
  - Minimize (−) - becomes tab at bottom
  - Close (×) - fully closes window
  - Custom inline buttons with hover states
  
- ✅ **Message Sending**
  - Text input with Arcade styling
  - Send button (↑) - purple when active
  - Enter key to send
  - Auto-scroll to latest message
  
- ✅ **AI Integration**
  - Computer responds via OpenRouter/OpenAI API
  - Typing indicator (●●●) with animation
  - Mock mode when no API key
  - Human participants send mock responses
  
- ✅ **Minimized Tabs**
  - White cards at bottom-right
  - Show last message preview
  - Click to restore window
  - Close button on tab

#### 5. Invite Flow ✅ COMPLETE
- ✅ **InvitePanel Component**
  - Full Arcade design system integration
  - Search users with TextInput
  - Add users to "pending" list
  - Batch invite with confirmation
  
- ✅ **User Management**
  - Mock user database (8 users)
  - Filter by name/email search
  - Show pending invites with remove option
  - System messages when users added
  
- ✅ **Chat State Updates**
  - Participants array updated in real-time
  - System messages logged to chat
  - Chat title updates with new participants
  - Persists via localStorage

### 2. Branch Out Topic (SKIPPED)
- Create focused sub-threads from main chat
- Context preservation
- Status: Feature skipped for now

## Arcade Design System Integration (SHELVED)

**Branch**: `worktree-design-system-polish` (2 commits, not merged to main)

**What was done:**
- Replaced 88+ hardcoded colors with Arcade tokens (`hsl(var(--husk-*))`, `hsl(var(--bg-layer-*))`)
- Replaced 161+ arbitrary spacing with phi-ratio scale (`var(--spacing-global-*)`)
- Copied Arcade CSS files (61KB) into `src/styles/arcade/`
- 63 files modified across entire codebase

**Why shelved:**
- **Zero visible difference** in light mode - original hardcoded colors already matched Arcade
- Adds complexity (61KB CSS, token maintenance) with no visual payoff
- Main value would be dark mode support (not currently needed)

**Key learning:**
- CSS @import with absolute file paths doesn't work in Vite - must copy files into project or use npm package
- Design system tokens are valuable for maintainability but not worth it if visual output is identical

**Decision**: Keep branch for future dark mode work, don't merge to main

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- AI: OpenRouter (free models) - currently using `qwen/qwen3-32b`
- Storybook for component development
- **Design System**: DevRev Arcade (see `.claude/design-guidance.md`)

## Code Conventions

- Prefer editing existing components over creating new ones
- Keep components in `src/components/`
- Add Storybook stories for new UI components
- Use Tailwind utility classes for styling
- No TypeScript (pure JS/JSX)

## Design System Usage (CRITICAL)

**When creating new pages or components, you MUST:**

1. **Use Arcade design tokens** - Never hardcode colors
   - Colors: `hsl(var(--bg-layer-01))`, `hsl(var(--text-color-primary))`, etc.
   - Spacing: `var(--spacing-global-xs)`, `var(--spacing-global-base)`, etc.
   - See `src/styles/arcade-tokens.css` for all available tokens

2. **Match existing component patterns** - Look at these for reference:
   - `FloatingChatWindow.jsx` - Card-style UI, messaging patterns
   - `MessageBubble.jsx` - Avatar and color usage
   - `InvitePanel.jsx` - Search and list patterns
   - `ProjectPage.jsx` - Layout structure

3. **Use correct typography classes**:
   - Headings: `.text-title-1`, `.text-title-2`, `.text-title-3`
   - Body: `.text-body`, `.text-body-small`
   - UI text: `.text-system`, `.text-system-small`
   - Weights: `.font-normal` (440), `.font-medium` (540), `.font-bold` (660)

4. **Follow Arcade visual style**:
   - Buttons: Pill-shaped (`rounded-full`)
   - Cards: Varied radius (10px/12px/16px based on density)
   - Colors: Fruit-named palette (Jabuticaba purple for AI, Banginapalli yellow for actions, etc.)
   - Layout: Information-dense, sidebar + main pattern

**Full design spec**: `/Users/prithvi/dev/arcade-prototyper/DESIGN.md`
**Design guidance**: `.claude/design-guidance.md`

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
- [x] Icon container styling: card with shadow, hover states, proper spacing

## Next Steps

### Ready for PR
Feature is complete and polished. Consider creating PR for `feat/project-chat-interactions` branch.

### Future Work (Marked for Later)
- **Phase 2 - AI Summarization**: SummarizeDialog with editable AI-generated summary
- **Phase 3 - Multi-Select**: Checkbox selection + batch posting with combined summary
- **Branch Out Topic**: Sub-threading feature (currently skipped)

## Recent Work

**Session 1 (May 8, 2026 - Evening):**
- Replaced single + button with two-icon pattern (Copy + Post)
- Added professional tooltips with Arcade design system integration
- Implemented success feedback (checkmark, color change, bounce animation)
- Added auto-switch to History tab when posting
- Implemented yellow highlight animation on posted messages
- Added smooth scroll to highlighted events
- Polished icon container with card-style background and shadows
- Coordinated state between ChatWindow, AppWorkspaceLayout, ProjectPage, DocumentHistoryPlaceholder

## Commits

- `009211f` - Add Computer agent to project chat with weekly rundown
- `3634001` - Implement Send to Timeline feature (Phase 1 MVP)
- `a5889f3` - Polish Send to Timeline with hover icons, tooltips, and visual feedback
- `6ef0a69` - Polish Send to Timeline hover icons with card-style container
