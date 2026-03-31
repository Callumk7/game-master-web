import type { EdgeChange, NodeChange } from "@xyflow/react";
import { applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	CanvasEdge,
	CanvasGameState,
	CanvasViewport,
	EntityCanvasNode,
} from "~/components/canvas/types";

// ---------------------------------------------------------------------------
// Default state for a new canvas
// ---------------------------------------------------------------------------

const defaultCanvasState: CanvasGameState = {
	nodes: [],
	edges: [],
	viewport: { x: 0, y: 0, zoom: 1 },
};

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface State {
	canvases: Record<string, CanvasGameState>;
}

interface Actions {
	/** Ensure a canvas exists for a game, returning its current state. */
	getCanvas: (gameId: string) => CanvasGameState;

	/** Add a node to a game's canvas. */
	addNode: (gameId: string, node: EntityCanvasNode) => void;

	/** Remove a node and all its connected edges. */
	removeNode: (gameId: string, nodeId: string) => void;

	/** Apply React Flow NodeChange[] (drag, select, etc.). */
	updateNodes: (gameId: string, changes: NodeChange<EntityCanvasNode>[]) => void;

	/** Add an edge to a game's canvas. */
	addEdge: (gameId: string, edge: CanvasEdge) => void;

	/** Remove a single edge by id. */
	removeEdge: (gameId: string, edgeId: string) => void;

	/** Update properties of a single edge in-place. */
	setEdge: (gameId: string, edgeId: string, patch: Partial<CanvasEdge>) => void;

	/** Apply React Flow EdgeChange[]. */
	updateEdges: (gameId: string, changes: EdgeChange<CanvasEdge>[]) => void;

	/** Save viewport (pan / zoom) state. */
	setViewport: (gameId: string, viewport: CanvasViewport) => void;

	/** Reset a game's canvas to empty. */
	clearCanvas: (gameId: string) => void;
}

export type CanvasStore = State & {
	actions: Actions;
};

// ---------------------------------------------------------------------------
// Helper — get or initialise a game canvas
// ---------------------------------------------------------------------------

function ensureCanvas(
	canvases: Record<string, CanvasGameState>,
	gameId: string,
): CanvasGameState {
	return canvases[gameId] ?? { ...defaultCanvasState, nodes: [], edges: [] };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useCanvasStore = create<CanvasStore>()(
	persist(
		(set, get) => ({
			canvases: {},
			actions: {
				getCanvas: (gameId: string) => {
					return ensureCanvas(get().canvases, gameId);
				},

				addNode: (gameId: string, node: EntityCanvasNode) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								nodes: [...canvas.nodes, node],
							},
						},
					});
				},

				removeNode: (gameId: string, nodeId: string) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								nodes: canvas.nodes.filter((n) => n.id !== nodeId),
								edges: canvas.edges.filter(
									(e) => e.source !== nodeId && e.target !== nodeId,
								),
							},
						},
					});
				},

				updateNodes: (
					gameId: string,
					changes: NodeChange<EntityCanvasNode>[],
				) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								nodes: applyNodeChanges(changes, canvas.nodes),
							},
						},
					});
				},

				addEdge: (gameId: string, edge: CanvasEdge) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								edges: [...canvas.edges, edge],
							},
						},
					});
				},

				removeEdge: (gameId: string, edgeId: string) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								edges: canvas.edges.filter((e) => e.id !== edgeId),
							},
						},
					});
				},

				setEdge: (gameId: string, edgeId: string, patch: Partial<CanvasEdge>) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								edges: canvas.edges.map((e) =>
									e.id === edgeId ? { ...e, ...patch } : e,
								),
							},
						},
					});
				},

				updateEdges: (gameId: string, changes: EdgeChange<CanvasEdge>[]) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								edges: applyEdgeChanges(changes, canvas.edges),
							},
						},
					});
				},

				setViewport: (gameId: string, viewport: CanvasViewport) => {
					const canvas = ensureCanvas(get().canvases, gameId);
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...canvas,
								viewport,
							},
						},
					});
				},

				clearCanvas: (gameId: string) => {
					set({
						canvases: {
							...get().canvases,
							[gameId]: {
								...defaultCanvasState,
								nodes: [],
								edges: [],
							},
						},
					});
				},
			},
		}),
		{
			name: "canvas-storage",
			partialize: (state) => ({ canvases: state.canvases }),
		},
	),
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Get the full canvas state for a game. */
export const useCanvasState = (gameId: string) =>
	useCanvasStore((state) => state.canvases[gameId] ?? defaultCanvasState);

/** Get just the nodes for a game's canvas. */
export const useCanvasNodes = (gameId: string) =>
	useCanvasStore((state) => (state.canvases[gameId] ?? defaultCanvasState).nodes);

/** Get just the edges for a game's canvas. */
export const useCanvasEdges = (gameId: string) =>
	useCanvasStore((state) => (state.canvases[gameId] ?? defaultCanvasState).edges);

/** Get the viewport for a game's canvas. */
export const useCanvasViewport = (gameId: string) =>
	useCanvasStore((state) => (state.canvases[gameId] ?? defaultCanvasState).viewport);

/** Get all canvas actions. */
export const useCanvasActions = () => useCanvasStore((state) => state.actions);
