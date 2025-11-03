import type { Node } from "@xyflow/react";
import type { Character, Faction } from "~/api";

export type CharacterNodeType = Node<
	{
		character: Character;
	},
	"characterNode"
>;

export type FactionNodeType = Node<
	{
		faction: Faction;
	},
	"factionNode"
>;
