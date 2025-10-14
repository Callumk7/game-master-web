import { useRouter } from "@tanstack/react-router";
import * as React from "react";
import type { EntityTreeNode } from "~/api/types.gen";
import {
	createTreeNodeExtractor,
	type NodePosition,
	type NodeTypeConfig,
	NodeViewer,
} from "~/lib/node-viewer";

interface EntityTreeMapProps {
	data: EntityTreeNode;
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

export function EntityTreeMap({ data, gameId }: EntityTreeMapProps) {
	const router = useRouter();

	const nodeExtractor = createTreeNodeExtractor();

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
					<p>Loading entity tree...</p>
				</div>
			</div>
		);
	}

	return (
		<NodeViewer
			data={data}
			nodeExtractor={nodeExtractor}
			nodeTypeConfig={NODE_TYPE_CONFIG}
			onNodeClick={handleNodeClick}
			height={600}
			showControls={true}
		/>
	);
}