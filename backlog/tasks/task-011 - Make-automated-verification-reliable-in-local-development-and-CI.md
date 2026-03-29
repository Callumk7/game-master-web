---
id: TASK-011
title: Make automated verification reliable in local development and CI
status: To Do
assignee: []
created_date: '2026-03-29 18:14'
labels:
  - quality
  - testing
  - tooling
  - developer-experience
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The repository currently has no visible test suite coverage, and the Vitest startup path is coupled to the full Vite plugin stack in a way that prevents tests from starting cleanly in this environment. Establish a reliable verification baseline so tests can run predictably and catch regressions in shared routes, state, and utility code.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The test command runs successfully without requiring Vite or Cloudflare runtime behavior that is unrelated to the unit test environment
- [ ] #2 A dedicated Vitest setup or configuration isolates test execution from production-only or dev-server-only plugins as needed
- [ ] #3 At least a small initial test suite covers shared utility or state logic that is currently unprotected
- [ ] #4 The project documentation or package scripts make the intended local verification workflow clear
- [ ] #5 The verification baseline includes typecheck, lint, and test commands that can be run intentionally during task work
<!-- AC:END -->
