import type { Connection, GenericNode } from "../types";

export function extractNodesAndConnections<T extends Record<string, object>>(
	data: T,
	entityKeys: string[] = [],
): { nodes: Map<string, GenericNode>; connections: Connection[] } {
	const uniqueNodes = new Map<string, GenericNode>();
	const connections: Connection[] = [];
	const processedConnections = new Set<string>();

	function processNode(node: GenericNode, parentId?: string) {
		uniqueNodes.set(node.id, node);

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

		if (node.children?.length) {
			for (const child of node.children) {
				processNode(child, node.id);
			}
		}
	}

	const keysToProcess = entityKeys.length > 0 ? entityKeys : Object.keys(data);

	for (const key of keysToProcess) {
		const entities = data[key];
		if (Array.isArray(entities)) {
			for (const entity of entities) {
				if (entity && typeof entity === "object" && "id" in entity) {
					processNode(entity);
				}
			}
		}
	}

	return { nodes: uniqueNodes, connections };
}

export function createDefaultNodeExtractor(entityKeys?: string[]) {
	return <T extends Record<string, object>>(data: T) =>
		extractNodesAndConnections(data, entityKeys);
}

