# Chat Feature Testing Guide

## What to Test

### 1. Opening Chats
- [ ] Click "Computer" in Chats section → floating window opens
- [ ] Click "Prithvi, Polina" → different window opens
- [ ] Multiple windows stack horizontally (offset by 420px)

### 2. Sending Messages
- [ ] Type in input field
- [ ] Press Enter → message sends
- [ ] Click send button (↑) → message sends
- [ ] Input clears after sending
- [ ] Message appears as purple bubble on right

### 3. Computer Responses (Computer chat)
- [ ] After sending, "●●●" typing indicator appears
- [ ] Computer responds after ~1-2 seconds
- [ ] Response appears as gray bubble on left
- [ ] Shows "Computer" label above message

### 4. Human Responses (Multi-user chats)
- [ ] Send message in "Prithvi, Polina" chat
- [ ] Mock human response appears after 1-3 seconds
- [ ] Shows participant name above message
- [ ] Random mock response from list

### 5. Window Controls
- [ ] Drag header → window moves
- [ ] Click minimize (−) → becomes tab at bottom
- [ ] Click tab → restores window
- [ ] Click close (×) on window → fully closes
- [ ] Click close (×) on tab → removes from minimized

### 6. New Chat
- [ ] Click "+" button next to "Chats"
- [ ] New chat with Computer appears in list
- [ ] Opens automatically as floating window
- [ ] Can send messages immediately

### 7. Message Display
- [ ] Messages scroll to bottom automatically
- [ ] Long messages wrap properly
- [ ] Empty state shows 💬 and prompt
- [ ] Sender names show for non-user messages

### 8. State Persistence
- [ ] Refresh page → chats persist
- [ ] Messages remain in history
- [ ] Open/closed state resets (expected)

## Quick Test Flow

1. Open http://localhost:5174
2. Click "Computer" in nav
3. Send "Hello!"
4. Wait for Computer response
5. Minimize window
6. Click tab to restore
7. Click "Prithvi, Polina"
8. Send message
9. Wait for human mock response
10. Close both windows

## Expected Behavior

✅ **Computer chat**: AI responses with typing indicator  
✅ **Multi-user chat**: Random mock human responses  
✅ **New chat button**: Creates & opens new Computer chat  
✅ **Drag & minimize**: Smooth transitions  
✅ **Persistence**: Messages survive refresh
