/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
import { Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EntityTreeData, EntityTreeNode } from "~/api/types.gen";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/utils/cn";
import { performanceMonitor } from "~/utils/performance-benchmark";
import { QuadTree } from "~/utils/quadtree";
import { CanvasNodeMap } from "./canvas-node-map";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "./ui/popover";

interface NodeMapProps {
	data: EntityTreeData;
	gameId: string;
}

export interface NodePosition {
	x: number;
	y: number;
	vx: number;
	vy: number;
	id: string;
	type: EntityTreeNode["type"];
	name: string;
	children: string[];
	connectionCount: number;
	fixed?: boolean;
}

export interface Connection {
	from: string;
	to: string;
	strength?: number;
}

export interface ViewTransform {
	x: number;
	y: number;
	scale: number;
}

const NODE_COLORS = {
	character: "fill-blue-600 dark:fill-blue-400",
	faction: "fill-purple-600 dark:fill-purple-400",
	location: "fill-emerald-600 dark:fill-emerald-400",
	quest: "fill-amber-600 dark:fill-amber-400",
	note: "fill-gray-600 dark:fill-gray-400",
} as const;

const NODE_TYPES = {
	character: "Characters",
	faction: "Factions",
	location: "Locations",
	quest: "Quests",
	note: "Notes",
} as const;

function extractUniqueNodesAndConnections(data: EntityTreeData): {
	nodes: Map<string, EntityTreeNode>;
	connections: Connection[];
} {
	const uniqueNodes = new Map<string, EntityTreeNode>();
	const connections: Connection[] = [];
	const processedConnections = new Set<string>();

	function processNode(node: EntityTreeNode, parentId?: string) {
		// Add the node to our unique collection (will overwrite duplicates)
		uniqueNodes.set(node.id, node);

		// Add connection from parent if exists
		if (parentId) {
			const connectionKey = `${parentId}->${node.id}`;
			if (!processedConnections.has(connectionKey)) {
				connections.push({
					from: parentId,
					to: node.id,
					strength: node.strength,
				});
				processedConnections.add(connectionKey);
			}
		}

		// Process children recursively
		if (node.children?.length) {
			for (const child of node.children) {
				processNode(child, node.id);
			}
		}
	}

	// Process all entity types
	if (data.characters) {
		for (const character of data.characters) {
			processNode(character);
		}
	}
	if (data.factions) {
		for (const faction of data.factions) {
			processNode(faction);
		}
	}
	if (data.locations) {
		for (const location of data.locations) {
			processNode(location);
		}
	}
	if (data.quests) {
		for (const quest of data.quests) {
			processNode(quest);
		}
	}
	if (data.notes) {
		for (const note of data.notes) {
			processNode(note);
		}
	}

	return { nodes: uniqueNodes, connections };
}

function useForceSimulation(
	data: EntityTreeData,
	repulsionStrength: number,
	attractionStrength: number,
	centerForceStrength: number,
	targetLinkLength: number,
) {
	const [simNodes, setSimNodes] = useState<NodePosition[]>([]);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const animationRef = useRef<number | null>(null);

	// Memoize the expensive data extraction
	const { nodes: extractedNodes, connections: extractedConnections } = useMemo(() => {
		return extractUniqueNodesAndConnections(data);
	}, [data]);

	// Create indexed lookup maps for O(1) access
	const nodeIndexMap = useRef<Map<string, number>>(new Map());
	const nodesArray = useRef<NodePosition[]>([]);

	const initializeSimulation = useCallback(() => {
		const nodeArray = Array.from(extractedNodes.values());

		// Initialize nodes with random positions and zero velocity in much larger area
		const initialNodes: NodePosition[] = nodeArray.map((node) => {
			const connectionCount = extractedConnections.filter(
				(c) => c.from === node.id || c.to === node.id,
			).length;
			return {
				x: Math.random() * 1400 + 200, // much larger initial spread
				y: Math.random() * 1000 + 200,
				vx: 0,
				vy: 0,
				id: node.id,
				type: node.type,
				name: node.name,
				children: node.children?.map((child) => child.id) || [],
				connectionCount,
			};
		});

		// Update refs for fast lookups
		nodesArray.current = initialNodes;
		nodeIndexMap.current.clear();
		initialNodes.forEach((node, index) => {
			nodeIndexMap.current.set(node.id, index);
		});

		setSimNodes(initialNodes);
		setConnections(extractedConnections);
		setIsRunning(true);
	}, [extractedNodes, extractedConnections]);

	const runSimulation = useCallback(() => {
		performanceMonitor.startMeasurement();
		setSimNodes((prevNodes) => {
			const nodes = [...prevNodes];
			// Update the reference for indexed lookups
			nodesArray.current = nodes;

			const alpha = 0.1;
			const centerX = 800; // center of larger simulation area
			const centerY = 600;

			// Reset forces with balanced damping
			nodes.forEach((node) => {
				node.vx *= 0.85; // balanced damping for stable movement
				node.vy *= 0.85;
			});

			// Optimized repulsion using spatial partitioning with much larger area
			const quadTree = new QuadTree({ x: 0, y: 0, width: 1600, height: 1200 });

			// Insert all nodes into quadtree
			for (const node of nodes) {
				quadTree.insert({ x: node.x, y: node.y, id: node.id });
			}

			// Calculate repulsion for each node using spatial queries
			for (const nodeA of nodes) {
				// Query nearby nodes within repulsion range
				const nearby = quadTree.queryCircle(
					{ x: nodeA.x, y: nodeA.y, id: nodeA.id },
					200,
				);

				for (const point of nearby) {
					if (point.id === nodeA.id) continue;

					const nodeBIndex = nodeIndexMap.current.get(point.id);
					if (nodeBIndex === undefined) continue;
					const nodeB = nodes[nodeBIndex];

					const dx = nodeB.x - nodeA.x;
					const dy = nodeB.y - nodeA.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance > 0 && distance < 200) {
						// Moderate repulsion range
						const repulsion = repulsionStrength / (distance * distance); // Dynamic repulsion strength
						const forceX = (dx / distance) * repulsion;
						const forceY = (dy / distance) * repulsion;

						nodeA.vx -= forceX * 0.5; // Balanced force application
						nodeA.vy -= forceY * 0.5;
					}
				}
			}

			// Attraction along connections (springs) - optimized lookups
			connections.forEach((connection) => {
				const sourceIndex = nodeIndexMap.current.get(connection.from);
				const targetIndex = nodeIndexMap.current.get(connection.to);

				if (sourceIndex !== undefined && targetIndex !== undefined) {
					const source = nodes[sourceIndex];
					const target = nodes[targetIndex];
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const targetDistance = targetLinkLength; // dynamic spring length

					if (distance > 0) {
						const force =
							(distance - targetDistance) * (attractionStrength * 0.01); // dynamic spring force
						const forceX = (dx / distance) * force;
						const forceY = (dy / distance) * force;

						source.vx += forceX;
						source.vy += forceY;
						target.vx -= forceX;
						target.vy -= forceY;
					}
				}
			});

			// Reduced center force for more natural spread
			nodes.forEach((node) => {
				const dx = centerX - node.x;
				const dy = centerY - node.y;
				const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

				// Dynamic center force based on slider value
				const dynamicCenterForce = Math.min(
					distanceFromCenter * (centerForceStrength * 0.00001),
					centerForceStrength * 0.0002,
				);
				node.vx += dx * dynamicCenterForce;
				node.vy += dy * dynamicCenterForce;
			});

			// Update positions
			nodes.forEach((node) => {
				if (!node.fixed) {
					node.x += node.vx * alpha;
					node.y += node.vy * alpha;

					// Boundary constraints for much larger simulation area
					node.x = Math.max(100, Math.min(1500, node.x));
					node.y = Math.max(100, Math.min(1100, node.y));
				}
			});

			// Check if simulation should continue
			const totalKineticEnergy = nodes.reduce((total, node) => {
				return total + (node.vx * node.vx + node.vy * node.vy);
			}, 0);

			if (totalKineticEnergy < 0.01) {
				setIsRunning(false);
			}

			performanceMonitor.endMeasurement(nodes.length, "simulation");
			return nodes;
		});
	}, [
		connections,
		repulsionStrength,
		attractionStrength,
		centerForceStrength,
		targetLinkLength,
	]);

	useEffect(() => {
		initializeSimulation();
	}, [initializeSimulation]);

	useEffect(() => {
		if (isRunning) {
			const animate = () => {
				runSimulation();
				animationRef.current = requestAnimationFrame(animate);
			};
			animationRef.current = requestAnimationFrame(animate);
		}

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isRunning, runSimulation]);

	return { nodes: simNodes, connections, isRunning, restart: initializeSimulation };
}

function NodeMapVisualization({ data, gameId }: NodeMapProps) {
	// Force parameter controls
	const [repulsionStrength, setRepulsionStrength] = useState([10000]); // 5000-50000 range
	const [attractionStrength, setAttractionStrength] = useState([15]); // 1-40 range (multiplied by 0.01)
	const [centerForceStrength, setCenterForceStrength] = useState([5]); // 1-15 range (multiplied by 0.00001)
	const [targetLinkLength, setTargetLinkLength] = useState([150]); // 50-400 range

	const { nodes, connections, isRunning, restart } = useForceSimulation(
		data,
		repulsionStrength[0],
		attractionStrength[0],
		centerForceStrength[0],
		targetLinkLength[0],
	);
	const router = useRouter();
	const svgRef = useRef<SVGSVGElement>(null);
	const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [, setDraggedNode] = useState<string | null>(null);
	const [useCanvas, setUseCanvas] = useState(true); // Default to Canvas for better performance

	// Handle node clicks for both Canvas and SVG
	const handleNodeClick = useCallback(
		(nodeId: string) => {
			const node = nodes.find((n) => n.id === nodeId);
			if (!node) return;

			const entityType = NODE_TYPES[node.type].toLowerCase();
			router.navigate({
				to: `/games/$gameId/${entityType}/$id`,
				params: { gameId, id: nodeId },
			});
		},
		[nodes, gameId, router],
	);

	const handleWheel = useCallback(
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

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (e.target instanceof SVGCircleElement && e.target.dataset.nodeId) {
			setDraggedNode(e.target.dataset.nodeId);
		} else {
			setIsDragging(true);
		}
		setDragStart({ x: e.clientX, y: e.clientY });
	}, []);

	const handleMouseMove = useCallback(
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

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setDraggedNode(null);
	}, []);

	if (nodes.length === 0) {
		return (
			<div className="flex items-center justify-center h-96 text-muted-foreground">
				<div className="text-center">
					<p className="text-lg font-medium">No entities found</p>
					<p className="text-sm">
						Create some characters, locations, or other entities to see them
						here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<Popover>
				<PopoverTrigger>Controls</PopoverTrigger>
				<PopoverPositioner align="start" side="bottom">
					<PopoverContent>
						<Card className="absolute bottom-4 left-4 z-10 w-80">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">
									Force Parameters
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<label
										htmlFor="repulsion-slider"
										className="text-xs font-medium"
									>
										Repulsion Force: {repulsionStrength[0]}
									</label>
									<Slider
										id="repulsion-slider"
										value={repulsionStrength}
										onValueChange={(value) =>
											setRepulsionStrength(
												Array.isArray(value) ? value : [value],
											)
										}
										min={5000}
										max={50000}
										step={1000}
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="attraction-slider"
										className="text-xs font-medium"
									>
										Link Attraction: {attractionStrength[0] * 0.01}
									</label>
									<Slider
										id="attraction-slider"
										value={attractionStrength}
										onValueChange={(value) =>
											setAttractionStrength(
												Array.isArray(value) ? value : [value],
											)
										}
										min={1}
										max={40}
										step={1}
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="center-slider"
										className="text-xs font-medium"
									>
										Center Force: {centerForceStrength[0] * 0.00001}
									</label>
									<Slider
										id="center-slider"
										value={centerForceStrength}
										onValueChange={(value) =>
											setCenterForceStrength(
												Array.isArray(value) ? value : [value],
											)
										}
										min={1}
										max={15}
										step={1}
										className="w-full"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="length-slider"
										className="text-xs font-medium"
									>
										Target Link Length: {targetLinkLength[0]}px
									</label>
									<Slider
										id="length-slider"
										value={targetLinkLength}
										onValueChange={(value) =>
											setTargetLinkLength(
												Array.isArray(value) ? value : [value],
											)
										}
										min={50}
										max={400}
										step={10}
										className="w-full"
									/>
								</div>
							</CardContent>
						</Card>
					</PopoverContent>
				</PopoverPositioner>
			</Popover>
			<Card className="relative w-full h-96 overflow-hidden p-0">
				{/* Controls */}
				<div className="absolute top-4 left-4 z-10 flex gap-2">
					<button
						type="button"
						onClick={restart}
						className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
					>
						{isRunning ? "Simulating..." : "Restart Layout"}
					</button>
					<button
						type="button"
						onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
						className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
					>
						Reset View
					</button>
					<button
						type="button"
						onClick={() => setUseCanvas(!useCanvas)}
						className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
					>
						{useCanvas ? "Canvas" : "SVG"}
					</button>
				</div>

				{/* Force Controls */}

				{useCanvas ? (
					<CanvasNodeMap
						nodes={nodes}
						connections={connections}
						transform={transform}
						onTransformChange={setTransform}
						onNodeClick={handleNodeClick}
					/>
				) : (
					<svg
						ref={svgRef}
						width="100%"
						height="100%"
						viewBox="0 0 1600 1200"
						className="absolute inset-0 bg-muted/20 cursor-grab active:cursor-grabbing"
						onWheel={handleWheel}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						aria-label="Interactive node map visualization"
					>
						<title>Node map showing entities and their relationships</title>
						<g
							transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
						>
							{/* Render connections */}
							<g className="connections">
								{connections.map((connection, index) => {
									const fromNode = nodes.find(
										(n) => n.id === connection.from,
									);
									const toNode = nodes.find(
										(n) => n.id === connection.to,
									);

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
											<circle
												cx={node.x}
												cy={node.y}
												r={nodeSize}
												data-node-id={node.id}
												className={cn(
													NODE_COLORS[node.type],
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
													if (
														e.key === "Enter" ||
														e.key === " "
													) {
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
				)}
			</Card>
		</>
	);
}

export function NodeMap({ data, gameId }: NodeMapProps) {
	if (!data) {
		return (
			<Card className="flex items-center justify-center h-96">
				<div className="text-muted-foreground">
					<p>Loading entity map...</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Entity Relationship Map
					</h2>
					<p className="text-muted-foreground">
						Interactive visualization of your game entities and their
						connections
					</p>
				</div>
				<Link
					to="/games/$gameId/tree"
					params={{ gameId }}
					className="text-sm text-primary hover:text-primary/80 transition-colors"
				>
					View Raw Data →
				</Link>
			</div>

			<NodeMapVisualization data={data} gameId={gameId} />
		</div>
	);
}
