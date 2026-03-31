import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
	ReactFlowProvider,
	type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as React from "react";
import type { EntityCanvasNode } from "~/components/canvas/types";
import {
	useCanvasActions,
	useCanvasEdges,
	useCanvasNodes,
	useCanvasViewport,
} from "~/state/canvas";
import { CanvasToolbar } from "./canvas-toolbar";
import EntityNode, { CanvasContext } from "./entity-node";
import { useLoadLinks } from "./hooks/use-load-links";
import { useCanvasConnect } from "./use-canvas-connect";
import { getClosestHandles } from "./utils/layout";

// ---------------------------------------------------------------------------
// Node types registration (stable reference — defined outside component)
// ---------------------------------------------------------------------------

const nodeTypes = { entityNode: EntityNode };

// ---------------------------------------------------------------------------
// Debounce helper
// ---------------------------------------------------------------------------

function useDebouncedCallback<T extends (...args: never[]) => void>(
	callback: T,
	delay: number,
): T {
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const callbackRef = React.useRef(callback);
	callbackRef.current = callback;

	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return React.useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay],
	) as T;
}

// ---------------------------------------------------------------------------
// Inner canvas (must be inside ReactFlowProvider)
// ---------------------------------------------------------------------------

function CanvasInner({ gameId }: { gameId: string }) {
	const nodes = useCanvasNodes(gameId);
	const edges = useCanvasEdges(gameId);
	const viewport = useCanvasViewport(gameId);
	const { updateNodes, updateEdges, setViewport, setEdge } = useCanvasActions();
	const onConnect = useCanvasConnect(gameId);
	const { loadLinks, loadingNodeId } = useLoadLinks(gameId);

	const debouncedSetViewport = useDebouncedCallback(
		(vp: Viewport) => setViewport(gameId, vp),
		300,
	);

	const onNodeDragStop = React.useCallback(
		(_event: React.MouseEvent, draggedNode: EntityCanvasNode) => {
			for (const edge of edges) {
				if (edge.source !== draggedNode.id && edge.target !== draggedNode.id)
					continue;

				const sourceNode =
					edge.source === draggedNode.id
						? draggedNode
						: nodes.find((n) => n.id === edge.source);
				const targetNode =
					edge.target === draggedNode.id
						? draggedNode
						: nodes.find((n) => n.id === edge.target);

				if (!sourceNode || !targetNode) continue;

				const { sourceHandle, targetHandle } = getClosestHandles(
					sourceNode.position,
					targetNode.position,
				);

				if (
					edge.sourceHandle !== sourceHandle ||
					edge.targetHandle !== targetHandle
				) {
					setEdge(gameId, edge.id, { sourceHandle, targetHandle });
				}
			}
		},
		[nodes, edges, gameId, setEdge],
	);

	const canvasContextValue = React.useMemo(
		() => ({ gameId, loadLinks, loadingNodeId }),
		[gameId, loadLinks, loadingNodeId],
	);

	return (
		<CanvasContext.Provider value={canvasContextValue}>
			<ReactFlow<EntityCanvasNode>
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={(changes) => updateNodes(gameId, changes)}
				onEdgesChange={(changes) => updateEdges(gameId, changes)}
				onConnect={onConnect}
				onNodeDragStop={onNodeDragStop}
				onMoveEnd={(_event, vp) => debouncedSetViewport(vp)}
				defaultViewport={viewport}
				colorMode="dark"
				fitView={
					nodes.length > 0 &&
					viewport.x === 0 &&
					viewport.y === 0 &&
					viewport.zoom === 1
				}
				proOptions={{ hideAttribution: true }}
				minZoom={0.1}
				maxZoom={4}
			>
				<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
				<Controls showInteractive={false} />
				<MiniMap
					pannable
					zoomable
					nodeStrokeWidth={3}
					className="!bg-card !border-border"
				/>
				<CanvasToolbar gameId={gameId} />
			</ReactFlow>
		</CanvasContext.Provider>
	);
}

// ---------------------------------------------------------------------------
// Public component (wraps with ReactFlowProvider)
// ---------------------------------------------------------------------------

export function GameCanvas({ gameId }: { gameId: string }) {
	return (
		<div className="h-full w-full">
			<ReactFlowProvider>
				<CanvasInner gameId={gameId} />
			</ReactFlowProvider>
		</div>
	);
}
