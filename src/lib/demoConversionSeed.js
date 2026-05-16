/**
 * Demo seed data for conversation-to-project conversion flow
 * Based on the actual Arcade Design System origin story (January-February 2026)
 */

/**
 * Early ideation chat - just Dejan + Computer exploring the problem
 * Shows file creation in real-time. Canvas has files but no Convert button
 * (only 2 participants - needs more people for conversion)
 */
export function createEarlyIdeationChat() {
  const chatId = "chat-early-ideation"
  const now = Date.now()

  return {
    id: chatId,
    title: "Design System Architecture",
    participants: ["user", "computer"],
    participantAvatars: [
      { id: "user", initials: "PS", color: "#4CAF50" },
      { id: "computer", initials: "C", color: "#6366F1" },
    ],
    messages: [
      {
        id: `${chatId}-msg-1`,
        senderId: "user",
        text: "We need to talk about the design system. The current setup is too tightly coupled to DevRev App's theme. Every time we try to use components in Portal or new surfaces, we're either duplicating code or fighting with overrides.",
        timestamp: now - (19 * 24 * 60 * 60 * 1000),
      },
      {
        id: `${chatId}-msg-2`,
        senderId: "computer",
        text: "I analyzed the design-system codebase. Key finding: components have hardcoded theme tokens and styling assumptions. This makes them nearly impossible to reuse across different visual contexts.\n\nI recommend a headless architecture: separate behavior from presentation completely. Let me create a requirements document.",
        timestamp: now - (19 * 24 * 60 * 60 * 1000) + (5 * 60 * 1000),
      },
      {
        id: `${chatId}-msg-3`,
        senderId: "user",
        text: "Yes, that's exactly what I was thinking. Components provide structure and accessibility, themes provide the visual layer. Can you draft the architecture?",
        timestamp: now - (18 * 24 * 60 * 60 * 1000),
      },
      {
        id: `${chatId}-msg-4`,
        senderId: "computer",
        text: "Done. I've created three foundational documents:\n\n1. Requirements doc with problem statement\n2. Headless components architecture with API patterns\n3. Token architecture proposal (4-layer system)\n\nThe key insight: semantic tokens (background-success, foreground-error) are much better for AI consumption than arbitrary CSS.",
        timestamp: now - (18 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000),
      },
      {
        id: `${chatId}-msg-5`,
        senderId: "user",
        text: "This looks solid. Can you also add an accessibility checklist? We need WCAG 2.2 AA compliance.",
        timestamp: now - (17 * 24 * 60 * 60 * 1000),
      },
      {
        id: `${chatId}-msg-6`,
        senderId: "computer",
        text: "Added accessibility-checklist.md with WCAG 2.2 AA targets and ARIA patterns. Also created the full technical design doc with component API specs, ThemeProvider design, and testing utilities.\n\nNext step: should we bring in the design team to refine the visual language?",
        timestamp: now - (16 * 24 * 60 * 60 * 1000),
      },
    ],
    files: [
      {
        id: `${chatId}-file-1`,
        name: "design-system-requirements.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-2`,
        name: "headless-components-architecture.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-3`,
        name: "token-architecture-proposal.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-4`,
        name: "accessibility-checklist.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-5`,
        name: "component-api-tdd.md",
        icon: "📄",
      },
    ],
    createdAt: now - (19 * 24 * 60 * 60 * 1000),
    lastActivity: now - (16 * 24 * 60 * 60 * 1000),
    projectId: null,
  }
}

/**
 * Collaborative chat - Dejan + Computer + team members refining the idea
 * This chat represents the mature collaboration phase after the early ideation.
 * Ready to convert to project (has 4 participants, files, conversation)
 */
export function createArcadeOriginChat() {
  const chatId = "chat-arcade-origin"
  const now = Date.now()

  return {
    id: chatId,
    title: "Arcade Design System",
    participants: ["user", "computer", "konstantin-dziuin", "dejan-mesar"],
    participantAvatars: [
      { id: "user", initials: "PS", color: "#4CAF50" },
      { id: "computer", initials: "C", color: "#6366F1" },
      { id: "konstantin-dziuin", initials: "KD", color: "#FF9800" },
      { id: "dejan-mesar", initials: "DM", color: "#2196F3" },
    ],
    messages: [
      {
        id: `${chatId}-msg-1`,
        senderId: "user",
        text: "We need to talk about the design system. The current setup is too tightly coupled to DevRev App's theme. Every time we try to use components in Portal or new surfaces, we're either duplicating code or fighting with overrides. It's slowing us down.",
        timestamp: now - (19 * 24 * 60 * 60 * 1000), // 19 days ago (Jan 8 equivalent)
      },
      {
        id: `${chatId}-msg-2`,
        senderId: "computer",
        text: "I analyzed the design-system codebase. Key finding: components have hardcoded theme tokens and styling assumptions. This makes them nearly impossible to reuse across different visual contexts. Accessibility is also inconsistent - each component implements ARIA differently.\n\nI recommend a headless architecture: separate behavior from presentation completely.",
        timestamp: now - (19 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000), // 2 hours later
      },
      {
        id: `${chatId}-msg-3`,
        senderId: "user",
        text: "That's exactly what I was thinking. Components provide structure, accessibility, and interaction patterns. Themes provide the visual layer. That way Computer surfaces, Portal, DevRev App - they all use the same foundation but look different.",
        timestamp: now - (18 * 24 * 60 * 60 * 1000), // Next day (Jan 9)
      },
      {
        id: `${chatId}-msg-4`,
        senderId: "computer",
        text: "Perfect direction. I'm seeing three layers:\n1. Raw/headless components - pure behavior + accessibility\n2. Theme provider - injects styling via className injection\n3. Token system - semantic tokens that map to visual primitives\n\nThis also solves the AI consumption problem. I can understand semantic tokens (background-success, foreground-error) much better than arbitrary CSS.\n\nI'll draft the technical architecture now.",
        timestamp: now - (18 * 24 * 60 * 60 * 1000) + (30 * 60 * 1000), // 30 min later
      },
      {
        id: `${chatId}-msg-5`,
        senderId: "user",
        text: "Yes! And we need this done right because it's a 3-year foundation. Focus on composability, accessibility (WCAG 2.2 AA), and making sure we can ship this as OSS eventually. Can you create the requirements and initial architecture docs?",
        timestamp: now - (15 * 24 * 60 * 60 * 1000), // Jan 12
      },
      {
        id: `${chatId}-msg-6`,
        senderId: "computer",
        text: "Done. I've created:\n• Requirements document with problem statement and goals\n• Headless components architecture with API patterns\n• Token architecture proposal (4-layer system)\n• Accessibility checklist with WCAG 2.2 AA targets\n• Full technical design doc with ThemeProvider API\n\nKey decisions in the TDD: component API (className, component, drid props), slot system for composition, CVA-based theme provider, and automated testing utilities. Ready for review.",
        timestamp: now - (15 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours later
      },
      {
        id: `${chatId}-msg-7`,
        senderId: "konstantin-dziuin",
        text: "This is solid. The 4-layer token architecture makes sense: core → generative → semantic → component. We should lock this down during the design swarm next month.",
        timestamp: now - (10 * 24 * 60 * 60 * 1000), // Feb 1
      },
      {
        id: `${chatId}-msg-8`,
        senderId: "dejan-mesar",
        text: "Agreed. Typography system looks good too - Editorial + System tracks will work well. Let's finalize the visual language during the swarm and get everyone aligned on the direction.",
        timestamp: now - (10 * 24 * 60 * 60 * 1000) + (1 * 60 * 60 * 1000), // 1 hour later
      },
      {
        id: `${chatId}-msg-9`,
        senderId: "konstantin-dziuin",
        text: "I also added the color tokens and spacing scale. We now have semantic naming for all primitives - backgrounds, foregrounds, borders, and state colors. This should give us full coverage across light and dark themes.",
        timestamp: now - (9 * 24 * 60 * 60 * 1000), // Feb 2
      },
      {
        id: `${chatId}-msg-10`,
        senderId: "user",
        text: "Perfect. So we have the full technical foundation documented, token architecture defined, and component API patterns ready. This is turning into a substantial effort.",
        timestamp: now - (9 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000), // 2 hours later
      },
      {
        id: `${chatId}-msg-11`,
        senderId: "dejan-mesar",
        text: "Agreed. We should convert this to a tracked project now. We need proper milestones, sprint planning, and coordination across Design and Platform teams. This is too big to keep as an ad-hoc discussion.",
        timestamp: now - (9 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000), // 3 hours later
      },
      {
        id: `${chatId}-msg-12`,
        senderId: "computer",
        text: "I can help structure this as a project. Based on our artifacts and discussion, I suggest these milestones:\n1. Foundation & Tokens (semantic color system, spacing, typography)\n2. Core Components (Button, Input, Select, Avatar)\n3. Documentation & Tooling (Storybook, accessibility testing)\n4. Rollout & Migration (migration guide, codemods)\n\nWe have all the artifacts ready. Should I convert this chat to a project?",
        timestamp: now - (9 * 24 * 60 * 60 * 1000) + (3.5 * 60 * 60 * 1000), // 3.5 hours later
      },
    ],
    files: [
      {
        id: `${chatId}-file-1`,
        name: "design-system-requirements.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-2`,
        name: "headless-components-architecture.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-3`,
        name: "token-architecture-proposal.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-4`,
        name: "accessibility-checklist.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-5`,
        name: "component-api-tdd.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-6`,
        name: "color-tokens.json",
        icon: "🎨",
      },
      {
        id: `${chatId}-file-7`,
        name: "spacing-scale.json",
        icon: "📐",
      },
      {
        id: `${chatId}-file-8`,
        name: "component-api.md",
        icon: "📄",
      },
      {
        id: `${chatId}-file-9`,
        name: "theme-provider-spec.md",
        icon: "📄",
      },
    ],
    createdAt: now - (19 * 24 * 60 * 60 * 1000),
    lastActivity: now - (9 * 24 * 60 * 60 * 1000) + (3.5 * 60 * 60 * 1000),
    projectId: "Project-0004", // Pre-linked to Arcade Design project
  }
}

/**
 * Project that will be created from the chat conversion
 * This represents the "Arcade Design System" project as it would appear
 * after the planning phase and Design Swarm '26
 */
export function createArcadeProject() {
  return {
    id: "Project-0004",
    title: "Arcade Design System",
    description: "Building a comprehensive, accessible design system to unify DevRev's product experience. Includes semantic tokens, reusable components, documentation, and migration tooling for product teams.",
    team: "Design",
    ownerId: "sophia-walker",
    dueDateId: "endOfNextWeek",
    sprint: "",
    stage: "in-progress",
    healthId: "on-track",
    isMember: true,
    createdDate: "2026-02-18", // When "Arcade" name was adopted
    history: [
      {
        id: "timeline-arcade-1",
        type: "discussion",
        timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
        author: "Dejan",
        content: "Kicked off Design Swarm '26 - converging on visual language and token architecture",
      },
    ],
    milestones: [
      {
        id: "Project-0004:m1",
        title: "Foundation & Tokens",
        dueDateId: "endOfWeek",
        healthId: "on-track",
      },
      {
        id: "Project-0004:m2",
        title: "Core Components",
        dueDateId: "endOfNextWeek",
        healthId: "on-track",
      },
      {
        id: "Project-0004:m3",
        title: "Documentation & Tooling",
        dueDateId: null,
        healthId: "at-risk",
      },
      {
        id: "Project-0004:m4",
        title: "Rollout & Migration",
        dueDateId: null,
        healthId: "at-risk",
      },
    ],
  }
}

/**
 * Issues for the Arcade Design System project
 * These represent the initial work breakdown after the planning phase
 */
export function createArcadeIssues() {
  return [
    {
      id: "Issue-0017",
      team: "Design",
      title: "Define semantic color tokens for light/dark modes",
      description: "Establish color primitives and semantic naming convention for background, text, border, and accent tokens. Support both light and dark themes.",
      ownerId: "sophia-walker",
      dueDateId: "today",
      projectId: "Project-0004",
      milestoneId: "Project-0004:m1",
      sprint: "Sprint 1",
      stage: "in-progress",
      priority: "P0",
      createdDate: "2026-02-20",
    },
    {
      id: "Issue-0018",
      team: "Design",
      title: "Build spacing and typography scale",
      description: "Define 4px grid spacing tokens and type scale with Editorial + System tracks. Custom font weights: 440, 540, 660.",
      ownerId: "claude",
      dueDateId: "tomorrow",
      projectId: "Project-0004",
      milestoneId: "Project-0004:m1",
      sprint: "Sprint 1",
      stage: "in-progress",
      priority: "P0",
      createdDate: "2026-02-20",
    },
    {
      id: "Issue-0019",
      team: "Platform",
      title: "Build Button component with variants",
      description: "Implement headless Button component with primary, secondary, tertiary variants. Support start/end slots, polymorphic component prop, and full ARIA compliance.",
      ownerId: "lucas-rodriguez",
      dueDateId: "endOfWeek",
      projectId: "Project-0004",
      milestoneId: "Project-0004:m2",
      sprint: "Sprint 2",
      stage: "triage",
      priority: "P0",
      createdDate: "2026-02-22",
    },
    {
      id: "Issue-0020",
      team: "Platform",
      title: "Create Input and Select form components",
      description: "Form components with consistent focus states, validation styling, and accessibility attributes. Support controlled/uncontrolled modes.",
      ownerId: "noah-anderson",
      dueDateId: "endOfWeek",
      projectId: "Project-0004",
      milestoneId: "Project-0004:m2",
      sprint: "Sprint 2",
      stage: "triage",
      priority: "P1",
      createdDate: "2026-02-22",
    },
    {
      id: "Issue-0021",
      team: "Design",
      title: "Design Avatar component with agent support",
      description: "Avatar variants for users and AI agents (Computer, Claude). Brand color backgrounds (#6366F1, #CC785C) with logo rendering.",
      ownerId: "ava-martinez",
      dueDateId: "endOfNextWeek",
      projectId: "Project-0004",
      milestoneId: "Project-0004:m2",
      sprint: "Sprint 3",
      stage: "no-stage",
      priority: "P1",
      createdDate: "2026-02-25",
    },
    {
      id: "Issue-0022",
      team: "Core",
      title: "Set up Storybook with Arcade tokens",
      description: "Configure Storybook environment with design tokens and create component stories template. Document anatomy, variants, modifiers, and slots.",
      ownerId: "computer",
      dueDateId: null,
      projectId: "Project-0004",
      milestoneId: "Project-0004:m3",
      sprint: "Sprint 3",
      stage: "no-stage",
      priority: "P1",
      createdDate: "2026-03-01",
    },
    {
      id: "Issue-0023",
      team: "Platform",
      title: "Set up accessibility testing framework",
      description: "Integrate axe-core and establish automated a11y checks for all components in CI pipeline. Target: WCAG 2.2 AA compliance.",
      ownerId: "isabella-davis",
      dueDateId: null,
      projectId: "Project-0004",
      milestoneId: "Project-0004:m3",
      sprint: "Sprint 4",
      stage: "no-stage",
      priority: "P2",
      createdDate: "2026-03-01",
    },
    {
      id: "Issue-0024",
      team: "Growth",
      title: "Create migration guide from DLS",
      description: "Document component mappings, breaking changes, and codemods for teams migrating from legacy design system to Arcade.",
      ownerId: "mia-thompson",
      dueDateId: null,
      projectId: "Project-0004",
      milestoneId: "Project-0004:m4",
      sprint: "Sprint 5",
      stage: "no-stage",
      priority: "P2",
      createdDate: "2026-03-05",
    },
  ]
}

/**
 * Issue-to-project-milestone mapping for Arcade issues
 */
export const ARCADE_ISSUE_PROJECT_MILESTONE = {
  "Issue-0017": { projectId: "Project-0004", milestoneId: "Project-0004:m1" },
  "Issue-0018": { projectId: "Project-0004", milestoneId: "Project-0004:m1" },
  "Issue-0019": { projectId: "Project-0004", milestoneId: "Project-0004:m2" },
  "Issue-0020": { projectId: "Project-0004", milestoneId: "Project-0004:m2" },
  "Issue-0021": { projectId: "Project-0004", milestoneId: "Project-0004:m2" },
  "Issue-0022": { projectId: "Project-0004", milestoneId: "Project-0004:m3" },
  "Issue-0023": { projectId: "Project-0004", milestoneId: "Project-0004:m3" },
  "Issue-0024": { projectId: "Project-0004", milestoneId: "Project-0004:m4" },
}
