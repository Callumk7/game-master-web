import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
	getCharacterLinksOptions,
	getFactionLinksOptions,
	getLocationLinksOptions,
	getNoteLinksOptions,
	getQuestLinksOptions,
} from "~/api/@tanstack/react-query.gen";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { useCanvasActions, useCanvasEdges, useCanvasNodes } from "~/state/canvas";
import type { EntityType } from "~/types";
import type { CanvasNodeData, EntityCanvasNode } from "../types";
import { getClosestHandles, radialLayout } from "../utils/layout";

// ---------------------------------------------------------------------------
// Map linked entity → canvas node data
// ---------------------------------------------------------------------------

function linkedEntityToNodeData(
	entityId: string,
	entityType: EntityType,
	name: string,
	contentPlainText?: string,
): CanvasNodeData {
	return {
		entityId,
		entityType,
		name,
		contentPlainText,
	};
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Imperative hook that fetches all existing links for a given canvas node,
 * filters out entities already on the canvas, positions new nodes in a
 * radial layout, and adds them (with edges) to the canvas store.
 */
export function useLoadLinks(gameId: string) {
	const queryClient = useQueryClient();
	const nodes = useCanvasNodes(gameId);
	const edges = useCanvasEdges(gameId);
	const { addNode, addEdge } = useCanvasActions();

	const [loadingNodeId, setLoadingNodeId] = React.useState<string | null>(null);

	// Refs so the callback reads fresh state without re-creating
	const nodesRef = React.useRef(nodes);
	nodesRef.current = nodes;
	const edgesRef = React.useRef(edges);
	edgesRef.current = edges;

	const loadLinks = React.useCallback(
		async (nodeId: string) => {
			const sourceNode = nodesRef.current.find((n) => n.id === nodeId);
			if (!sourceNode) return;

			const { entityType, entityId, name: sourceName } = sourceNode.data;

			setLoadingNodeId(nodeId);

			try {
				// ---------------------------------------------------------------
				// 1. Fetch links via queryClient.fetchQuery (imperative, on-demand)
				// ---------------------------------------------------------------
				const response = await fetchLinksForEntity(
					queryClient,
					gameId,
					entityType,
					entityId,
				);

				if (!response) {
					toast.info("No links found", {
						description: `${sourceName} has no linked entities.`,
					});
					return;
				}

				// ---------------------------------------------------------------
				// 2. Flatten the response using the shared utility
				// ---------------------------------------------------------------
				const allLinks = flattenLinksForTable(response as GenericLinksResponse);

				// ---------------------------------------------------------------
				// 3. Filter out entities already on canvas
				// ---------------------------------------------------------------
				const onCanvasIds = new Set(
					nodesRef.current.map(
						(n) => `${n.data.entityType}:${n.data.entityId}`,
					),
				);

				const newLinks = allLinks.filter(
					(link) => !onCanvasIds.has(`${link.type}:${link.id}`),
				);

				if (newLinks.length === 0) {
					toast.info("All links already on canvas", {
						description: `Every entity linked to ${sourceName} is already visible.`,
					});
					return;
				}

				// ---------------------------------------------------------------
				// 4. Compute radial positions around the source node
				// ---------------------------------------------------------------
				const positions = radialLayout(sourceNode.position, newLinks.length);

				// ---------------------------------------------------------------
				// 5. Add new nodes and edges to the canvas store
				// ---------------------------------------------------------------
				const existingEdgeKeys = new Set(
					edgesRef.current.map((e) => `${e.source}|${e.target}`),
				);

				for (let i = 0; i < newLinks.length; i++) {
					const link = newLinks[i];
					const pos = positions[i];

					const newNodeId = `${link.type}-${link.id}`;
					const nodeData = linkedEntityToNodeData(
						link.id,
						link.type,
						link.name,
						link.content_plain_text,
					);

					const newNode: EntityCanvasNode = {
						id: newNodeId,
						type: "entityNode",
						position: pos,
						data: nodeData,
					};

					addNode(gameId, newNode);

					// Create edge between source and new node (skip if exists)
					const edgeKey = `${nodeId}|${newNodeId}`;
					const reverseKey = `${newNodeId}|${nodeId}`;
					if (
						!existingEdgeKeys.has(edgeKey) &&
						!existingEdgeKeys.has(reverseKey)
					) {
						const { sourceHandle, targetHandle } = getClosestHandles(
							sourceNode.position,
							pos,
						);

						addEdge(gameId, {
							id: `${nodeId}-${newNodeId}`,
							source: nodeId,
							target: newNodeId,
							sourceHandle,
							targetHandle,
						});
						existingEdgeKeys.add(edgeKey);
					}
				}

				toast.success(`Loaded ${newLinks.length} linked entities`, {
					description: `Expanded links for ${sourceName}.`,
				});
			} catch (error) {
				toast.error("Failed to load links", {
					description:
						error instanceof Error
							? error.message
							: "An unknown error occurred.",
				});
			} finally {
				setLoadingNodeId(null);
			}
		},
		[gameId, queryClient, addNode, addEdge],
	);

	return { loadLinks, loadingNodeId };
}

// ---------------------------------------------------------------------------
// Per-entity-type fetch dispatcher
// ---------------------------------------------------------------------------

async function fetchLinksForEntity(
	queryClient: ReturnType<typeof useQueryClient>,
	gameId: string,
	entityType: EntityType,
	entityId: string,
) {
	switch (entityType) {
		case "character":
			return queryClient.fetchQuery(
				getCharacterLinksOptions({
					path: { game_id: gameId, character_id: entityId },
				}),
			);
		case "faction":
			return queryClient.fetchQuery(
				getFactionLinksOptions({
					path: { game_id: gameId, faction_id: entityId },
				}),
			);
		case "location":
			return queryClient.fetchQuery(
				getLocationLinksOptions({
					path: { game_id: gameId, location_id: entityId },
				}),
			);
		case "note":
			return queryClient.fetchQuery(
				getNoteLinksOptions({
					path: { game_id: gameId, note_id: entityId },
				}),
			);
		case "quest":
			return queryClient.fetchQuery(
				getQuestLinksOptions({
					path: { game_id: gameId, quest_id: entityId },
				}),
			);
		default:
			throw new Error(`Unsupported entity type: ${entityType}`);
	}
}
