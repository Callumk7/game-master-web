import type { Connection } from "@xyflow/react";
import * as React from "react";
import { toast } from "sonner";
import { useCreateLink } from "~/components/links/hooks/useCreateLink";
import { useCanvasActions, useCanvasEdges, useCanvasNodes } from "~/state/canvas";
import { showErrorToast } from "~/utils/show-error-toast";

/**
 * Returns an `onConnect` handler for the GameCanvas ReactFlow component.
 *
 * When the user draws an edge between two entity nodes the handler:
 * 1. Looks up entityType + entityId from the source & target node data in the store
 * 2. Checks whether an equivalent edge already exists (either direction)
 * 3. Optimistically adds the edge to the canvas immediately
 * 4. Calls the backend via `useCreateLink` to persist the link
 * 5. On success – shows a success toast
 * 6. On error – removes the optimistic edge and shows an error toast
 */
export function useCanvasConnect(gameId: string) {
	const nodes = useCanvasNodes(gameId);
	const edges = useCanvasEdges(gameId);
	const { addEdge, removeEdge } = useCanvasActions();

	const createLink = useCreateLink();

	// Keep latest refs so the callback is stable but always reads fresh state
	const nodesRef = React.useRef(nodes);
	nodesRef.current = nodes;
	const edgesRef = React.useRef(edges);
	edgesRef.current = edges;

	const onConnect = React.useCallback(
		async (connection: Connection) => {
			const { source, target, sourceHandle, targetHandle } = connection;

			// ------------------------------------------------------------------
			// 1. Look up node data
			// ------------------------------------------------------------------
			const sourceNode = nodesRef.current.find((n) => n.id === source);
			const targetNode = nodesRef.current.find((n) => n.id === target);

			if (!sourceNode || !targetNode) {
				toast.error("Could not resolve the connected nodes");
				return;
			}

			const {
				entityType: sourceType,
				entityId: sourceId,
				name: sourceName,
			} = sourceNode.data;
			const {
				entityType: targetType,
				entityId: targetId,
				name: targetName,
			} = targetNode.data;

			// ------------------------------------------------------------------
			// 2. Duplicate edge prevention (check both directions)
			// ------------------------------------------------------------------
			const isDuplicate = edgesRef.current.some(
				(e) =>
					(e.source === source && e.target === target) ||
					(e.source === target && e.target === source),
			);

			if (isDuplicate) {
				toast.info("These entities are already linked on the canvas");
				return;
			}

			// ------------------------------------------------------------------
			// 3. Optimistically add edge to canvas
			// ------------------------------------------------------------------
			const edgeId = `${source}-${target}`;

			addEdge(gameId, {
				id: edgeId,
				source,
				target,
				sourceHandle: sourceHandle ?? undefined,
				targetHandle: targetHandle ?? undefined,
			});

			// ------------------------------------------------------------------
			// 4. Persist to backend — roll back on failure
			// ------------------------------------------------------------------
			try {
				await createLink.mutateAsync({
					gameId,
					sourceType,
					sourceId,
					entity_type: targetType,
					entity_id: targetId,
				});

				toast.success("Link created", {
					description: `${sourceName} ↔ ${targetName}`,
				});
			} catch (error) {
				removeEdge(gameId, edgeId);
				showErrorToast(error, "Unable to create link");
			}
		},
		[gameId, addEdge, removeEdge, createLink],
	);

	return onConnect;
}
