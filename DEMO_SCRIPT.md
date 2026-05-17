# Conversation-to-Project Creation Demo Script

## Context

This demo showcases the journey from **ideation with Computer** → **collaborative chat** → **project creation**. The storyline follows the real origin of DevRev's **Arcade Design System**, from Dejan's initial technical concept in January 2026 to the collaborative Design Swarm in February 2026.

---

## Scene 1: Early Ideation - Dejan + Computer

**Goal**: Show individual exploration phase with file creation

### Setup (Pre-seeded)
- Chat titled **"Computer"** with 6 messages
- Just 2 participants: User (Dejan) + Computer
- 5 files already created:
  - `design-system-requirements.md`
  - `headless-components-architecture.md`
  - `token-architecture-proposal.md`
  - `accessibility-checklist.md`
  - `component-api-tdd.md`
- Canvas can be opened to show files
- **NO "Convert to Project" button** (only 2 participants)

### Steps

1. **[MANUAL]** Open "Computer" chat from left nav or minimized tabs
2. **[SEEDED]** Conversation shows:
   - Dejan identifies problem (tight coupling)
   - Computer analyzes and proposes headless architecture
   - Computer creates files as conversation progresses
3. **[MANUAL]** Open Canvas panel (toggle button in header)
4. **[SEEDED]** Canvas shows 5 files in "Shared Generated files"
5. **[MANUAL]** Scroll through conversation
6. **[SEEDED]** Last message: Computer suggests bringing in design team

**What to highlight:**
- Early exploration phase - just Dejan and Computer
- Computer creates technical foundation documents
- Files accumulate in Canvas as ideas develop
- **No Convert button yet** - still individual work

**Narration**: *"This is Dejan's early ideation with Computer. They're exploring the problem and Computer is creating the foundational architecture documents. At this stage, it's individual exploration - no project yet."*

---

---

**Transition**: *"After exploring with Computer, Dejan brings in the team to refine the idea..."*

---

## Scene 2: Collaborative Refinement → Convert to Project

**Goal**: Show team collaboration phase with conversion flow

### Setup (Pre-seeded)
Chat titled **"New Design System"** exists with:
- 8 messages spanning 3 weeks of discussion
- 4 participants: User (Dejan), Computer, Konstantin, Dejan Mesar
- 5 files created by Computer:
  - `design-system-requirements.md`
  - `headless-components-architecture.md`
  - `token-architecture-proposal.md`
  - `accessibility-checklist.md`
  - `component-api-tdd.md`

### Steps

1. **[MANUAL]** Open "New Design System" chat from minimized tabs or Computer page
2. **[SEEDED]** Verify conversation shows:
   - Initial problem discussion (tight coupling)
   - Computer's architectural proposal
   - Collaborators joining (Konstantin, Dejan Mesar)
   - Files visible in Canvas
3. **[SEEDED]** "Convert to Project" button visible in header
   - Button appears because chat has:
     - ✓ 5 files
     - ✓ 4 participants
     - ✓ 8 messages (minimum 5)
4. **[MANUAL]** Click "Convert to Project" button
5. **[SEEDED]** Modal appears showing:
   - **Title**: "New Design System"
   - **Members**: 4 members
   - **Files**: 5 files
   - **Preview**: "This will create a new project..."
6. **[MANUAL]** Click "Create Project" in modal
7. **[SEEDED]** Navigation to `/projects/Project-0004` (pre-seeded Arcade Design System project)
8. **[SEEDED]** Project **"Arcade Design System"** appears in **YOUR PROJECTS** nav
   - Project was pre-seeded on app load (not created dynamically)
   - Nested views visible: Chat, Scope, Timeline, Phases
9. **[SEEDED]** Project page loads showing:
    - 4 milestones: Foundation & Tokens, Core Components, Documentation & Tooling, Rollout & Migration
    - 8 issues assigned to team members and agents (Computer, Claude)
    - Health status: on-track
10. **[SEEDED]** Original chat remains open/minimized
    - Chat now has `projectId` linked to Project-0004

**What to highlight:**
- Conditional button (only appears when chat is "project-ready")
- Smooth transition from chat → modal → project
- Conversion links chat to existing Arcade project (pre-seeded for demo safety)
- Chat stays accessible after conversion (marked with `projectId`)
- Project was already in navigation (pre-seeded on load)

---

## Storyline Context (Optional Narration)

> "This is based on the real origin of Arcade Design System. In January 2026, Dejan identified that DevRev's design system was too tightly coupled to the app theme. He started a conversation with Computer to explore a headless architecture. Computer created the initial technical documents - requirements, architecture proposals, token system. As the idea matured, key collaborators like Konstantin and Dejan Mesar joined to refine the token architecture and typography system. By February, during Design Swarm '26, the team locked in major decisions and the project became 'Arcade Design System' - a three-year foundational redesign of DevRev's product experience."

---

## Technical Notes

### Seed Data Location
- **Chat seed**: `src/lib/demoConversionSeed.js`
  - `createEarlyIdeationChat()` → 2-person chat with Computer (no convert button)
  - `createArcadeOriginChat()` → 4-person collaborative chat (shows convert button)
- **Project seed**: `src/lib/issuesSeed.js` → `createInitialProjects()` includes Project-0004
- **Issues seed**: `src/lib/issuesSeed.js` → Issues 0017-0024 for Project-0004

### Integration
Seed data is loaded in `src/context/IssuesContext.jsx`:
```js
import { createEarlyIdeationChat, createArcadeOriginChat } from '../lib/demoConversionSeed'

function createInitialChats() {
  return [
    createEarlyIdeationChat(),  // 2 participants, no button
    createArcadeOriginChat(),   // 4 participants, has button
  ]
}
```

### Conversion Behavior
The "New Design System" chat is pre-linked to Project-0004:
- Chat already has `projectId: "Project-0004"` in seed data
- Arcade Design project chat shows this conversation immediately
- "Convert to Project" button still works but just navigates (already linked)
- No dynamic project creation (safe for repeated demos)

### Conversion Eligibility Criteria
From `src/lib/chatHelpers.js`:
```js
export function isChatReadyForProject(chat) {
  return (
    chat.files && chat.files.length > 0 &&           // Has files
    chat.participants && chat.participants.length >= 2 && // Has collaborators
    chat.messages && chat.messages.length >= 5       // Sufficient conversation
  )
}
```

### File Display
- **Before conversion**: Files show in Canvas panel
- **After conversion**: Canvas hidden for project (per requirements)
- Files remain linked via `chat.files` array

---

## Expected Outcomes

✅ Early ideation chat shows NO convert button (2 participants)  
✅ Collaborative chat shows "Convert to Project" button (4 participants)  
✅ Canvas shows files in both chats  
✅ Modal shows accurate preview (4 members, 5 files)  
✅ Conversion navigates to pre-seeded "Arcade Design System" project  
✅ Project already visible in YOUR PROJECTS nav (pre-seeded)  
✅ Project shows 4 milestones and 8 issues (pre-seeded)  
✅ Chat marked with `projectId` after conversion  
✅ State persists across refresh (localStorage)  
✅ Safe to run demo multiple times (no duplicate project creation)

---

## Fallback & Edge Cases

**If button doesn't appear:**
- Check console for errors
- Verify chat has files: `chat.files.length > 0`
- Verify participants: `chat.participants.length >= 2`
- Verify messages: `chat.messages.length >= 5`

**If modal doesn't open:**
- Check `showConversionModal` state in ComputerPage
- Verify ProjectConversionModal component imported

**If project doesn't appear in nav:**
- Check `isMember: true` on created project
- Verify NavPanel filtering logic: `projects.filter(p => p.isMember)`
- Hard refresh to clear stale localStorage

**If navigation fails:**
- Check route: `/projects/Project-0004`
- Verify AppWorkspaceLayout handles post-conversion navigation

---

## Demo Tips

1. **Pacing**: Pause after each major action (open chat, click convert, confirm modal) so audience sees each state
2. **Narration**: Explain the problem being solved ("tight coupling") and the solution ("headless components")
3. **Authenticity**: Mention this is based on real DevRev project history
4. **Interactivity**: Show clicking through project → issues → milestones after creation
5. **Persistence**: Refresh page to show localStorage persistence

---

## Future Enhancements (Not in MVP)

- [ ] AI summarization of chat before conversion (Phase 2)
- [ ] Multi-select messages for batch posting (Phase 3)
- [ ] Branch Out Topic interaction for creating sub-projects
- [ ] Timeline integration showing chat history as project events
- [ ] Canvas panel accessible after conversion (toggle per project)
