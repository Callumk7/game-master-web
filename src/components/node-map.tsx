import { Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import type { EntityTreeData } from "~/api/types.gen";
import {
	createDefaultNodeExtractor,
	type NodePosition,
	type NodeTypeConfig,
	NodeViewer,
} from "~/lib/node-viewer";

interface NodeMapProps {
	data: EntityTreeData;
	gameId: string;
}

const NODE_TYPE_CONFIG: NodeTypeConfig = {
	character: {
		color: "fill-blue-600 dark:fill-blue-400",
		label: "Characters",
	},
	faction: {
		color: "fill-purple-600 dark:fill-purple-400",
		label: "Factions",
	},
	location: {
		color: "fill-emerald-600 dark:fill-emerald-400",
		label: "Locations",
	},
	quest: {
		color: "fill-amber-600 dark:fill-amber-400",
		label: "Quests",
	},
	note: {
		color: "fill-gray-600 dark:fill-gray-400",
		label: "Notes",
	},
};

const ENTITY_KEYS = ["characters", "factions", "locations", "quests", "notes"];

export function NodeMap({ data, gameId }: NodeMapProps) {
	const router = useRouter();

	const nodeExtractor = createDefaultNodeExtractor(ENTITY_KEYS);

	const handleNodeClick = React.useCallback(
		(nodeId: string, node: NodePosition) => {
			if (!node) return;

			const entityType =
				NODE_TYPE_CONFIG[node.type]?.label?.toLowerCase() || node.type;
			router.navigate({
				to: `/games/$gameId/${entityType}/$id`,
				params: { gameId, id: nodeId },
			});
		},
		[gameId, router],
	);

	if (!data) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-muted-foreground">
					<p>Loading entity map...</p>
				</div>
			</div>
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

			<NodeViewer
				data={data}
				nodeExtractor={nodeExtractor}
				nodeTypeConfig={NODE_TYPE_CONFIG}
				onNodeClick={handleNodeClick}
				height={600}
				showControls={true}
			/>
		</div>
	);
}
