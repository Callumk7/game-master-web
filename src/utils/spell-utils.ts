import type { Spell, School } from "~/types/spell";

/**
 * Utility functions for safely extracting and formatting spell data for display.
 */

/** Maps school abbreviations to full names. */
const SCHOOL_MAP: Record<School, string> = {
	A: "Abjuration",
	C: "Conjuration",
	D: "Divination",
	E: "Enchantment",
	I: "Illusion",
	N: "Necromancy",
	T: "Transmutation",
	V: "Evocation",
};

/**
 * Gets the full school name from abbreviation.
 */
export function getSpellSchool(spell: Spell): string {
	return SCHOOL_MAP[spell.school] || spell.school;
}

/**
 * Formats the spell level for display.
 */
export function getSpellLevel(spell: Spell): string {
	if (spell.level === 0) return "Cantrip";
	if (spell.level === 1) return "1st level";
	if (spell.level === 2) return "2nd level";
	if (spell.level === 3) return "3rd level";
	return `${spell.level}th level`;
}

/**
 * Formats casting time for display.
 */
export function getSpellCastingTime(spell: Spell): string {
	if (spell.time.length === 0) return "—";

	const time = spell.time[0];
	let result = `${time.number} ${time.unit}`;
	if (time.number !== 1) {
		result += "s";
	}

	if (time.condition) {
		result += ` (${time.condition})`;
	}

	return result;
}

/**
 * Formats spell range for display.
 */
export function getSpellRange(spell: Spell): string {
	const range = spell.range;
	const distance = range.distance;

	if (distance.type === "self") {
		return "Self";
	}

	if (distance.type === "touch") {
		return "Touch";
	}

	if (distance.type === "unlimited") {
		return "Unlimited";
	}

	if (distance.type === "sight") {
		return "Sight";
	}

	if (distance.amount) {
		let result = `${distance.amount} ${distance.type}`;

		if (range.type !== "point") {
			result += ` (${range.type})`;
		}

		return result;
	}

	return "Special";
}

/**
 * Formats spell components for display.
 */
export function getSpellComponents(spell: Spell): string {
	const components = spell.components;
	const parts: string[] = [];

	if (components.v) parts.push("V");
	if (components.s) parts.push("S");
	if (components.m) {
		if (typeof components.m === "string") {
			parts.push(`M (${components.m})`);
		} else {
			let materialText = `M (${components.m.text}`;
			if (components.m.cost) {
				materialText += `, worth ${components.m.cost} gp`;
			}
			if (components.m.consume) {
				materialText += ", consumed";
			}
			materialText += ")";
			parts.push(materialText);
		}
	}

	return parts.join(", ");
}

/**
 * Formats spell duration for display.
 */
export function getSpellDuration(spell: Spell): string {
	if (spell.duration.length === 0) return "—";

	const duration = spell.duration[0];

	if (duration.type === "instant") {
		return "Instantaneous";
	}

	if (duration.type === "permanent") {
		return "Permanent";
	}

	if (duration.type === "special") {
		return "Special";
	}

	if (duration.type === "timed" && duration.duration) {
		const timed = duration.duration;
		let result = "";

		if (timed.upTo) {
			result = "Up to ";
		}

		result += `${timed.amount} ${timed.type}`;
		if (timed.amount !== 1) {
			result += "s";
		}

		if (duration.concentration) {
			result = `Concentration, ${result}`;
		}

		return result;
	}

	return "Unknown";
}

/**
 * Checks if a spell is a ritual.
 */
export function isRitual(spell: Spell): boolean {
	return spell.meta?.ritual === true;
}

/**
 * Checks if a spell matches a search query.
 */
export function matchesSearchQuery(spell: Spell, query: string): boolean {
	const lowercaseQuery = query.toLowerCase();
	const school = getSpellSchool(spell).toLowerCase();
	const level = getSpellLevel(spell).toLowerCase();

	return (
		spell.name.toLowerCase().includes(lowercaseQuery) ||
		school.includes(lowercaseQuery) ||
		level.includes(lowercaseQuery) ||
		spell.source.toLowerCase().includes(lowercaseQuery)
	);
}

/**
 * Checks if a spell matches a school filter.
 */
export function matchesSchoolFilter(spell: Spell, schoolFilter: string): boolean {
	return getSpellSchool(spell) === schoolFilter;
}

/**
 * Checks if a spell matches a level filter.
 */
export function matchesLevelFilter(spell: Spell, levelFilter: string): boolean {
	if (levelFilter === "Cantrip") return spell.level === 0;
	return getSpellLevel(spell) === levelFilter;
}

/**
 * Gets all unique schools from a list of spells.
 */
export function getUniqueSchools(spells: Spell[]): string[] {
	const schools = new Set(spells.map(getSpellSchool));
	return Array.from(schools).sort();
}

/**
 * Gets all unique levels from a list of spells.
 */
export function getUniqueLevels(spells: Spell[]): string[] {
	const levels = new Set(spells.map(getSpellLevel));
	return Array.from(levels).sort((a, b) => {
		// Sort with Cantrip first, then numerical order
		if (a === "Cantrip") return -1;
		if (b === "Cantrip") return 1;

		const aNum = Number.parseInt(a, 10);
		const bNum = Number.parseInt(b, 10);
		return aNum - bNum;
	});
}
