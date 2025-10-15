import * as React from "react";
import { performanceMonitor } from "~/utils/performance-benchmark";
import { QuadTree } from "~/utils/quadtree";
import type {
	Connection,
	ForceSimulationConfig,
	GenericNode,
	NodePosition,
} from "../types";

export function useForceSimulation<T>(
	data: T,
	nodeExtractor: (data: T) => {
		nodes: Map<string, GenericNode>;
		connections: Connection[];
	},
	config: ForceSimulationConfig,
	performanceMonitoring = false,
) {
	const [simNodes, setSimNodes] = React.useState<NodePosition[]>([]);
	const [connections, setConnections] = React.useState<Connection[]>([]);
	const [isRunning, setIsRunning] = React.useState(false);
	const animationRef = React.useRef<number | null>(null);

	const { nodes: extractedNodes, connections: extractedConnections } =
		React.useMemo(() => {
			return nodeExtractor(data);
		}, [data, nodeExtractor]);

	const nodeIndexMap = React.useRef<Map<string, number>>(new Map());
	const nodesArray = React.useRef<NodePosition[]>([]);

	const initializeSimulation = React.useCallback(() => {
		const nodeArray = Array.from(extractedNodes.values());

		// Find the max connection count to normalize positioning
		const connectionCounts = nodeArray.map(
			(node) =>
				extractedConnections.filter((c) => c.from === node.id || c.to === node.id)
					.length,
		);
		const maxConnections = Math.max(...connectionCounts, 1);

		const initialNodes: NodePosition[] = nodeArray.map((node) => {
			const connectionCount = extractedConnections.filter(
				(c) => c.from === node.id || c.to === node.id,
			).length;

			// Normalize connection count (0 = periphery, 1 = center)
			const normalizedConnections = connectionCount / maxConnections;

			// Calculate radial position based on connection count
			// More connections = closer to center (smaller radius)
			// Less connections = further from center (larger radius)
			const baseRadius = 100 + (1 - normalizedConnections) * 400; // Range: 100-500px from center
			const randomRadius = baseRadius + (Math.random() * 100 - 50); // Add some variance
			const randomAngle = Math.random() * Math.PI * 2;

			const centerX = config.simulationWidth / 2;
			const centerY = config.simulationHeight / 2;

			return {
				x: centerX + Math.cos(randomAngle) * randomRadius,
				y: centerY + Math.sin(randomAngle) * randomRadius,
				vx: 0,
				vy: 0,
				id: node.id,
				type: node.type,
				name: node.name,
				children: node.children?.map((child: GenericNode) => child.id) || [],
				connectionCount,
			};
		});

		nodesArray.current = initialNodes;
		nodeIndexMap.current.clear();
		initialNodes.forEach((node, index) => {
			nodeIndexMap.current.set(node.id, index);
		});

		setSimNodes(initialNodes);
		setConnections(extractedConnections);
		setIsRunning(true);
	}, [extractedNodes, extractedConnections, config.simulationWidth, config.simulationHeight]);

	const runSimulation = React.useCallback(() => {
		if (performanceMonitoring) {
			performanceMonitor.startMeasurement();
		}
		setSimNodes((prevNodes) => {
			const nodes = [...prevNodes];
			nodesArray.current = nodes;

			const alpha = 0.1;
			const centerX = config.simulationWidth / 2;
			const centerY = config.simulationHeight / 2;

			nodes.forEach((node) => {
				node.vx *= 0.85;
				node.vy *= 0.85;
			});

			// Create a Set of connected node pairs for fast lookup
			const connectedPairs = new Set<string>();
			for (const conn of connections) {
				connectedPairs.add(`${conn.from}-${conn.to}`);
				connectedPairs.add(`${conn.to}-${conn.from}`);
			}

			const quadTree = new QuadTree({
				x: 0,
				y: 0,
				width: config.simulationWidth,
				height: config.simulationHeight,
			});

			for (const node of nodes) {
				quadTree.insert({ x: node.x, y: node.y, id: node.id });
			}

			for (const nodeA of nodes) {
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
						// Check if nodes are connected
						const areConnected = connectedPairs.has(
							`${nodeA.id}-${nodeB.id}`,
						);

						// Amplify repulsion for unconnected nodes (they spread apart)
						const repulsionMultiplier = areConnected
							? 1
							: config.unconnectedNodeRepulsion;

						const repulsion =
							(config.repulsionStrength * repulsionMultiplier) /
							(distance * distance);
						const forceX = (dx / distance) * repulsion;
						const forceY = (dy / distance) * repulsion;

						nodeA.vx -= forceX * 0.5;
						nodeA.vy -= forceY * 0.5;
					}
				}
			}

			connections.forEach((connection) => {
				const sourceIndex = nodeIndexMap.current.get(connection.from);
				const targetIndex = nodeIndexMap.current.get(connection.to);

				if (sourceIndex !== undefined && targetIndex !== undefined) {
					const source = nodes[sourceIndex];
					const target = nodes[targetIndex];
					const dx = target.x - source.x;
					const dy = target.y - source.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					const targetDistance = config.targetLinkLength;

					if (distance > 0) {
						// More flexible spring force - allows links to vary in length
						const displacement = distance - targetDistance;
						const flexibility = config.linkFlexibility;

						// Use a softer spring equation that allows more give
						// Higher flexibility = more variation allowed before strong force kicks in
						const dampedDisplacement =
							Math.sign(displacement) *
							Math.abs(displacement) ** (1 - flexibility);

						const force =
							dampedDisplacement * (config.attractionStrength * 0.01);
						const forceX = (dx / distance) * force;
						const forceY = (dy / distance) * force;

						source.vx += forceX;
						source.vy += forceY;
						target.vx -= forceX;
						target.vy -= forceY;
					}
				}
			});

			nodes.forEach((node) => {
				const dx = centerX - node.x;
				const dy = centerY - node.y;
				const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

				const dynamicCenterForce = Math.min(
					distanceFromCenter * (config.centerForceStrength * 0.00001),
					config.centerForceStrength * 0.0002,
				);
				node.vx += dx * dynamicCenterForce;
				node.vy += dy * dynamicCenterForce;
			});

			nodes.forEach((node) => {
				if (!node.fixed) {
					node.x += node.vx * alpha;
					node.y += node.vy * alpha;

					node.x = Math.max(
						100,
						Math.min(config.simulationWidth - 100, node.x),
					);
					node.y = Math.max(
						100,
						Math.min(config.simulationHeight - 100, node.y),
					);
				}
			});

			const totalKineticEnergy = nodes.reduce((total, node) => {
				return total + (node.vx * node.vx + node.vy * node.vy);
			}, 0);

			if (totalKineticEnergy < 0.01) {
				setIsRunning(false);
			}

			if (performanceMonitoring) {
				performanceMonitor.endMeasurement(nodes.length, "simulation");
			}
			return nodes;
		});
	}, [connections, config, performanceMonitoring]);

	React.useEffect(() => {
		initializeSimulation();
	}, [initializeSimulation]);

	React.useEffect(() => {
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

	return {
		nodes: simNodes,
		connections,
		isRunning,
		restart: initializeSimulation,
	};
}
