---
id: TASK-012
title: Gate development-only devtools out of production bundles
status: To Do
assignee: []
created_date: '2026-03-29 18:14'
labels:
  - quality
  - performance
  - frontend
  - tooling
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The root application shell currently mounts React Query and TanStack Router devtools unconditionally. That adds avoidable bundle weight and runtime work in production. Limit devtools to development-only code paths so production builds ship only user-facing functionality.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 React Query devtools are not mounted in production runtime paths
- [ ] #2 TanStack Router devtools are not mounted in production runtime paths
- [ ] #3 Development builds still provide the existing devtools workflow for debugging
- [ ] #4 Any implementation used to gate devtools avoids pulling unnecessary devtools code into the production client bundle
- [ ] #5 Production build output remains successful after the gating change
<!-- AC:END -->
