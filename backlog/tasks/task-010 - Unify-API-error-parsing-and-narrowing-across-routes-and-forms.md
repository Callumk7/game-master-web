---
id: TASK-010
title: Unify API error parsing and narrowing across routes and forms
status: To Do
assignee: []
created_date: '2026-03-29 18:14'
updated_date: '2026-03-29 18:14'
labels:
  - quality
  - types
  - error-handling
  - api
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Current error utilities mix the generated simple error shape and validation error shape incorrectly, causing broad type guards, noisy type errors, and loss of useful server error messages. Tighten the error contracts so routes, auth flows, and form helpers handle generated API errors predictably and preserve validation details when available.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Shared error formatting accepts both simple API errors and validation errors without unsafe casts
- [ ] #2 User-facing error surfaces preserve field validation details when present and fall back to the server error message otherwise
- [ ] #3 No helper logs raw parsed errors to the console in normal user-facing error paths
- [ ] #4 Error helper utilities distinguish generated simple error responses from validation error responses with correct type guards
- [ ] #5 Current typecheck failures caused by parseApiErrors and isApiError usage in routes, auth flows, and smart-form helpers are resolved
<!-- AC:END -->
