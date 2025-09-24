import { Character, Faction } from "~/api";

interface FactionViewProps {
	character: Character;
	primaryFaction?: Faction;
}

export function FactionView({ character, primaryFaction }: FactionViewProps) {
	return <div></div>;
}
