/** Paired demo copy for title + body (dev tasks). */
const SAMPLES = [
  {
    title: "Harden idempotency key handling in webhook worker",
    body: `Ship a small change set that makes our webhook ingestion idempotent end-to-end: dedupe by delivery id, persist a short-lived fingerprint, and return 200 on replays without double side effects.

Add structured logs with correlation ids, a metric for duplicate deliveries, and a feature flag so we can roll back quickly if queues back up.`,
  },
  {
    title: "Cut p95 for saved-views query on large accounts",
    body: `Investigate the slow path in saved-views: confirm whether we are missing an index, doing an N+1 fetch, or pulling too many columns for the list surface.

Prototype a narrower projection + cursor pagination, validate with EXPLAIN on staging data, and document the safe rollout plan (including cache invalidation and backfill steps).`,
  },
  {
    title: "Fix mobile keyboard overlap on comment composer",
    body: `Reproduce on iOS Safari and Android Chrome: when the keyboard opens, the composer should remain visible and the primary actions should stay reachable.

Prefer CSS-first fixes (dvh, scroll-padding) before JS listeners; add a regression test in Storybook and capture a short screen recording for QA sign-off.`,
  },
  {
    title: "Add circuit breaker for third-party geocode provider",
    body: `We have intermittent 429/5xx spikes that cascade into user-facing timeouts. Add a breaker with sensible thresholds, jittered backoff, and a degraded UX path.

Include an alert when open > 5 minutes, plus a runbook entry for on-call with the kill switch and fallback behavior.`,
  },
  {
    title: "Unflake Playwright suite for invite flow",
    body: `The invite flow test fails ~3% of the time due to racey assertions around toast dismissal and network idle.

Stabilize by waiting on explicit UI signals, stub network deterministically, and split the scenario into two smaller tests so failures pinpoint the broken step.`,
  },
  {
    title: "Document macro dispatch + subtype validation contract",
    body: `Write a concise internal doc describing accepted macro shapes, validation errors, and example payloads. Link it from the API reference and add two golden fixtures.

Goal: reduce back-and-forth in reviews and make invalid subtype failures actionable for integrators.`,
  },
]

export function getRandomDevTaskSample() {
  return SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
}
