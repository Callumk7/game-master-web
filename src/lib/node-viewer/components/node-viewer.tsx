import * as React from "react";
import { Card } from "~/components/ui/card";
import { cn } from "~/utils/cn";
import { useForceSimulation } from "../hooks/use-force-simulation";
import type {
	Connection,
	ForceSimulationConfig,
	GenericNode,
	NodePosition,
	NodeTypeConfig,
	ViewTransform,
} from "../types";
import { CanvasNodeMap } from "./canvas-node-map";
import { Controls } from "./controls";
import { SvgNodeRenderer } from "./svg-node-renderer";

const DEFAULT_CONFIG: ForceSimulationConfig = {
	repulsionStrength: 15000,
	attractionStrength: 15,
	centerForceStrength: 10,
	targetLinkLength: 150,
	linkFlexibility: 0.5,
	unconnectedNodeRepulsion: 2.0,
	repulsionCutoffDistance: 200,
	simulationWidth: 3200,
	simulationHeight: 2400,
};

export interface NodeViewerProps<T> {
	data: T;
	nodeExtractor: (data: T) => {
		nodes: Map<string, GenericNode>;
		connections: Connection[];
	};
	nodeTypeConfig: NodeTypeConfig;
	onNodeClick?: (nodeId: string, node: NodePosition) => void;
	className?: string;
	height?: number;
	showControls?: boolean;
	initialConfig?: Partial<ForceSimulationConfig>;
}

export function NodeViewer<T>({
	data,
	nodeExtractor,
	nodeTypeConfig,
	onNodeClick,
	className,
	height = 384,
	showControls = true,
	initialConfig = {},
}: NodeViewerProps<T>) {
	const [config, setConfig] = React.useState<ForceSimulationConfig>({
		...DEFAULT_CONFIG,
		...initialConfig,
	});
	const [performanceMonitoring, setPerformanceMonitoring] = React.useState(false);

	const { nodes, connections, isRunning, restart } = useForceSimulation(
		data,
		nodeExtractor,
		config,
		performanceMonitoring,
	);

	const svgRef = React.useRef<SVGSVGElement>(null);
	const [transform, setTransform] = React.useState<ViewTransform>({
		x: 0,
		y: 0,
		scale: 1,
	});
	const [isDragging, setIsDragging] = React.useState(false);
	const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
	const [useCanvas, setUseCanvas] = React.useState(true);
	const hasInitializedView = React.useRef(false);

	// Auto-center view on nodes when they first load
	React.useEffect(() => {
		if (nodes.length > 0 && !hasInitializedView.current) {
			// Calculate bounding box of all nodes
			const xs = nodes.map((n) => n.x);
			const ys = nodes.map((n) => n.y);
			const minX = Math.min(...xs);
			const maxX = Math.max(...xs);
			const minY = Math.min(...ys);
			const maxY = Math.max(...ys);

			// Calculate center of nodes
			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;

			// Center the view on the nodes
			// Offset by half the viewport to center in view
			setTransform({
				x: -centerX + height * 0.67, // Approximate viewport width ratio
				y: -centerY + height / 2,
				scale: 1,
			});

			hasInitializedView.current = true;
		}
	}, [nodes, height]);

	const handleConfigChange = React.useCallback(
		(newConfig: Partial<ForceSimulationConfig>) => {
			setConfig((prev) => ({ ...prev, ...newConfig }));
		},
		[],
	);

	const handleNodeClick = React.useCallback(
		(nodeId: string) => {
			const node = nodes.find((n) => n.id === nodeId);
			if (node) {
				onNodeClick?.(nodeId, node);
			}
		},
		[nodes, onNodeClick],
	);

	const handleWheel = React.useCallback(
		(e: React.WheelEvent) => {
			e.preventDefault();
			const rect = svgRef.current?.getBoundingClientRect();
			if (!rect) return;

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
			const newScale = Math.max(0.2, Math.min(3, transform.scale * scaleFactor));

			setTransform((prev) => ({
				x: prev.x - (mouseX - prev.x) * (newScale / prev.scale - 1),
				y: prev.y - (mouseY - prev.y) * (newScale / prev.scale - 1),
				scale: newScale,
			}));
		},
		[transform.scale],
	);

	const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
		setIsDragging(true);
		setDragStart({ x: e.clientX, y: e.clientY });
	}, []);

	const handleMouseMove = React.useCallback(
		(e: React.MouseEvent) => {
			if (isDragging) {
				const dx = e.clientX - dragStart.x;
				const dy = e.clientY - dragStart.y;
				setTransform((prev) => ({
					...prev,
					x: prev.x + dx,
					y: prev.y + dy,
				}));
				setDragStart({ x: e.clientX, y: e.clientY });
			}
		},
		[isDragging, dragStart],
	);

	const handleMouseUp = React.useCallback(() => {
		setIsDragging(false);
	}, []);

	const resetView = React.useCallback(() => {
		if (nodes.length > 0) {
			// Calculate bounding box of all nodes
			const xs = nodes.map((n) => n.x);
			const ys = nodes.map((n) => n.y);
			const minX = Math.min(...xs);
			const maxX = Math.max(...xs);
			const minY = Math.min(...ys);
			const maxY = Math.max(...ys);

			// Calculate center of nodes
			const centerX = (minX + maxX) / 2;
			const centerY = (minY + maxY) / 2;

			// Center the view on the nodes
			setTransform({
				x: -centerX + height * 0.67,
				y: -centerY + height / 2,
				scale: 1,
			});
		}
	}, [nodes, height]);

	const toggleRenderer = React.useCallback(() => {
		setUseCanvas(!useCanvas);
	}, [useCanvas]);

	const togglePerformanceMonitoring = React.useCallback(() => {
		setPerformanceMonitoring(!performanceMonitoring);
	}, [performanceMonitoring]);

	if (nodes.length === 0) {
		return (
			<Card
				className={cn(
					"flex items-center justify-center text-muted-foreground",
					className,
				)}
				style={{ height }}
			>
				<div className="text-center">
					<p className="text-lg font-medium">No entities found</p>
					<p className="text-sm">
						Create some entities to see them visualized here.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card
			className={cn("relative w-full overflow-hidden p-0", className)}
			style={{ height }}
		>
			{showControls && (
				<div className="absolute top-4 right-4 z-10">
					<Controls
						config={config}
						onConfigChange={handleConfigChange}
						isRunning={isRunning}
						onRestart={restart}
						onResetView={resetView}
						useCanvas={useCanvas}
						onToggleRenderer={toggleRenderer}
						performanceMonitoring={performanceMonitoring}
						onTogglePerformanceMonitoring={togglePerformanceMonitoring}
					/>
				</div>
			)}
			{useCanvas ? (
				<CanvasNodeMap
					nodes={nodes}
					connections={connections}
					transform={transform}
					onTransformChange={setTransform}
					onNodeClick={handleNodeClick}
					height={height}
				/>
			) : (
				<SvgNodeRenderer
					ref={svgRef}
					nodes={nodes}
					connections={connections}
					nodeTypeConfig={nodeTypeConfig}
					transform={transform}
					onNodeClick={handleNodeClick}
					onWheel={handleWheel}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
				/>
			)}
		</Card>
	);
}
