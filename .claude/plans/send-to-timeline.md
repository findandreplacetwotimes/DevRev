# Send to Timeline Feature - Implementation Plan

## Context

The project chat currently has ephemeral messages that disappear when users navigate away. Important discussions, decisions, and updates get lost. This feature allows users to capture meaningful chat messages and post them to the project's persistent timeline for future reference.

**Why this change:** Teams need to preserve important discussions from chat. The timeline provides a central history of project events, but currently only shows placeholder data. By connecting chat to timeline, we create a bridge between real-time collaboration and permanent record-keeping.

**Current State:**
- Timeline UI exists with full styling (HistoryItem.jsx, DocumentHistoryPlaceholder.jsx)
- Timeline shows hardcoded placeholder data
- Chat messages are session-only (component state)
- No connection between chat and timeline

**Desired Outcome:**
Users can hover over any chat message → click "Post to Timeline" → message appears in project History tab as a timeline event.

---

## Implementation Approach

### Phase 1: MVP - Single Message Posting (Start Here)

Start simple: Add a hover action to each message that posts it directly to timeline without AI processing.

#### 1.1 Add History Data Structure to Projects

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/context/IssuesContext.jsx`

- Add `history: []` field to default project structure in `DEFAULT_ISSUES_DATA`
- Update `patchProject` to handle history updates
- History event structure:
  ```javascript
  {
    id: `evt-${Date.now()}`,
    timestamp: { datePart: "May 8,", timePart: "11:30 AM" }, // Match HistoryItem format
    actorInitial: "M", // Current user (hardcode for MVP, use real user later)
    type: "detail",
    attribute: "Discussion",
    detail: messageText // The actual chat message content
  }
  ```

#### 1.2 Replace Timeline Placeholder with Real Data

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/DocumentHistoryPlaceholder.jsx`

- Accept `history` prop from parent (default to null)
- If `history` array has items, render real events instead of placeholder
- If `history` is empty/null, show placeholder (existing behavior)
- Use existing `HistoryTimelineGroup` and `HistoryDetailItem` components

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/ProjectPage.jsx`

- Pass `project.history` to `<DocumentHistoryPlaceholder history={project.history} />`

#### 1.3 Add Message Hover Action

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/MessageBubble.jsx`

- Add `onPostToTimeline` callback prop
- Add hover state management
- Show small button on hover with timeline icon (use existing Icon component)
- Button positioned top-right of message bubble
- Only show for `type="groupPerson"` in project chat (not user's own messages)

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/ChatWindow.jsx`

- Pass `onPostToTimeline` handler to MessageBubble
- Handler creates history event and calls `patchProject`
- Need access to current projectId - accept as prop from parent
- Show success toast/notification after posting (simple text: "Posted to timeline")

#### 1.4 Connect ProjectId to Chat

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/AppWorkspaceLayout.jsx`

- Extract current projectId from route when on `/projects/:projectId`
- Pass projectId to ChatWindow when `chatVariant === "chat-project"`
- ChatWindow can then use projectId in `onPostToTimeline` handler

#### 1.5 Format Timestamp Helper

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/lib/timelineHelpers.js` (new file)

Create helper to format Date to timeline format:
```javascript
export function formatTimelineTimestamp(date) {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  const datePart = isToday ? "today," : date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }) + ","
  
  const timePart = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  return { datePart, timePart }
}
```

---

### Phase 2: AI Summarization (Later Enhancement)

Once MVP works, add Computer summarization:

#### 2.1 Add Summary Dialog

**File:** `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/SummarizeDialog.jsx` (new)

- Modal overlay with message preview + AI-generated summary
- Editable textarea for summary
- Uses existing `getAiResponse` from `aiClient.js`
- Prompt: "Summarize this project message in 1-2 sentences"

#### 2.2 Update Message Action Flow

- Change hover action to open SummarizeDialog instead of direct post
- Dialog shows Computer-generated summary
- User can edit before posting
- Fallback: if AI fails, show textarea with original message as placeholder

---

### Phase 3: Multi-Message Selection (Future)

Once single-message works, extend to multiple:

#### 3.1 Add Selection State
- Checkbox on hover for each message
- `selectedMessageIds` Set in ChatWindow state
- Visual highlight for selected messages

#### 3.2 Floating Action Bar
- Appears at bottom when messages selected
- "Post X messages to Timeline" button
- Summarizes entire selection into one timeline event

---

## Critical Files to Modify

1. `/Users/prithvi/os/dev/cherny-projects-prototype/src/context/IssuesContext.jsx` - Add history field
2. `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/MessageBubble.jsx` - Add hover action
3. `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/ChatWindow.jsx` - Handle posting logic
4. `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/DocumentHistoryPlaceholder.jsx` - Accept real data
5. `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/ProjectPage.jsx` - Pass history prop
6. `/Users/prithvi/os/dev/cherny-projects-prototype/src/components/AppWorkspaceLayout.jsx` - Pass projectId
7. `/Users/prithvi/os/dev/cherny-projects-prototype/src/lib/timelineHelpers.js` - New file for timestamp formatting

---

## Verification Plan

### Step 1: Test Data Persistence
1. Open browser to http://localhost:5174
2. Navigate to Projects → Any project
3. Add manual history event via browser console to verify structure
4. Check History tab shows event
5. Refresh page - verify event persists (localStorage)

### Step 2: Test Message Posting
1. Navigate to Projects → Any project → Click "Discuss"
2. Hover over Computer's weekly rundown message
3. Verify "Post to Timeline" button appears
4. Click button
5. Verify success notification appears
6. Navigate to History tab
7. Verify message appears as timeline event with proper formatting

### Step 3: Test Edge Cases
1. Post multiple messages in sequence
2. Verify timeline shows events in chronological order (newest first)
3. Verify timestamp grouping works (messages from same time grouped)
4. Test with different chat variants (should only work in project chat)
5. Test with long messages (verify detail text wraps properly)

### Step 4: Visual Verification
1. Compare timeline styling with placeholder examples
2. Verify actor initials display correctly
3. Verify timestamps format properly ("today," vs "May 8,")
4. Verify hover action doesn't interfere with message readability

---

## Technical Notes

**State Management:**
- Use existing IssuesContext flow for consistency
- History stored in project object, persisted via patchProject
- Chat messages remain ephemeral (only posted items persist)

**Timeline Event Format:**
- Use `type: "detail"` for multi-line chat messages
- `attribute: "Discussion"` distinguishes from other event types
- Actor initial hardcoded as "M" for MVP (improve later)

**Reuse Existing Patterns:**
- Timeline UI components already exist (HistoryItem.jsx)
- Timestamp component already exists (Timestamp.jsx)  
- Icon component for hover button (Icon.jsx)
- Toast notifications exist (check existing notification patterns)

**Performance:**
- No API calls for MVP (localStorage only)
- Minimal re-renders (only ChatWindow and ProjectPage affected)
- History array grows linearly (acceptable for prototype)

---

## Future Enhancements

1. **User Attribution:** Replace hardcoded "M" with real current user initial
2. **AI Summarization:** Add Computer-generated summaries (Phase 2)
3. **Multi-Message Selection:** Select and summarize multiple messages (Phase 3)
4. **Metadata Linking:** Store source message IDs for "view in chat" feature
5. **Timeline Filtering:** Filter history by event type (transitions vs discussions)
6. **Rich Formatting:** Preserve @mentions, links, formatting in timeline
7. **Undo Posting:** Allow users to delete timeline events they just posted
