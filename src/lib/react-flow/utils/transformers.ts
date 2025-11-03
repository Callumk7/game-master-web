import type { Character, Faction } from "~/api";
import type { CharacterNodeType, FactionNodeType } from "../types";
import { layoutFactionAndMembers } from "./layout";

export function transformFactionAndMembersToNodes(
	faction: Faction,
	members: Character[],
): [FactionNodeType, CharacterNodeType[]] {
	const factionNode: FactionNodeType = {
		id: faction.id,
		type: "factionNode",
		position: { x: 0, y: 0 },
		data: {
			faction,
		},
	};

	const memberNodes: CharacterNodeType[] = members.map((member) => ({
		id: member.id,
		type: "characterNode",
		position: { x: 0, y: 0 },
		data: {
			character: member,
		},
	}));

	return layoutFactionAndMembers(factionNode, memberNodes);
}

export function createFactionMemberEdges(faction: Faction, members: Character[]) {
	return members.map((member) => ({
		id: `${faction.id}-${member.id}`,
		source: faction.id,
		target: member.id,
		sourceHandle: "faction-source",
		targetHandle: "character-target",
	}));
}
