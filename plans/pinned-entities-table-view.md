# Pinned Entities Table View

Add a dedicated table view for pinned entities, reusing the `AllEntitiesTable` component, with a navigation link from the sidebar.

---

## Implementation

### 1. Create route: `src/routes/_auth/games/$gameId/pinned.tsx`

- Use `createFileRoute("/_auth/games/$gameId/pinned")`
- Call `useListPinnedEntitiesSuspenseQuery(gameId)` (from `~/queries/quests`)
- Transform the grouped pinned entities response (`characters`, `factions`, `locations`, `notes`, `quests`) into a flat `AllEntity[]` array — same pattern as `all.tsx`
- Render `<Container>`, `<PageHeader>` (with `Pin` icon, title "Pinned Entities"), and `<AllEntitiesTable>`

### 2. Add sidebar navigation link in `src/components/layout/game-sidebar/pinned-entities.tsx`

- Import `SidebarGroupAction` from `~/components/ui/sidebar`
- Import `ArrowUpRight` from `lucide-react`
- Call `useNavigate()` in the `SidebarPinnedEntities` component
- Add a `<SidebarGroupAction>` with `<ArrowUpRight />` icon next to `<SidebarGroupLabel>` (follows existing pattern in `location-tree.tsx` and `quest-tree.tsx`)
- `onClick` navigates to `/games/$gameId/pinned`

### 3. Regenerate route tree

- Run `pnpm dev` (or TanStack Router codegen) so `src/routeTree.gen.ts` picks up the new `/pinned` route

---

## Verification

- [ ] Run `pnpm dev` to trigger route tree regeneration
- [ ] Run `pnpm typecheck` and `pnpm check` — no errors
- [ ] Manually verify:
  - Navigate to a game
  - Sidebar shows an arrow icon next to "Pinned Entities" label
  - Clicking it navigates to `/games/:gameId/pinned`
  - Table displays only pinned entities
  - Search, type filter, and tag filter all work correctly
