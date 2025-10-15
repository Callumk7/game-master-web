import * as React from "react";
import { cn } from "~/utils/cn";
import type { Connection, NodePosition, NodeTypeConfig, ViewTransform } from "../types";

// Helper to get default chart color for node types
function getDefaultNodeColor(nodeType: string): string {
	const colorMap: Record<string, string> = {
		character: "fill-chart-1",
		faction: "fill-chart-2", 
		location: "fill-chart-4",
		quest: "fill-chart-3",
		note: "fill-chart-5",
	};
	return colorMap[nodeType] || "fill-chart-5";
}

interface SvgNodeRendererProps {
	nodes: NodePosition[];
	connections: Connection[];
	nodeTypeConfig: NodeTypeConfig;
	transform: ViewTransform;
	onNodeClick?: (nodeId: string) => void;
	onMouseDown?: (e: React.MouseEvent) => void;
	onMouseMove?: (e: React.MouseEvent) => void;
	onMouseUp?: (e: React.MouseEvent) => void;
	onWheel?: (e: React.WheelEvent) => void;
}

export const SvgNodeRenderer = React.forwardRef<SVGSVGElement, SvgNodeRendererProps>(
	(
		{
			nodes,
			connections,
			nodeTypeConfig,
			transform,
			onNodeClick,
			onMouseDown,
			onMouseMove,
			onMouseUp,
			onWheel,
		},
		ref,
	) => {
		const handleNodeClick = React.useCallback(
			(nodeId: string) => {
				onNodeClick?.(nodeId);
			},
			[onNodeClick],
		);

		return (
			<svg
				ref={ref}
				width="100%"
				height="100%"
				viewBox="0 0 1600 1200"
				className="absolute inset-0 bg-muted/20 cursor-grab active:cursor-grabbing"
				onWheel={onWheel}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseUp}
				aria-label="Interactive node map visualization"
			>
				<title>Node map showing entities and their relationships</title>
				<g
					transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
				>
					{/* Render connections */}
					<g className="connections">
						{connections.map((connection, index) => {
							const fromNode = nodes.find((n) => n.id === connection.from);
							const toNode = nodes.find((n) => n.id === connection.to);

							if (!fromNode || !toNode) return null;

							const opacity = connection.strength
								? Math.min(connection.strength / 5, 0.8)
								: 0.4;
							const strokeWidth = connection.strength
								? Math.min(connection.strength, 3)
								: 1.5;

							return (
								<line
									key={`${connection.from}-${connection.to}-${index}`}
									x1={fromNode.x}
									y1={fromNode.y}
									x2={toNode.x}
									y2={toNode.y}
									stroke="currentColor"
									strokeWidth={strokeWidth}
									strokeOpacity={opacity}
									className="text-muted-foreground hover:text-primary transition-colors"
								/>
							);
						})}
					</g>

					{/* Render nodes */}
					<g className="nodes">
						{nodes.map((node) => {
							const nodeSize = Math.max(
								8,
								Math.min(20, 8 + node.connectionCount * 1.5),
							);
							const nodeConfig = nodeTypeConfig[node.type];

							return (
								<g key={node.id} className="group">
									{/* Hover background */}
									<circle
										cx={node.x}
										cy={node.y}
										r={nodeSize + 4}
										className="fill-accent opacity-0 group-hover:opacity-30 transition-opacity"
									/>

									{/* Main node */}
									{/** biome-ignore lint/a11y/useSemanticElements: Nodes are interactive */}
									<circle
										cx={node.x}
										cy={node.y}
										r={nodeSize}
										data-node-id={node.id}
										className={cn(
											nodeConfig?.color ||
												getDefaultNodeColor(node.type),
											"stroke-background stroke-2 cursor-pointer hover:stroke-4 transition-all",
										)}
										tabIndex={0}
										role="button"
										aria-label={`${node.type}: ${node.name}`}
										onClick={(e) => {
											e.stopPropagation();
											handleNodeClick(node.id);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleNodeClick(node.id);
											}
										}}
									/>

									{/* Node label */}
									<text
										x={node.x}
										y={node.y + nodeSize + 16}
										textAnchor="middle"
										className="text-xs font-medium fill-foreground pointer-events-none group-hover:fill-primary transition-colors"
										style={{
											fontSize: `${Math.max(8, 10 / transform.scale)}px`,
										}}
									>
										{node.name.length > 15
											? `${node.name.slice(0, 15)}...`
											: node.name}
									</text>

									{/* Tooltip on hover */}
									<title>
										{node.name} ({node.type})
										{node.connectionCount > 0 &&
											` - ${node.connectionCount} connections`}
									</title>
								</g>
							);
						})}
					</g>
				</g>
			</svg>
		);
	},
);

SvgNodeRenderer.displayName = "SvgNodeRenderer";

