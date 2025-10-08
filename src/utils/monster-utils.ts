import type { Monster, Size, SpeedDetail } from "~/types/monster";

/**
 * Utility functions for safely extracting and formatting monster data for display.
 */

/** Maps size abbreviations to full names. */
const SIZE_MAP: Record<Size, string> = {
	T: "Tiny",
	S: "Small",
	M: "Medium",
	L: "Large",
	H: "Huge",
	G: "Gargantuan",
};

/** Maps alignment abbreviations to full names. */
const ALIGNMENT_MAP: Record<string, string> = {
	L: "Lawful",
	N: "Neutral",
	C: "Chaotic",
	G: "Good",
	E: "Evil",
	NX: "Neutral",
	NY: "Neutral",
	A: "Any",
	U: "Unaligned",
};

/**
 * Extracts the primary type from a monster's type field.
 */
export function getMonsterType(monster: Monster): string {
	if (typeof monster.type === "string") {
		return monster.type;
	}
	return monster.type.type;
}

/**
 * Formats the monster's size for display.
 */
export function getMonsterSize(monster: Monster): string {
	return monster.size.map((s) => SIZE_MAP[s] || s).join(", ");
}

/**
 * Extracts the armor class value for display.
 */
export function getMonsterAC(monster: Monster): number | string {
	if (monster.ac.length === 0) return "—";

	const firstAC = monster.ac[0];
	if (typeof firstAC === "number") {
		return firstAC;
	}
	return firstAC.ac;
}

/**
 * Extracts the challenge rating for display.
 */
export function getMonsterCR(monster: Monster): string {
	if (typeof monster.cr === "string") {
		return monster.cr;
	}
	return monster.cr.cr;
}

/**
 * Formats the monster's hit points for display.
 */
export function getMonsterHP(monster: Monster): string {
	return monster.hp.average.toString();
}

/**
 * Formats the monster's speed for display.
 */
export function getMonsterSpeed(monster: Monster): string {
	const speeds: string[] = [];

	if (monster.speed.walk) {
		speeds.push(`${monster.speed.walk} ft.`);
	}

	if (monster.speed.fly) {
		if (typeof monster.speed.fly === "number") {
			speeds.push(`fly ${monster.speed.fly} ft.`);
		} else {
			const flySpeed = monster.speed.fly as SpeedDetail;
			speeds.push(
				`fly ${flySpeed.number} ft.${flySpeed.condition ? ` ${flySpeed.condition}` : ""}`,
			);
		}
	}

	if (monster.speed.swim) {
		speeds.push(`swim ${monster.speed.swim} ft.`);
	}

	if (monster.speed.climb) {
		speeds.push(`climb ${monster.speed.climb} ft.`);
	}

	if (monster.speed.burrow) {
		speeds.push(`burrow ${monster.speed.burrow} ft.`);
	}

	return speeds.join(", ") || "—";
}

/**
 * Formats alignment for display.
 */
export function getMonsterAlignment(monster: Monster): string {
	return monster.alignment.map((a) => ALIGNMENT_MAP[a] || a).join(" ");
}

/**
 * Checks if a monster matches a search query.
 */
export function matchesSearchQuery(monster: Monster, query: string): boolean {
	const lowercaseQuery = query.toLowerCase();
	const type = getMonsterType(monster).toLowerCase();

	return (
		monster.name.toLowerCase().includes(lowercaseQuery) ||
		type.includes(lowercaseQuery) ||
		monster.source.toLowerCase().includes(lowercaseQuery)
	);
}

/**
 * Checks if a monster matches a type filter.
 */
export function matchesTypeFilter(monster: Monster, typeFilter: string): boolean {
	return getMonsterType(monster) === typeFilter;
}

/**
 * Gets all unique types from a list of monsters.
 */
export function getUniqueTypes(monsters: Monster[]): string[] {
	const types = new Set(monsters.map(getMonsterType));
	return Array.from(types).sort();
}
