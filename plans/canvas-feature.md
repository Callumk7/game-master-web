# Canvas Feature — Implementation Plan

> **Status:** Planning
> **Created:** 2026-03-30
> **Inspired by:** Obsidian Canvas

## Overview

An infinite canvas view for each game where GMs can visually map out entity relationships.
Users add existing entities as nodes, connect them to create backend links, drag/reposition
freely, and expand the graph by loading an entity's existing links.

## MVP Scope

1. Add entities to the canvas (from existing game entities)
2. Create new links by connecting nodes (persisted to backend)
3. Drag and reposition nodes freely on the infinite canvas
4. Load all existing links for a given node (auto-positioned radially)

## Key Decisions

| Decision               | Choice                                | Rationale                                              |
| ---------------------- | ------------------------------------- | ------------------------------------------------------ |
| Persistence            | localStorage via Zustand `persist`    | Matches todo/initiative pattern; no backend changes    |
| Canvases per game      | One canvas per game                   | Simplest MVP; multi-canvas is a future enhancement     |
| Node content           | Full scrollable `content_plain_text`  | User wants full content; resizable nodes planned later |
| Edge creation UX       | Bare link, no dialog                  | Labels/metadata to be added in a follow-up             |
| Load links positioning | Radial auto-layout around source node | Intuitive visual expansion                             |
| Backend changes        | None required                         | All needed APIs exist already                          |

## Architecture

### Tech Stack (existing)

- **@xyflow/react v12** — already a dependency
- **Zustand v5 + persist** — state management to localStorage
- **Existing API hooks** — `useCreateLink`, `useGameEntities`, `getCharacterLinks`, etc.
- **Existing UI primitives** — `Button`, `Combobox`, `DropdownMenu` from `src/components/ui/`

### File Structure

```
src/
├── state/
│   └── canvas.ts                          # Zustand store with persist middleware
├── components/canvas/
│   ├── index.tsx                           # GameCanvas — main component
│   ├── types.ts                            # Canvas-specific TypeScript types
│   ├── entity-node.tsx                     # Universal entity node component
│   ├── add-entity-popover.tsx              # Entity picker for adding nodes
│   ├── canvas-toolbar.tsx                  # Floating toolbar (add, fit view, clear)
│   ├── node-context-menu.tsx               # Node action menu (load links, remove, view)
│   ├── hooks/
│   │   └── use-load-links.ts              # Fetch & materialize linked entities
│   └── utils/
│       └── layout.ts                       # Radial auto-layout utility
└── routes/_auth/games/$gameId/
    └── canvas.tsx                          # Route file
```

### Modified Files

| File                                              | Change                             |
| ------------------------------------------------- | ---------------------------------- |
| `src/components/layout/game-sidebar/core-nav.tsx` | Add "Canvas" nav item              |
| `src/components/commander.tsx`                    | Add "Open Canvas" command          |
| `src/styles.css`                                  | React Flow dark mode CSS overrides |

---

## Detailed Step-by-Step Plan

### Step 1: Zustand Canvas Store (`src/state/canvas.ts`)

Follows the `src/state/todos.ts` pattern — Zustand with `persist` middleware.

**State shape:**

```ts
{
  canvases: Record<
    string,
    {
      // keyed by gameId
      nodes: Node[];
      edges: Edge[];
      viewport: { x: number; y: number; zoom: number };
    }
  >;
}
```

**Actions:**

- `addNode(gameId, node)` — add a node to a game's canvas
- `removeNode(gameId, nodeId)` — remove node + connected edges
- `updateNodes(gameId, changes)` — apply React Flow `NodeChange[]` (drag, select)
- `addEdge(gameId, edge)` — add an edge
- `removeEdge(gameId, edgeId)` — remove an edge
- `updateEdges(gameId, changes)` — apply React Flow `EdgeChange[]`
- `setViewport(gameId, viewport)` — save pan/zoom state
- `clearCanvas(gameId)` — reset canvas to empty

**Persistence:** `persist({ name: "canvas-storage", partialize: (state) => ({ canvases: state.canvases }) })`

### Step 2: Canvas Types (`src/components/canvas/types.ts`)

```ts
type CanvasNodeData = {
  entityId: string;
  entityType: EntityType;
  name: string;
  contentPlainText?: string;
  metadata?: Record<string, unknown>; // type-specific fields (race, class, level, status, etc.)
};

type EntityCanvasNode = Node<CanvasNodeData, "entityNode">;
```

### Step 3: Entity Node Component (`src/components/canvas/entity-node.tsx`)

Single polymorphic component for all 5 entity types.

- **Color-coded left border** per type: character=blue, faction=purple, location=green, note=amber, quest=red
- **Header:** Lucide type icon (`User`/`Users`/`MapPin`/`FileText`/`Sword`) + entity name
- **Body:** Full `content_plain_text` in a scrollable container (`max-h-60 overflow-y-auto`)
- **Subtitle:** Type-specific metadata (character: race/class/level, quest: status, location: type)
- **Handles:** All 4 sides (Top/Bottom/Left/Right), both source and target
- **Action button:** "..." menu in header → triggers `NodeContextMenu`

Fixed width ~280px. Max height with scroll. Dark-mode-first styling using existing Tailwind tokens.

### Step 4: Load Links Hook (`src/components/canvas/hooks/use-load-links.ts`)

- Imperative fetch via `queryClient.fetchQuery` (on-demand, not on render)
- Dispatches to the correct query based on `entityType` (`getCharacterLinksOptions`, etc.)
- Uses `flattenLinksForTable` from `src/components/links/utils.ts` to normalize the response
- Filters out entities already on the canvas
- Calls `radialLayout()` to position new nodes around source
- Returns `{ loadLinks: () => Promise<{ newNodes, newEdges }>, isLoading }`

### Step 5: Radial Layout Utility (`src/components/canvas/utils/layout.ts`)

```ts
function radialLayout(
  center: { x: number; y: number },
  count: number,
  radius = 250,
): Array<{ x: number; y: number }>;
```

Distributes `count` positions evenly in a circle: `angle = (2π / count) * i`

### Step 6: Node Context Menu (`src/components/canvas/node-context-menu.tsx`)

Uses existing `DropdownMenu` from `src/components/ui/dropdown-menu.tsx`.

Menu items:

- **Load Links** — fetches via `useLoadLinks`, adds results to store
- **View Entity** — navigates to entity detail page
- **Remove from Canvas** — removes node + connected edges from store (no backend delete)

### Step 7: Add Entity Popover (`src/components/canvas/add-entity-popover.tsx`)

- Reuses `useGameEntities` hook (already returns `{ label, value: "type:id", type }[]`)
- Uses existing `Combobox` component
- Filters out entities already on canvas
- On select: resolves `content_plain_text` from `listGameEntities` query cache, creates node at viewport center, dispatches `addNode`

### Step 8: Canvas Toolbar (`src/components/canvas/canvas-toolbar.tsx`)

Floating toolbar (absolute top-left, `z-10`, semi-transparent bg).

Buttons:

- **Add Entity** — opens `AddEntityPopover`
- **Fit View** — `useReactFlow().fitView()`
- **Clear Canvas** — store `clearCanvas` with confirmation toast

### Step 9: Main GameCanvas Component (`src/components/canvas/index.tsx`)

Wraps `ReactFlow` with:

- `nodeTypes = { entityNode: EntityNode }`
- `colorMode="dark"`
- Initial state from Zustand store
- `<Background variant="dots" />`, `<Controls />`, `<MiniMap />`
- `<CanvasToolbar />` as overlay child

**Handlers:**

- `onNodesChange` → store `updateNodes`
- `onEdgesChange` → store `updateEdges`
- `onConnect` → look up source/target entity data from nodes → call `useCreateLink.mutateAsync()` → on success: add edge to store + success toast → on error: error toast, no edge added
- `onMoveEnd` → debounced store `setViewport`

### Step 10: Route File (`src/routes/_auth/games/$gameId/canvas.tsx`)

- `createFileRoute("/_auth/games/$gameId/canvas")`
- No additional loader (parent already prefetches `listGameEntities`)
- Renders `<GameCanvas gameId={gameId} />` in full-height container (no page header — immersive)

### Step 11: Sidebar Navigation

Add to `src/components/layout/game-sidebar/core-nav.tsx`:

- Icon: `Network` from Lucide
- Label: "Canvas"
- Route: `/games/$gameId/canvas`
- Position: after "All Objectives", before "Chat"

### Step 12: Commander Integration

Add to `src/components/commander.tsx`:

- Command: "Open Canvas"
- Icon: `Network`
- Action: navigate to `/games/$gameId/canvas`

### Step 13: Dark Mode Styling

- React Flow 12 `colorMode="dark"` prop
- CSS overrides in `src/styles.css` for React Flow variables to match app design tokens
- Node component uses Tailwind dark-mode tokens (`bg-card`, `border-border`, etc.)

---

## Existing Code Reused (No Changes Needed)

| Code                                           | Used For                                      |
| ---------------------------------------------- | --------------------------------------------- |
| `useGameEntities` hook                         | Entity picker data for add-entity popover     |
| `useCreateLink` hook                           | Backend link creation when connecting nodes   |
| `flattenLinksForTable`                         | Normalizing link responses in load-links hook |
| `Combobox`, `Button`, `DropdownMenu`           | UI primitives                                 |
| `listGameEntities` query                       | Entity data with `content_plain_text`         |
| `getCharacterLinks` / `getFactionLinks` / etc. | Per-entity link fetching                      |

## Future Enhancements (Out of Scope for MVP)

- Multiple canvases per game (server-persisted)
- Resizable nodes
- Edge labels showing `relationship_type`
- Rich text content rendering in nodes (TipTap read-only)
- Drag entity from sidebar onto canvas
- Auto-layout algorithms (force-directed, hierarchical)
- Canvas sharing between game members
- AI-powered canvas suggestions
