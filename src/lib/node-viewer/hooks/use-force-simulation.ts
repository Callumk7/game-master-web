import * as React from "react";
import { performanceMonitor } from "~/utils/performance-benchmark";
import { QuadTree } from "~/utils/quadtree";
import type { Connection, ForceSimulationConfig, NodePosition } from "../types";

export function useForceSimulation<T>(
	data: T,
	nodeExtractor: (data: T) => { nodes: Map<string, any>; connections: Connection[] },
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

		const initialNodes: NodePosition[] = nodeArray.map((node) => {
			const connectionCount = extractedConnections.filter(
				(c) => c.from === node.id || c.to === node.id,
			).length;
			return {
				x: Math.random() * 50 + 775, // Start very close to center (775-825)
				y: Math.random() * 50 + 575, // Start very close to center (575-625)
				vx: 0,
				vy: 0,
				id: node.id,
				type: node.type,
				name: node.name,
				children: node.children?.map((child: any) => child.id) || [],
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
	}, [extractedNodes, extractedConnections]);

	const runSimulation = React.useCallback(() => {
		if (performanceMonitoring) {
			performanceMonitor.startMeasurement();
		}
		setSimNodes((prevNodes) => {
			const nodes = [...prevNodes];
			nodesArray.current = nodes;

			const alpha = 0.1;
			const centerX = 800;
			const centerY = 600;

			nodes.forEach((node) => {
				node.vx *= 0.85;
				node.vy *= 0.85;
			});

			const quadTree = new QuadTree({ x: 0, y: 0, width: 1600, height: 1200 });

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
						const repulsion =
							config.repulsionStrength / (distance * distance);
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
						const force =
							(distance - targetDistance) *
							(config.attractionStrength * 0.01);
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

					node.x = Math.max(100, Math.min(1500, node.x));
					node.y = Math.max(100, Math.min(1100, node.y));
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

