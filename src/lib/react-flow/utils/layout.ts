import type { CharacterNodeType, FactionNodeType } from "../types";

interface LayoutConfig {
	factionY: number;
	memberStartY: number;
	horizontalSpacing: number;
	nodeWidth: number;
	maxNodesPerRow: number;
}

const defaultConfig: LayoutConfig = {
	factionY: 50,
	memberStartY: 250,
	horizontalSpacing: 300,
	nodeWidth: 200,
	maxNodesPerRow: 5,
};

/**
 * Layouts faction and member nodes in a hierarchical structure
 * - Faction node centered at the top
 * - Member nodes arranged in rows below
 */
export function layoutFactionAndMembers(
	factionNode: FactionNodeType,
	memberNodes: CharacterNodeType[],
	config: Partial<LayoutConfig> = {},
): [FactionNodeType, CharacterNodeType[]] {
	const cfg = { ...defaultConfig, ...config };

	// Calculate total width needed for members
	const membersPerRow = Math.min(memberNodes.length, cfg.maxNodesPerRow);
	const totalWidth = membersPerRow * cfg.horizontalSpacing;

	// Position faction node at the center top
	const positionedFactionNode: FactionNodeType = {
		...factionNode,
		position: {
			x: totalWidth / 2 - cfg.nodeWidth / 2,
			y: cfg.factionY,
		},
	};

	// Position member nodes in rows below the faction
	const positionedMemberNodes = memberNodes.map((node, index) => {
		const row = Math.floor(index / cfg.maxNodesPerRow);
		const col = index % cfg.maxNodesPerRow;
		const nodesInThisRow = Math.min(
			cfg.maxNodesPerRow,
			memberNodes.length - row * cfg.maxNodesPerRow,
		);
		const rowWidth = nodesInThisRow * cfg.horizontalSpacing;
		const rowStartX = totalWidth / 2 - rowWidth / 2;

		return {
			...node,
			position: {
				x: rowStartX + col * cfg.horizontalSpacing,
				y: cfg.memberStartY + row * 200, // 200px vertical spacing between rows
			},
		};
	});

	return [positionedFactionNode, positionedMemberNodes];
}
