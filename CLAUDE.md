# DevRev Project Chat Prototype

## Project Overview

React + Tailwind project management app with AI-powered chat capabilities. Building collaborative project chat features with agent integration and hierarchical navigation.

## Current Work: Navigation Hierarchy & Agent Integration (feat/nav-hierarchy)

### Recently Completed (May 10-12, 2026)

#### 1. Projects as Spaces Navigation Architecture ✅
- **YOUR PROJECTS** section in left nav (positioned above YOUR TEAMS)
- Projects with `isMember: true` appear as expandable space items (like teams)
- Each project space shows nested views:
  - **Project chat** - with chat toggle icon showing open/closed state
  - **Scope** - project main page (renamed from "Main page")
  - Execution Timeline (disabled/placeholder)
  - Release Phases (disabled/placeholder)
- Dynamic project routing: `/projects/:id` with chat variants
- Removed "Discuss" button from project headers (chat access via nav)

#### 2. Computer Agent Weekly Rundown ✅
- Cherry-picked from `feat/project-chat-interactions` branch
- Posts **"Weekly Project Rundown"** proactively in **Agentic Kanban** project chat only
- Triggers 2 seconds after opening project-Project-0001 chat
- Mock analytics: completion %, issues closed, blockers, days to milestone, status
- @mention detection for Computer (@computer, @agent, @AI)

#### 3. Agent Owners with Visual Identity ✅
- Added **Computer** and **Claude** as assignable owners
- `isAgent: true` flag in owner schema
- **Visual Identity:**
  - **Computer**: Purple circle (#6366F1) with white two-bar logo (8x6px)
  - **Claude**: Orange/coral circle (#CC785C) with gradient app icon (12x12px)
- Applied to OwnerSelector and MenuItem components
- 5 issues in Agentic Kanban assigned to agents:
  - Computer: Issues 0002, 0008, 0015 (test coverage, search optimization, telemetry)
  - Claude: Issues 0005, 0013 (table spacing, design tokens)

### Technical Implementation

**Files Modified:**
- `src/components/NavPanel.jsx` - Project spaces, YOUR PROJECTS section
- `src/components/ChatWindow.jsx` - Agent rundown, project chat routing
- `src/components/AppWorkspaceLayout.jsx` - Project ID extraction from routes
- `src/components/OwnerSelector.jsx` - Agent avatar rendering
- `src/components/MenuItem.jsx` - Agent icons in dropdowns
- `src/lib/owners.js` - Agent owners data
- `src/lib/issuesSeed.js` - Agent-assigned issues
- `public/icons/claude-logo.png` - Official Claude app icon

**Key Patterns:**
- Agent detection: `owner.isAgent ?? false`
- Project chat variant: `project-${projectId}` (e.g., `project-Project-0001`)
- Dynamic chat meta from route matching
- Conditional icon rendering based on `agentId`

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

## Data Model

### Projects
```js
{
  id: "Project-0001",
  title: "Agentic Kanban",
  isMember: true, // Shows in YOUR PROJECTS nav
  milestones: [...],
  healthId: "on-track"
}
```

### Owners
```js
{
  id: "computer",
  name: "Computer",
  isAgent: true // Triggers logo rendering
}
```

### Issues
- `ownerId` can reference human or agent owners
- Agents appear in owner selector with branded avatars

## Environment

- Dev server: `npm run dev` (http://localhost:5173)
- Storybook: `npm run storybook`
- AI calls currently client-side (prototype; move to backend for production)

## Branch Strategy

- **feat/nav-hierarchy** (current) - Projects as spaces, agent integration
- **feat/project-chat-interactions** - Send to Timeline feature (Phase 1 complete)
- **main** - Production stable

## Next Steps

1. Test Agentic Kanban project chat with Computer agent rundown
2. Verify agent logos render correctly in owner selectors and tables
3. Consider expanding agent rundowns to other projects
4. Merge nav-hierarchy work into main when ready
5. Future: Branch Out Topic Interaction, enhanced Send to Timeline (Phases 2-3)

## Known Issues

- Browser KV storage may have cached old project data without `isMember` field
  - Solution: Hard refresh (Cmd+Shift+R) or clear localStorage for localhost:5173
- Agent rundown only posts in project-Project-0001 (by design for now)
