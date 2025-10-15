import * as React from "react";
import type { Connection, NodePosition, ViewTransform } from "~/lib/node-viewer";

interface CanvasNodeMapProps {
	nodes: NodePosition[];
	connections: Connection[];
	transform: ViewTransform;
	onTransformChange: (transform: ViewTransform) => void;
	onNodeClick: (nodeId: string) => void;
	height?: number;
}

// D&D themed colors matching your CSS variables
const NODE_COLORS = {
	character: "#6366f1", // Indigo - matches chart-1
	faction: "#a855f7",   // Purple - matches chart-2  
	location: "#10b981",  // Emerald - matches chart-4
	quest: "#f59e0b",     // Amber/gold - matches chart-3
	note: "#ef4444",      // Red - matches chart-5
} as const;

const NODE_COLORS_DARK = {
	character: "#818cf8", // Lighter indigo
	faction: "#c084fc",   // Lighter purple
	location: "#34d399",  // Lighter emerald
	quest: "#fbbf24",     // Brighter gold
	note: "#f87171",      // Lighter red
} as const;

export function CanvasNodeMap({
	nodes,
	connections,
	transform,
	onTransformChange,
	onNodeClick,
	height,
}: CanvasNodeMapProps) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
	const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
	const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });

	// Check if dark mode is active
	const isDarkMode = document.documentElement.classList.contains("dark");
	const nodeColors = isDarkMode ? NODE_COLORS_DARK : NODE_COLORS;

	// Update canvas size when container resizes or height prop changes
	React.useEffect(() => {
		const updateSize = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setCanvasSize({
					width: rect.width,
					height: height || rect.height,
				});
			}
		};

		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, [height]);

	// Canvas coordinate conversion helpers
	const screenToWorld = React.useCallback(
		(screenX: number, screenY: number) => {
			return {
				x: (screenX - transform.x) / transform.scale,
				y: (screenY - transform.y) / transform.scale,
			};
		},
		[transform],
	);

	// Removed unused worldToScreen helper

	// Find node at screen coordinates
	const getNodeAtPosition = React.useCallback(
		(screenX: number, screenY: number): NodePosition | null => {
			const worldPos = screenToWorld(screenX, screenY);

			for (const node of nodes) {
				const dx = worldPos.x - node.x;
				const dy = worldPos.y - node.y;
				const nodeSize = Math.max(
					8,
					Math.min(20, 8 + node.connectionCount * 1.5),
				);
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance <= nodeSize) {
					return node;
				}
			}
			return null;
		},
		[nodes, screenToWorld],
	);

	// Render the canvas
	const render = React.useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size and clear
		canvas.width = canvasSize.width;
		canvas.height = canvasSize.height;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Apply transform
		ctx.save();
		ctx.translate(transform.x, transform.y);
		ctx.scale(transform.scale, transform.scale);

		// Render connections first (behind nodes)
		ctx.strokeStyle = isDarkMode ? "#6b7280" : "#9ca3af"; // gray-500/400
		connections.forEach((connection) => {
			const fromNode = nodes.find((n) => n.id === connection.from);
			const toNode = nodes.find((n) => n.id === connection.to);

			if (!fromNode || !toNode) return;

			const opacity = connection.strength
				? Math.min(connection.strength / 5, 0.8)
				: 0.4;
			const strokeWidth = connection.strength
				? Math.min(connection.strength, 3)
				: 1.5;

			ctx.globalAlpha = opacity;
			ctx.lineWidth = strokeWidth;
			ctx.beginPath();
			ctx.moveTo(fromNode.x, fromNode.y);
			ctx.lineTo(toNode.x, toNode.y);
			ctx.stroke();
		});

		ctx.globalAlpha = 1.0;

		// Render nodes
		nodes.forEach((node) => {
			const nodeSize = Math.max(8, Math.min(20, 8 + node.connectionCount * 1.5));
			const isHovered = hoveredNodeId === node.id;

			// Hover background
			if (isHovered) {
				ctx.fillStyle = isDarkMode 
					? "rgba(74, 222, 128, 0.3)" 
					: "rgba(34, 197, 94, 0.3)"; // green accent
				ctx.beginPath();
				ctx.arc(node.x, node.y, nodeSize + 4, 0, 2 * Math.PI);
				ctx.fill();
			}

			// Main node circle
			ctx.fillStyle =
				nodeColors[node.type as keyof typeof nodeColors] || nodeColors.note;
			ctx.strokeStyle = isDarkMode ? "#1f2937" : "#ffffff"; // background color
			ctx.lineWidth = 2;
			if (isHovered) ctx.lineWidth = 4;

			ctx.beginPath();
			ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		});

		// Render labels
		ctx.fillStyle = isDarkMode ? "#f9fafb" : "#111827"; // foreground colors
		ctx.font = `${Math.max(8, 10 / transform.scale)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		nodes.forEach((node) => {
			const nodeSize = Math.max(8, Math.min(20, 8 + node.connectionCount * 1.5));
			const text =
				node.name.length > 15 ? `${node.name.slice(0, 15)}...` : node.name;

			if (hoveredNodeId === node.id) {
				ctx.fillStyle = isDarkMode ? "#fbbf24" : "#d97706"; // gold/amber - matches your theme
			} else {
				ctx.fillStyle = isDarkMode ? "#f9fafb" : "#111827";
			}

			ctx.fillText(text, node.x, node.y + nodeSize + 16);
		});

		ctx.restore();
	}, [
		nodes,
		connections,
		transform,
		canvasSize,
		hoveredNodeId,
		nodeColors,
		isDarkMode,
	]);

	// Render on every update
	React.useEffect(() => {
		render();
	}, [render]);

	// Mouse event handlers
	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;

			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const node = getNodeAtPosition(x, y);

			if (node) {
				onNodeClick(node.id);
			} else {
				setIsDragging(true);
				setDragStart({ x: e.clientX, y: e.clientY });
			}
		},
		[getNodeAtPosition, onNodeClick],
	);

	const handleMouseMove = React.useCallback(
		(e: React.MouseEvent) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;

			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			if (isDragging) {
				const dx = e.clientX - dragStart.x;
				const dy = e.clientY - dragStart.y;
				onTransformChange({
					...transform,
					x: transform.x + dx,
					y: transform.y + dy,
				});
				setDragStart({ x: e.clientX, y: e.clientY });
			} else {
				// Update hover state
				const node = getNodeAtPosition(x, y);
				setHoveredNodeId(node?.id || null);
			}
		},
		[isDragging, dragStart, transform, onTransformChange, getNodeAtPosition],
	);

	const handleMouseUp = React.useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleWheel = React.useCallback(
		(e: WheelEvent) => {
			e.preventDefault();
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const newScale = Math.max(0.2, Math.min(3, transform.scale * scaleFactor));

			onTransformChange({
				x:
					transform.x -
					(mouseX - transform.x) * (newScale / transform.scale - 1),
				y:
					transform.y -
					(mouseY - transform.y) * (newScale / transform.scale - 1),
				scale: newScale,
			});
		},
		[transform, onTransformChange],
	);

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.addEventListener("wheel", handleWheel);
	}, [handleWheel]);

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full bg-muted/20"
			style={{ cursor: isDragging ? "grabbing" : "grab" }}
		>
			<canvas
				ref={canvasRef}
				width={canvasSize.width}
				height={canvasSize.height}
				className="absolute inset-0"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			/>
		</div>
	);
}
