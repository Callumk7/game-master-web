import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
	useCanvasActions,
	useCanvasEdges,
	useCanvasNodes,
	useCanvasViewport,
} from "~/state/canvas";

export const Route = createFileRoute("/_auth/games/$gameId/canvas-demo")({
	component: CanvasDemoPage,
});

function CanvasDemoPage() {
	const { gameId } = Route.useParams();
	const nodes = useCanvasNodes(gameId);
	const edges = useCanvasEdges(gameId);
	const viewport = useCanvasViewport(gameId);
	const {
		addNode,
		removeNode,
		updateNodes,
		addEdge,
		removeEdge,
		updateEdges,
		setViewport,
		clearCanvas,
	} = useCanvasActions();

	const [log, setLog] = React.useState<string[]>([]);
	const append = (msg: string) =>
		setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

	const nodeCounter = React.useRef(0);

	const handleAddNode = () => {
		const i = nodeCounter.current++;
		const node = {
			id: `demo-node-${i}`,
			type: "entityNode" as const,
			position: { x: i * 50, y: i * 50 },
			data: {
				entityId: `entity-${i}`,
				entityType: "character" as const,
				name: `Character ${i}`,
				contentPlainText: `This is demo content for character ${i}.`,
				metadata: { race: "Elf", class: "Wizard", level: i + 1 },
			},
		};
		addNode(gameId, node);
		append(`addNode → ${node.id}`);
	};

	const handleRemoveFirstNode = () => {
		if (nodes.length === 0) {
			append("removeNode → no nodes to remove");
			return;
		}
		const id = nodes[0].id;
		removeNode(gameId, id);
		append(`removeNode → ${id}`);
	};

	const handleUpdateNodes = () => {
		if (nodes.length === 0) {
			append("updateNodes → no nodes to update");
			return;
		}
		const target = nodes[0];
		const newX = target.position.x + 100;
		const newY = target.position.y + 50;
		updateNodes(gameId, [
			{
				id: target.id,
				type: "position",
				position: { x: newX, y: newY },
			},
		]);
		append(`updateNodes → moved ${target.id} to (${newX}, ${newY})`);
	};

	const handleAddEdge = () => {
		if (nodes.length < 2) {
			append("addEdge → need at least 2 nodes");
			return;
		}
		const source = nodes[0].id;
		const target = nodes[nodes.length - 1].id;
		const edgeId = `edge-${source}-${target}`;

		if (edges.some((e) => e.id === edgeId)) {
			append(`addEdge → edge ${edgeId} already exists`);
			return;
		}

		addEdge(gameId, { id: edgeId, source, target });
		append(`addEdge → ${edgeId}`);
	};

	const handleRemoveFirstEdge = () => {
		if (edges.length === 0) {
			append("removeEdge → no edges to remove");
			return;
		}
		const id = edges[0].id;
		removeEdge(gameId, id);
		append(`removeEdge → ${id}`);
	};

	const handleUpdateEdges = () => {
		if (edges.length === 0) {
			append("updateEdges → no edges to update");
			return;
		}
		// Toggle selection on first edge
		updateEdges(gameId, [
			{
				id: edges[0].id,
				type: "select",
				selected: !edges[0].selected,
			},
		]);
		append(
			`updateEdges → toggled selection on ${edges[0].id} → ${!edges[0].selected}`,
		);
	};

	const handleSetViewport = () => {
		const newViewport = {
			x: viewport.x + 100,
			y: viewport.y + 50,
			zoom: Math.min(viewport.zoom + 0.25, 3),
		};
		setViewport(gameId, newViewport);
		append(
			`setViewport → x:${newViewport.x} y:${newViewport.y} zoom:${newViewport.zoom}`,
		);
	};

	const handleClearCanvas = () => {
		clearCanvas(gameId);
		append("clearCanvas → done");
	};

	return (
		<div className="p-6 space-y-6 max-w-4xl">
			<h1 className="text-2xl font-bold">Canvas Store Demo</h1>
			<p className="text-sm text-muted-foreground">
				Game ID: <code className="text-xs">{gameId}</code> — Reload the page to
				verify localStorage persistence.
			</p>

			{/* Action buttons */}
			<div className="flex flex-wrap gap-2">
				<Button onClick={handleAddNode}>addNode</Button>
				<Button onClick={handleRemoveFirstNode} variant="outline">
					removeNode (first)
				</Button>
				<Button onClick={handleUpdateNodes} variant="outline">
					updateNodes (move first)
				</Button>
				<Button onClick={handleAddEdge}>addEdge</Button>
				<Button onClick={handleRemoveFirstEdge} variant="outline">
					removeEdge (first)
				</Button>
				<Button onClick={handleUpdateEdges} variant="outline">
					updateEdges (select first)
				</Button>
				<Button onClick={handleSetViewport} variant="outline">
					setViewport
				</Button>
				<Button onClick={handleClearCanvas} variant="destructive">
					clearCanvas
				</Button>
			</div>

			{/* Current state */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="space-y-2">
					<h2 className="text-sm font-semibold">Nodes ({nodes.length})</h2>
					<pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
						{JSON.stringify(nodes, null, 2)}
					</pre>
				</div>
				<div className="space-y-2">
					<h2 className="text-sm font-semibold">Edges ({edges.length})</h2>
					<pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
						{JSON.stringify(edges, null, 2)}
					</pre>
				</div>
				<div className="space-y-2">
					<h2 className="text-sm font-semibold">Viewport</h2>
					<pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
						{JSON.stringify(viewport, null, 2)}
					</pre>
				</div>
			</div>

			{/* Action log */}
			<div className="space-y-2">
				<h2 className="text-sm font-semibold">Action Log</h2>
				<div className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 font-mono space-y-0.5">
					{log.length === 0 ? (
						<span className="text-muted-foreground">
							No actions yet — click buttons above
						</span>
					) : (
						log.map((entry, i) => <div key={`${entry}-${i}`}>{entry}</div>)
					)}
				</div>
			</div>
		</div>
	);
}
