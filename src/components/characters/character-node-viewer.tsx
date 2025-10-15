import type { CharacterLinksResponse } from "~/api";
import { NodeViewer } from "~/lib/node-viewer";
import type { Connection, GenericNode, NodeTypeConfig } from "~/lib/node-viewer/types";

interface CharacterNodeViewerProps {
	characterId: string;
	characterName: string;
	linksResponse: CharacterLinksResponse;
	onNodeClick?: (nodeId: string) => void;
}

export function CharacterNodeViewer({
	characterId,
	characterName,
	linksResponse,
	onNodeClick,
}: CharacterNodeViewerProps) {
	// Node extractor for character links visualization
	const nodeExtractor = (response: CharacterLinksResponse) => {
		const nodes = new Map<string, GenericNode>();
		const connections: Connection[] = [];

		if (!response.data?.links) {
			return { nodes, connections };
		}

		const { links } = response.data;

		// Add the main character as the central node
		nodes.set(characterId, {
			id: characterId,
			name: characterName,
			type: "character",
			children: [],
		});

		// Add linked entities as nodes
		if (links.characters) {
			for (const char of links.characters) {
				nodes.set(char.id, {
					id: char.id,
					name: char.name,
					type: "character",
					children: [],
				});
				connections.push({
					from: characterId,
					to: char.id,
				});
			}
		}

		if (links.factions) {
			for (const faction of links.factions) {
				nodes.set(faction.id, {
					id: faction.id,
					name: faction.name,
					type: "faction",
					children: [],
				});
				connections.push({
					from: characterId,
					to: faction.id,
				});
			}
		}

		if (links.locations) {
			for (const location of links.locations) {
				nodes.set(location.id, {
					id: location.id,
					name: location.name,
					type: "location",
					children: [],
				});
				connections.push({
					from: characterId,
					to: location.id,
				});
			}
		}

		if (links.quests) {
			for (const quest of links.quests) {
				nodes.set(quest.id, {
					id: quest.id,
					name: quest.name,
					type: "quest",
					children: [],
				});
				connections.push({
					from: characterId,
					to: quest.id,
				});
			}
		}

		if (links.notes) {
			for (const note of links.notes) {
				nodes.set(note.id, {
					id: note.id,
					name: note.name,
					type: "note",
					children: [],
				});
				connections.push({
					from: characterId,
					to: note.id,
				});
			}
		}

		return { nodes, connections };
	};

	// Node type configuration for styling
	const nodeTypeConfig: NodeTypeConfig = {
		character: {
			color: "#3b82f6",
			label: "Character",
		},
		faction: {
			color: "#8b5cf6",
			label: "Faction",
		},
		location: {
			color: "#10b981",
			label: "Location",
		},
		quest: {
			color: "#f59e0b",
			label: "Quest",
		},
		note: {
			color: "#ef4444",
			label: "Note",
		},
	};

	return (
		<NodeViewer
			data={linksResponse}
			nodeExtractor={nodeExtractor}
			nodeTypeConfig={nodeTypeConfig}
			height={400}
			onNodeClick={onNodeClick}
		/>
	);
}

