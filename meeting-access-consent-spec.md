# Meeting access consent - HITL spec

## Problem statement

The PM agent runs an autonomous hourly workflow that scans meetings modified in the last hour and links them to relevant enhancements/projects. Downstream skills (team briefing, daily snapshot, status updates) need to read linked meeting content. Meetings are private by default - only attendees can access them.

We need a human-in-the-loop experience that:
1. Allows automatic linking (high accuracy, no approval gate).
2. Obtains explicit consent before surfacing meeting *content* to project skills.
3. Gives users visibility and control without creating consent fatigue.

---

## Design principles

- **Auto-link, consent for content.** Linking is metadata (low-risk, correctable). Content access is the real privacy boundary.
- **Any project-member attendee can grant. Revoke always wins.** First grant activates; any attendee can revoke at any time.
- **Progressive trust.** System learns from repeated approvals and offers standing rules for recurring meetings.
- **Graceful degradation.** Skills always run on schedule. Meetings without content access contribute metadata only.

---

## Three-layer model

| Layer                           | What happens                                                                                                      | Consent required?                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Scan** (hourly)               | Execute-as-user reads meeting content, classifies relevance, determines enhancement match.                        | No - org-level platform capability. Content read for classification, never stored or surfaced until consent granted. |
| **Link** (immediate)            | Meeting linked to enhancement. Metadata visible in project timeline (title, participants, time, detected topics). | No - low-risk association. Correctable via unlink.                                                                   |
| **Surface content** (on-demand) | Agent reads transcript/notes to extract decisions, action items, blockers for briefings/snapshots/status updates. | **Yes** - user grants read access per meeting or per series.                                                         |

---

## Consent model

### Who can grant?

Any user who satisfies BOTH:
- Is an **attendee** of the meeting.
- Is a **member** of the project the meeting is linked to.

First eligible person to grant activates content access for that meeting-enhancement pair.

### Who can revoke?

Any user who satisfies the same dual criteria (project member + meeting attendee). **Revoke always wins over grant.** If there's a conflict, privacy prevails.

On revoke:
- Agent drops any extracted content from that meeting (not persisted in snapshot/briefing).
- Meeting stays linked (metadata association is harmless) but treated as "no content access."
- System learns: future similar meetings may be flagged as "may need discussion before granting."

### Who is notified?

| Channel                                | What                                                                          | Purpose                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **DM to each project-member attendee** | Actionable daily digest with grant/unlink/suppress controls.                  | Action surface - personal, private, low-noise.                       |
| **Project multiplayer chat**           | "3 meetings linked today. Content access: pending/granted/revoked by [name]." | Transparency ledger - everyone on the project sees what's happening. |

---

## Daily digest (DM to project-member attendees)

### Default view

Sent once daily (configurable time, default 9am user-local).

```
3 meetings linked to your projects today:

| Meeting              | Linked to         | Topics detected                    |
|----------------------|-------------------|------------------------------------|
| Sprint sync (10am)   | ENH-7047          | API contract, permissions model    |
| Design review (2pm)  | ENH-6332          | Memory retrieval, storage format   |
| Platform align (3pm) | ENH-7047 + 6332   | Agent identity, shared deps        |

To include meeting content in project briefings and status updates:

[Grant access to all]  [Choose per meeting]  [Unlink any]
```

### "Choose per meeting" (expanded view)

Each meeting shown as a card:

```
────────────────────────────────────────────────
Meeting: "Sprint sync" — 10:00am today
Linked to: ENH-7047 (PM Agent)
Why: Discussed API contract for memory retrieval, action items on permission model.
Topics: API contract, single-tenant permissions, meeting artifact pipeline
────────────────────────────────────────────────

  [✅ Grant content access]
  [🔗 Keep linked, no content access]  ← default state
  [❌ Unlink]
  [🚫 Never link this series]
```

### "Unlink any" (correction view)

Same card layout but only shows:
- [❌ Unlink]
- [🚫 Never link this series]

### After actions are taken

Cards collapse to confirmation:

```
✅ "Sprint sync" → content access granted for ENH-7047
🔗 "Design review" → linked, no content access (ENH-6332)
❌ "1:1 with Prithvi" → unlinked from ENH-7047

These choices shape future suggestions.
Manage access anytime from the project's linked meetings view.
```

---

## Project chat notifications (transparency ledger)

Posted to the project multiplayer DM:

**On link (automatic, hourly):**
> 📎 "Sprint sync" (10am, Priyanka + Shivam + Tim) linked to this project. Content access: pending.

**On grant:**
> ✅ Content access granted for "Sprint sync" by Priyanka. Project skills can now read this meeting.

**On revoke:**
> 🔒 Content access revoked for "Sprint sync" by Shivam. Extracted content removed from project memory.

**On unlink:**
> ❌ "1:1 with Prithvi" unlinked from this project by Priyanka.

---

## Progressive trust (standing rules)

### Trigger

After a user grants content access for the same recurring meeting series linked to the same enhancement **3 consecutive times**, offer:

```
You've granted access to "Sprint sync" → ENH-7047 three weeks in a row.
Auto-grant for future instances?

[Yes, auto-grant this series]  [No, keep asking]
```

### Standing rule behavior

- Future instances of that series auto-link AND auto-grant.
- The daily digest skips these meetings (no action needed).
- Project chat still logs them: "📎 Sprint sync auto-linked + access granted (standing rule)."
- User can revoke any individual instance or delete the standing rule from project settings.

### Steady state

Most recurring meetings have standing rules. Daily digest shrinks to only new/ad-hoc meetings. Eventually most users see nothing on most days.

---

## Graceful degradation

| Meeting state | What downstream skills see |
|---------------|---------------------------|
| Linked + content access granted | Full content - extracts decisions, action items, blockers, commitments. |
| Linked + no content access (default) | Metadata only - "meeting occurred, participants X/Y/Z, topics detected from title/description." |
| Unlinked | Meeting does not exist for this project. |

### Impact on skills

| Skill | With content access | Without content access |
|-------|--------------------|-----------------------|
| **Daily snapshot (Skill A)** | Extracts decisions, action items, risks. Full processing. | Logs "meeting occurred" in briefing-log. No content extraction. |
| **Team briefing** | "Sprint sync: decided single-tenant for v1. AI: Shivam to finalize contract by Thursday." | "Sprint sync occurred (Priyanka, Shivam, Tim). Content not available." |
| **Status update draft** | Includes meeting outcomes in progress section. | Notes meeting activity but can't cite specifics. |
| **Meeting prep** | References past meeting decisions and open items. | Can only reference meetings that have content access. |

The degraded output itself is a soft nudge - users see what they're missing and can grant access to enrich future outputs.

---

## Multi-enhancement meetings

When a meeting is relevant to multiple enhancements:

```
────────────────────────────────────────────────
Meeting: "Platform alignment" — 3:00pm today
Suggested links:
  • ENH-7047 (PM Agent) — discussed agent identity model
  • ENH-6332 (Project Memory) — discussed storage API dependency
────────────────────────────────────────────────

  [✅ Grant access for both]
  [Choose per enhancement]
  [❌ Unlink from one or both]
```

Content access is granted per meeting-enhancement pair. A user could grant access for ENH-7047 but not ENH-6332, meaning the same transcript is readable for one project's skills but not the other's.

---

## Non-project attendees

People who attended the meeting but are NOT members of the linked project:
- **V1:** Not notified. Treated like meeting notes being shared by an attendee with their project - a normal activity.
- **V2:** Optional one-time notification: "Content from a meeting you attended is being used for project management on ENH-7047. [Learn more] [Object]." Object = revoke equivalent.

---

## Edge cases

### No project-member attendees

Meeting is linked but no one with dual standing (attendee + project member) exists. Meeting stays in "linked, no content access" state indefinitely. The project lead can manually grant if they join the meeting retroactively or if the meeting's access model is changed.

### User leaves the project

Standing rules created by that user remain active (they were valid at creation time). If the user is no longer a project member, they can no longer grant/revoke for future meetings. Existing grants are not retroactively removed.

### Meeting updated after content access granted

If a meeting's content is edited after access was granted, the agent re-processes on next snapshot run. No re-consent needed - the grant covers the meeting object, not a point-in-time snapshot.

### Conflicting grant and revoke

If User A grants and User B revokes in the same day:
1. Revoke takes effect immediately.
2. Project chat logs both actions with timestamps.
3. Next daily digest for User A notes: "Content access for 'Sprint sync' was revoked by Shivam. [Re-grant] [Discuss]"
4. If grant/revoke ping-pong happens (>2 cycles), escalate to project lead for resolution.

---

## Data model (conceptual)

### Meeting-enhancement link record

```
{
  meeting_id: "don:...:meeting/123",
  enhancement_id: "don:...:enhancement/7047",
  link_status: "active" | "unlinked",
  content_access: "pending" | "granted" | "revoked",
  granted_by: "don:...:devu/565",  // null if pending
  granted_at: "2026-06-08T10:30:00Z",
  revoked_by: null,
  revoked_at: null,
  standing_rule_id: null  // reference if auto-granted
}
```

### Standing rule record

```
{
  id: "rule_001",
  user_id: "don:...:devu/565",
  recurring_meeting_series_id: "series_abc",
  enhancement_id: "don:...:enhancement/7047",
  actions: ["auto_link", "auto_grant_content"],
  created_at: "2026-06-08T...",
  active: true,
  grant_count_before_rule: 3  // how many manual grants triggered the offer
}
```

### Suppression rule record

```
{
  user_id: "don:...:devu/565",
  recurring_meeting_series_id: "series_xyz",
  enhancement_id: "don:...:enhancement/7047",  // null = suppress for all projects
  action: "never_link" | "never_suggest",
  created_at: "2026-06-08T..."
}
```

---

## Implementation phases

### Phase 1: Core consent loop
- Auto-linking (already built).
- Daily digest DM with grant/unlink controls.
- Project chat transparency messages.
- Downstream skills respect content_access state.

### Phase 2: Progressive trust
- Detect recurring series patterns.
- Offer standing rules after 3 consecutive grants.
- Digest filtering (skip auto-granted meetings).

### Phase 3: Refinements
- "Choose per meeting" expanded card view.
- Multi-enhancement meeting handling.
- Conflict resolution (grant/revoke ping-pong escalation).
- Non-project attendee notifications (v2 privacy model).

---

## Open questions

1. **Digest timing:** Fixed daily (9am) or adaptive (after last meeting of the day ends)?
2. **Digest channel:** DM only, or also available as an in-product panel on the project page?
3. **Scan transparency:** Should users be able to see that their meetings were scanned (even before linking)? Or is scan truly invisible infrastructure?
4. **Org admin controls:** Should there be an org-level toggle to disable the hourly scan entirely? Or per-user opt-out of scanning?
5. **Retention:** How long do we keep extracted content from meetings? Should it expire after the project closes?
