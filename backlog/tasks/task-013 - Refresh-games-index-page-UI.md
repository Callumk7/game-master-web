---
id: TASK-013
title: Refresh games index page UI
status: In Progress
assignee:
  - '@codex'
created_date: '2026-03-29 18:41'
updated_date: '2026-03-29 18:41'
labels:
  - frontend
  - ux
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The games index currently renders a basic grid of cards with minimal hierarchy and a very plain empty state. Improve it into a more intentional landing page for a user's campaigns, with clearer structure, stronger visual treatment, and a more obvious path to create or open a game.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The games index includes a clear page header with supporting copy and a prominent primary action for creating a game
- [ ] #2 Existing games are displayed in a more polished responsive layout with stronger hierarchy than the current plain card grid
- [ ] #3 Each game card preserves a clear click target to open the game and handles longer content without making the grid feel noisy
- [ ] #4 The empty state is upgraded to feel intentional and gives the user a direct path to create their first game
- [ ] #5 The refreshed page continues to handle loading and error-adjacent states cleanly and remains usable on mobile and desktop
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review the current games index route, related components, and any existing layout patterns or reusable UI primitives that should shape the redesign.
2. Define the updated page structure for populated, empty, and error-adjacent states, including header content, create-game CTA placement, and card hierarchy.
3. Implement the refreshed games index UI in the existing route/component structure, keeping navigation behavior intact while improving spacing, typography, and responsiveness.
4. Verify the page on mobile and desktop breakpoints and sanity-check the data, error messaging, and empty-state behavior before marking acceptance criteria complete.
<!-- SECTION:PLAN:END -->
