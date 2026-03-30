import type { Edge, Node } from "@xyflow/react";
import type { EntityType } from "~/types";

/**
 * Data payload stored in each canvas node.
 * Captures the essential entity info needed for rendering
 * without coupling to the full API entity types.
 */
export type CanvasNodeData = {
	entityId: string;
	entityType: EntityType;
	name: string;
	contentPlainText?: string;
	/** Type-specific fields (race, class, level, status, locationType, etc.) */
	metadata?: Record<string, unknown>;
};

/** A React Flow node carrying canvas entity data. */
export type EntityCanvasNode = Node<CanvasNodeData, "entityNode">;

/** A React Flow edge on the canvas. */
export type CanvasEdge = Edge;

/** Persisted viewport state for a canvas. */
export type CanvasViewport = {
	x: number;
	y: number;
	zoom: number;
};

/** The serializable state of a single game's canvas. */
export type CanvasGameState = {
	nodes: EntityCanvasNode[];
	edges: CanvasEdge[];
	viewport: CanvasViewport;
};
