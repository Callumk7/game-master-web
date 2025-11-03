import {
	addEdge,
	type Connection,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import * as React from "react";
import "@xyflow/react/dist/style.css";
import type { Character, Faction } from "~/api/types.gen";
import { CharacterNode } from "./nodes/character-node";
import { FactionNode } from "./nodes/faction-node";
import {
	createFactionMemberEdges,
	transformFactionAndMembersToNodes,
} from "./utils/transformers";

const nodeTypes = {
	characterNode: CharacterNode,
	factionNode: FactionNode,
};

interface ExampleProps {
	faction: Faction;
	members: Character[];
}
export function Example({ faction, members }: ExampleProps) {
	const [factionNode, memberNodes] = React.useMemo(
		() => transformFactionAndMembersToNodes(faction, members),
		[faction, members],
	);

	const initialEdges = React.useMemo(
		() => createFactionMemberEdges(faction, members),
		[faction, members],
	);

	const [nodes, _setNodes, onNodesChange] = useNodesState([
		factionNode,
		...memberNodes,
	]);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const onConnect = React.useCallback(
		(params: Connection) => {
			setEdges((edges) => addEdge(params, edges));
		},
		[setEdges],
	);
	return (
		<div style={{ width: "100%", height: "800px" }}>
			<ReactFlow
				nodes={nodes}
				nodeTypes={nodeTypes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			/>
		</div>
	);
}
