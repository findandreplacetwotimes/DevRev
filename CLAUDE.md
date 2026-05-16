# DevRev Project Chat Prototype

## Project Overview

React + Tailwind project management app with AI-powered chat capabilities. Building collaborative project chat features with agent integration and hierarchical navigation.

## Current Work: Conversation-to-Project Conversion (conv-project-creation)

**Branch**: `conv-project-creation`  
**Worktree**: `.claude/worktrees/conv-project-creation`  
**Server**: http://localhost:5174/

### Completed Features (May 14-16, 2026)

#### 1. Conversation-to-Project Conversion Flow ✅
- **"Convert to Project" button** appears on group chats with 3+ participants, 5+ messages, and files
- **ProjectConversionModal** shows preview (member count, file count, project title)
- Pre-seeded **Arcade Design System** project (Project-0004) with 4 milestones and 8 issues
- Conversion links chat to existing project (safe for repeated demos)
- Navigation to project page with chat open and project expanded

#### 2. Demo Seed Data ✅
- **Two demo chats** in Computer page:
  1. **"Design System Architecture"** - 2 people (Dejan + Computer), 6 messages, 5 files, no convert button
  2. **"New Design System"** - 4 people (adds Konstantin + Dejan Mesar), 12 messages, 9 files, shows convert button
- Chat pre-linked to Project-0004 via `projectId` field
- Authentic Arcade Design System origin story with realistic timestamps

#### 3. Project Chat Integration ✅
- Project chat displays converted conversation automatically
- Participant names mapped from `AVAILABLE_USERS`
- Dynamic message rendering with proper initials and agent detection
- Chat shows in Arcade Design project when clicking "Project chat" in nav

#### 4. Collapsible Navigation ✅
- **Minimized mode**: 60px width showing only project icons
- **Expanded mode**: 220px width showing full nav tree
- Defaults to collapsed for smooth transition from Computer page
- Chevron toggle button with smooth 200ms animation
- Project icons: Purple K (Agentic Kanban), Orange A (Arcade Design)

#### 5. Post-Conversion Experience ✅
- Landing on project page opens chat panel automatically
- Chat variant set to `project-{projectId}`
- Project auto-expands in nav when viewing its chat
- Query param `?openChat=true` handled and cleaned up
- Nav starts collapsed for minimal visual impact

#### 6. Bug Fixes ✅
- **Fixed**: `isMember` field preservation in localStorage (projects disappeared on refresh)
- **Fixed**: `convertChatToProject` export from `useChats()` hook
- **Fixed**: Project limit removed (was capped at 3, now shows all 4)
- **Fixed**: projectId passed to ChatWindow for correct chat lookup
- **Fixed**: Build team collapsed by default

### Technical Implementation

**Key Files**:
- `src/components/ComputerPage.jsx` - Convert button, modal, navigation with `?openChat=true`
- `src/components/ProjectConversionModal.jsx` - Conversion modal with preview
- `src/components/ChatWindow.jsx` - Converted chat display with participant mapping
- `src/components/NavPanel.jsx` - Collapsible nav (60px/220px), project auto-expand
- `src/components/AppWorkspaceLayout.jsx` - openChat param handling, chat panel opening
- `src/context/IssuesContext.jsx` - `convertChatToProject()`, `useChats()` hook, localStorage fixes
- `src/lib/demoConversionSeed.js` - Two demo chats with Arcade DS story
- `src/lib/issuesSeed.js` - Pre-seeded Project-0004 with 8 issues and 4 milestones
- `src/lib/chatHelpers.js` - Eligibility criteria for convert button
- `DEMO_SCRIPT.md` - Full walkthrough of demo flow

**Data Model**:
```js
// Chat with conversion link
{
  id: "chat-arcade-origin",
  title: "New Design System",
  participants: ["user", "computer", "konstantin-dziuin", "dejan-mesar"],
  messages: [...],
  files: [...],
  projectId: "Project-0004", // Pre-linked for demo
  createdAt: timestamp,
  lastActivity: timestamp
}

// Pre-seeded project
{
  id: "Project-0004",
  title: "Arcade Design",
  isMember: true,
  milestones: [
    { id: "Project-0004:m1", title: "Foundation & Tokens", ... },
    { id: "Project-0004:m2", title: "Core Components", ... },
    { id: "Project-0004:m3", title: "Documentation & Tooling", ... },
    { id: "Project-0004:m4", title: "Rollout & Migration", ... }
  ],
  history: [...]
}
```

**Conversion Eligibility**:
```js
function isChatReadyForProject(chat) {
  return (
    chat.files && chat.files.length > 0 &&
    chat.participants && chat.participants.length >= 3 &&
    chat.messages && chat.messages.length >= 5
  )
}
```

### Demo Flow

1. Navigate to http://localhost:5174/computer
2. See two chats in left sidebar:
   - "Design System Architecture" (2 people) - no convert button
   - "New Design System" (4 people) - shows convert button
3. Open "New Design System" chat
4. Click "Convert to Project" button in header
5. Modal appears with preview:
   - Title: "New Design System"
   - 4 members, 9 files
6. Click "Create Project"
7. Navigates to `/projects/Project-0004?openChat=true`
8. Landing state:
   - Nav collapsed (60px) showing project icons
   - Chat panel open showing converted conversation
   - Project page displayed
9. Expand nav with chevron to see full project tree
10. Click "Project chat" in nav to access conversation anytime

### Known Issues & Future Work

**For Next Session (Bug Fixes)**:
- [ ] Test edge cases (refresh, back button, direct URL navigation)
- [ ] Polish modal animations
- [ ] Add loading states during conversion
- [ ] Test with multiple concurrent conversions
- [ ] Verify localStorage cleanup on edge cases

**Future Enhancements**:
- [ ] AI summarization of chat before conversion (Phase 2)
- [ ] Multi-select messages for batch posting (Phase 3)
- [ ] Branch Out Topic interaction for creating sub-projects
- [ ] Timeline integration showing chat history as project events
- [ ] Canvas panel accessible after conversion

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- React Router
- Claude API (Sonnet 4.6) via OpenRouter
- Storybook for component development

## Code Conventions

- Prefer editing existing components over creating new ones
- Keep components in `src/components/`
- Add Storybook stories for new UI components
- Use Tailwind utility classes for styling
- No TypeScript (pure JS/JSX)
- Agent avatars use brand colors: Computer (#6366F1), Claude (#CC785C)

## Environment

- Dev server: `npm run dev -- --port 5174` (http://localhost:5174)
- Storybook: `npm run storybook`
- AI calls currently client-side (prototype; move to backend for production)
- **Important**: Always clear localStorage after pulling changes: `localStorage.clear(); location.reload();`

## Git Commits (May 14-16, 2026)

```
2b63a84 Fix: Preserve isMember field when reading projects from localStorage
565bf29 Add debug logging to track project disappearance issue
b1f20e5 Default nav to collapsed state
0a9de4a Add collapsible nav sidebar with icon-only mode
674b05b Open chat and expand project after conversion
d714791 Fix: Export convertChatToProject from useChats hook
0378772 Pass projectId to ChatWindow and add debug logging
1d2de57 Pre-link 'New Design System' chat to Arcade project
9276339 Show converted chat in project chat window and fix modal buttons
2c381a7 Fix navigation and collapse Build team by default
0a16dc1 Shorten Arcade title and add purple K icon for Agentic Kanban
5e3c683 Fix: Remove project limit to show all 4 projects
753a9a3 Make Arcade project pre-seeded for safe demo flow
6e81678 Add conversation-to-project conversion flow with Arcade DS demo
```

## Previous Work (Consolidated)

### From feat/project-chat-interactions (merged):
- Projects as Spaces Navigation Architecture
- Computer Agent Weekly Rundown
- Agent Owners with Visual Identity
- Computer Page Rebuild
- Floating Chat Windows
- Send to Timeline
- Arcade Design System Integration
- Canvas Component

**See main branch CLAUDE.md for full historical context.**
