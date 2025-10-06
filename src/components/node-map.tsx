import { Link, useRouter } from "@tanstack/react-router";
import { useRef, useEffect, useState, useCallback } from "react";
import type { EntityTreeData, EntityTreeNode } from "~/api/types.gen";
import { cn } from "~/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface NodeMapProps {
	data: EntityTreeData;
	gameId: string;
}

interface NodePosition {
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

interface Connection {
	from: string;
	to: string;
	strength?: number;
}

interface ViewTransform {
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

const NODE_BADGE_COLORS = {
	character: "ready" as const,
	faction: "default" as const,
	location: "success" as const,
	quest: "warning" as const,
	note: "secondary" as const,
};

const NODE_TYPES = {
	character: "Characters",
	faction: "Factions",
	location: "Locations",
	quest: "Quests",
	note: "Notes",
} as const;

function extractUniqueNodesAndConnections(data: EntityTreeData): { nodes: Map<string, EntityTreeNode>; connections: Connection[] } {
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

function useForceSimulation(data: EntityTreeData) {
	const [simNodes, setSimNodes] = useState<NodePosition[]>([]);
	const [connections, setConnections] = useState<Connection[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const animationRef = useRef<number>();
	
	const initializeSimulation = useCallback(() => {
		const { nodes, connections: conns } = extractUniqueNodesAndConnections(data);
		const nodeArray = Array.from(nodes.values());
		
		// Initialize nodes with random positions and zero velocity
		const initialNodes: NodePosition[] = nodeArray.map(node => {
			const connectionCount = conns.filter(c => c.from === node.id || c.to === node.id).length;
			return {
				x: Math.random() * 600 + 100,
				y: Math.random() * 400 + 100,
				vx: 0,
				vy: 0,
				id: node.id,
				type: node.type,
				name: node.name,
				children: node.children?.map(child => child.id) || [],
				connectionCount,
			};
		});
		
		setSimNodes(initialNodes);
		setConnections(conns);
		setIsRunning(true);
	}, [data]);
	
	const runSimulation = useCallback(() => {
		setSimNodes(prevNodes => {
			const nodes = [...prevNodes];
			const alpha = 0.1;
			const centerX = 400;
			const centerY = 300;
			
			// Reset forces
			nodes.forEach(node => {
				node.vx *= 0.8; // damping
				node.vy *= 0.8;
			});
			
			// Repulsion between nodes (anti-gravity)
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const nodeA = nodes[i];
					const nodeB = nodes[j];
					const dx = nodeB.x - nodeA.x;
					const dy = nodeB.y - nodeA.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					
					if (distance > 0) {
						const repulsion = 3000 / (distance * distance);
						const forceX = (dx / distance) * repulsion;
						const forceY = (dy / distance) * repulsion;
						
						nodeA.vx -= forceX;
						nodeA.vy -= forceY;
						nodeB.vx += forceX;
						nodeB.vy += forceY;
					}
				}
			}
			
			// Attraction along connections (springs)
			connections.forEach(connection => {
				const source = nodes.find(n => n.id === connection.from);
				const target = nodes.find(n => n.id === connection.to);
				
				if (source && target) {
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const targetDistance = 100; // desired spring length
					
					if (distance > 0) {
						const force = (distance - targetDistance) * 0.1;
						const forceX = (dx / distance) * force;
						const forceY = (dy / distance) * force;
						
						source.vx += forceX;
						source.vy += forceY;
						target.vx -= forceX;
						target.vy -= forceY;
					}
				}
			});
			
			// Center gravity (weak pull toward center)
			nodes.forEach(node => {
				const dx = centerX - node.x;
				const dy = centerY - node.y;
				node.vx += dx * 0.001;
				node.vy += dy * 0.001;
			});
			
			// Update positions
			nodes.forEach(node => {
				if (!node.fixed) {
					node.x += node.vx * alpha;
					node.y += node.vy * alpha;
					
					// Boundary constraints
					node.x = Math.max(50, Math.min(750, node.x));
					node.y = Math.max(50, Math.min(550, node.y));
				}
			});
			
			// Check if simulation should continue
			const totalKineticEnergy = nodes.reduce((total, node) => {
				return total + (node.vx * node.vx + node.vy * node.vy);
			}, 0);
			
			if (totalKineticEnergy < 0.01) {
				setIsRunning(false);
			}
			
			return nodes;
		});
	}, [connections]);
	
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
	const { nodes, connections, isRunning, restart } = useForceSimulation(data);
	const router = useRouter();
	const svgRef = useRef<SVGSVGElement>(null);
	const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [draggedNode, setDraggedNode] = useState<string | null>(null);
	
	const handleWheel = useCallback((e: React.WheelEvent) => {
		e.preventDefault();
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;
		
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
		const newScale = Math.max(0.2, Math.min(3, transform.scale * scaleFactor));
		
		setTransform(prev => ({
			x: prev.x - (mouseX - prev.x) * (newScale / prev.scale - 1),
			y: prev.y - (mouseY - prev.y) * (newScale / prev.scale - 1),
			scale: newScale,
		}));
	}, [transform.scale]);
	
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (e.target instanceof SVGCircleElement && e.target.dataset.nodeId) {
			setDraggedNode(e.target.dataset.nodeId);
		} else {
			setIsDragging(true);
		}
		setDragStart({ x: e.clientX, y: e.clientY });
	}, []);
	
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (isDragging) {
			const dx = e.clientX - dragStart.x;
			const dy = e.clientY - dragStart.y;
			setTransform(prev => ({
				...prev,
				x: prev.x + dx,
				y: prev.y + dy,
			}));
			setDragStart({ x: e.clientX, y: e.clientY });
		}
	}, [isDragging, dragStart]);
	
	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setDraggedNode(null);
	}, []);
	
	if (nodes.length === 0) {
		return (
			<div className="flex items-center justify-center h-96 text-muted-foreground">
				<div className="text-center">
					<p className="text-lg font-medium">No entities found</p>
					<p className="text-sm">Create some characters, locations, or other entities to see them here.</p>
				</div>
			</div>
		);
	}
	
	return (
		<Card className="relative w-full h-96 overflow-hidden p-0">
			{/* Controls */}
			<div className="absolute top-4 left-4 z-10 flex gap-2">
				<button
					onClick={restart}
					className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
				>
					{isRunning ? "Simulating..." : "Restart Layout"}
				</button>
				<button
					onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
					className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
				>
					Reset View
				</button>
			</div>
			
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
				viewBox="0 0 800 600"
				className="absolute inset-0 bg-muted/20 cursor-grab active:cursor-grabbing"
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				<g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
					{/* Render connections */}
					<g className="connections">
						{connections.map((connection, index) => {
							const fromNode = nodes.find(n => n.id === connection.from);
							const toNode = nodes.find(n => n.id === connection.to);
							
							if (!fromNode || !toNode) return null;
							
							const opacity = connection.strength ? Math.min(connection.strength / 5, 0.8) : 0.4;
							const strokeWidth = connection.strength ? Math.min(connection.strength, 3) : 1.5;
							
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
							const nodeSize = Math.max(8, Math.min(20, 8 + node.connectionCount * 1.5));
							
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
											"stroke-background stroke-2 cursor-pointer hover:stroke-4 transition-all"
										)}
										onClick={(e) => {
											e.stopPropagation();
											// Navigate to entity using proper router navigation
											const entityType = NODE_TYPES[node.type].toLowerCase();
											router.navigate({ 
												to: `/games/$gameId/${entityType}/$id` as any,
												params: { gameId, id: node.id }
											});
										}}
									/>
									
									{/* Node label */}
									<text
										x={node.x}
										y={node.y + nodeSize + 16}
										textAnchor="middle"
										className="text-xs font-medium fill-foreground pointer-events-none group-hover:fill-primary transition-colors"
										style={{ fontSize: `${Math.max(8, 10 / transform.scale)}px` }}
									>
										{node.name.length > 15 ? `${node.name.slice(0, 15)}...` : node.name}
									</text>
									
									{/* Tooltip on hover */}
									<title>
										{node.name} ({node.type})
										{node.connectionCount > 0 && ` - ${node.connectionCount} connections`}
									</title>
								</g>
							);
						})}
					</g>
				</g>
			</svg>
			
			{/* Stats and Legend */}
			<Card className="absolute top-4 right-4 max-w-xs">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm">Entity Map</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="text-xs text-muted-foreground">
						{nodes.length} unique entities, {connections.length} relationships
					</div>
					<div className="space-y-2">
						{Object.entries(NODE_COLORS).map(([type, colorClass]) => {
							const count = nodes.filter(n => n.type === type).length;
							if (count === 0) return null;
							
							return (
								<div key={type} className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 text-xs">
										<div className={cn("w-3 h-3 rounded-full", colorClass)} />
										<span className="capitalize">{type}</span>
									</div>
									<Badge variant={NODE_BADGE_COLORS[type as keyof typeof NODE_BADGE_COLORS]} size="sm">
										{count}
									</Badge>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</Card>
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
					<h2 className="text-2xl font-bold tracking-tight">Entity Relationship Map</h2>
					<p className="text-muted-foreground">Interactive visualization of your game entities and their connections</p>
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
			
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{Object.entries(NODE_TYPES).map(([type, label]) => {
					const entities = data[type as keyof EntityTreeData] || [];
					const count = entities.length;
					
					return (
						<Link
							key={type}
							to={`/games/$gameId/${type}s` as any}
							params={{ gameId }}
						>
							<Card className="text-center hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
								<CardContent className="pt-6">
									<div className={cn("w-6 h-6 rounded-full mx-auto mb-3", NODE_COLORS[type as keyof typeof NODE_COLORS])} />
									<div className="font-semibold text-lg">{count}</div>
									<div className="text-sm text-muted-foreground">{label}</div>
								</CardContent>
							</Card>
						</Link>
					);
				})}
			</div>
		</div>
	);
}