import type {
	Monster,
	Entry,
	EntryItem,
	EntriesItem,
	List,
	DamageCondition,
} from "~/types/monster";

/**
 * Utility functions for formatting monster data for detailed display.
 */

/**
 * Formats ability scores with modifiers.
 */
export function formatAbilityScore(score: number): string {
	const modifier = Math.floor((score - 10) / 2);
	const modifierString = modifier >= 0 ? `+${modifier}` : `${modifier}`;
	return `${score} (${modifierString})`;
}

/**
 * Formats saving throws display.
 */
export function formatSavingThrows(saves?: Record<string, string>): string {
	if (!saves) return "";
	return Object.entries(saves)
		.map(([ability, value]) => `${ability.toUpperCase()} ${value}`)
		.join(", ");
}

/**
 * Formats skills display.
 */
export function formatSkills(skills?: Record<string, string>): string {
	if (!skills) return "";
	return Object.entries(skills)
		.map(([skill, value]) => `${skill} ${value}`)
		.join(", ");
}

/**
 * Formats damage resistances, immunities, or vulnerabilities.
 */
export function formatDamageTypes(damages?: (string | DamageCondition)[]): string {
	if (!damages || damages.length === 0) return "";

	return damages
		.map((damage) => {
			if (typeof damage === "string") {
				return damage;
			}

			// Handle complex damage conditions
			const parts: string[] = [];
			if (damage.resist) parts.push(...damage.resist);
			if (damage.immune) parts.push(...damage.immune);
			if (damage.vulnerable) parts.push(...damage.vulnerable);

			let result = parts.join(", ");
			if (damage.note) {
				result += ` (${damage.note})`;
			}

			return result;
		})
		.join("; ");
}

/**
 * Formats languages display.
 */
export function formatLanguages(languages?: string[]): string {
	if (!languages || languages.length === 0) return "—";
	return languages.join(", ");
}

/**
 * Formats senses display.
 */
export function formatSenses(senses?: string[], passive?: number): string {
	const senseList = senses ? [...senses] : [];
	if (passive) {
		senseList.push(`passive Perception ${passive}`);
	}
	return senseList.join(", ") || "—";
}

/**
 * Converts entry content to readable text.
 */
export function formatEntry(entry: Entry): string {
	if (typeof entry === "string") {
		return entry;
	}

	if ("type" in entry) {
		switch (entry.type) {
			case "list":
				return formatListEntry(entry as List);
			case "item":
				return formatItemEntry(entry as EntryItem);
			case "entries":
				return formatEntriesItem(entry as EntriesItem);
			default:
				return "[Complex entry]";
		}
	}

	return "[Unknown entry format]";
}

function formatListEntry(list: List): string {
	if (!list.items) return "";
	return list.items.map((item) => `• ${formatEntry(item)}`).join("\n");
}

function formatItemEntry(item: EntryItem): string {
	let result = item.name ? `${item.name}: ` : "";
	if (item.entry) {
		result += item.entry;
	}
	if (item.entries) {
		result += item.entries.join(" ");
	}
	return result;
}

function formatEntriesItem(entries: EntriesItem): string {
	let result = entries.name ? `${entries.name}: ` : "";
	result += entries.entries.map(formatEntry).join(" ");
	return result;
}

/**
 * Formats trait, action, or legendary action entries.
 */
export function formatTraitAction(trait: { name: string; entries: Entry[] }): {
	name: string;
	description: string;
} {
	return {
		name: trait.name,
		description: trait.entries.map(formatEntry).join("\n\n"),
	};
}

/**
 * Gets monster type with tags if available.
 */
export function getMonsterTypeWithTags(monster: Monster): string {
	if (typeof monster.type === "string") {
		return monster.type;
	}

	let result = monster.type.type;
	if (monster.type.tags && monster.type.tags.length > 0) {
		result += ` (${monster.type.tags.join(", ")})`;
	}

	return result;
}

/**
 * Gets armor class with source information.
 */
export function getArmorClassWithSource(monster: Monster): string {
	if (monster.ac.length === 0) return "—";

	const firstAC = monster.ac[0];
	if (typeof firstAC === "number") {
		return firstAC.toString();
	}

	let result = firstAC.ac.toString();
	if (firstAC.from && firstAC.from.length > 0) {
		result += ` (${firstAC.from.join(", ")})`;
	}

	return result;
}

/**
 * Gets hit points with formula.
 */
export function getHitPointsWithFormula(monster: Monster): string {
	return `${monster.hp.average} (${monster.hp.formula})`;
}

/**
 * Gets challenge rating with XP.
 */
export function getChallengeRatingWithXP(monster: Monster): string {
	const cr = typeof monster.cr === "string" ? monster.cr : monster.cr.cr;

	// XP table for challenge ratings
	const xpTable: Record<string, string> = {
		"0": "0 or 10 XP",
		"1/8": "25 XP",
		"1/4": "50 XP",
		"1/2": "100 XP",
		"1": "200 XP",
		"2": "450 XP",
		"3": "700 XP",
		"4": "1,100 XP",
		"5": "1,800 XP",
		"6": "2,300 XP",
		"7": "2,900 XP",
		"8": "3,900 XP",
		"9": "5,000 XP",
		"10": "5,900 XP",
		"11": "7,200 XP",
		"12": "8,400 XP",
		"13": "10,000 XP",
		"14": "11,500 XP",
		"15": "13,000 XP",
		"16": "15,000 XP",
		"17": "18,000 XP",
		"18": "20,000 XP",
		"19": "22,000 XP",
		"20": "25,000 XP",
		"21": "33,000 XP",
		"22": "41,000 XP",
		"23": "50,000 XP",
		"24": "62,000 XP",
		"25": "75,000 XP",
		"26": "90,000 XP",
		"27": "105,000 XP",
		"28": "120,000 XP",
		"29": "135,000 XP",
		"30": "155,000 XP",
	};

	const xp = xpTable[cr] || "Unknown XP";
	return `${cr} (${xp})`;
}
