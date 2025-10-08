import type { Spell, Entry, TitledEntry, ListEntry, TableEntry } from "~/types/spell";

/**
 * Utility functions for formatting spell data for detailed display.
 */

/**
 * Converts entry content to readable text.
 */
export function formatSpellEntry(entry: Entry): string {
	if (typeof entry === "string") {
		return cleanSpellText(entry);
	}

	if ("type" in entry) {
		switch (entry.type) {
			case "entries":
				return formatTitledEntry(entry as TitledEntry);
			case "list":
				return formatListEntry(entry as ListEntry);
			case "table":
				return formatTableEntry(entry as TableEntry);
			default:
				return "[Complex entry]";
		}
	}

	return "[Unknown entry format]";
}

function formatTitledEntry(entry: TitledEntry): string {
	let result = entry.name ? `**${entry.name}**\n\n` : "";
	result += entry.entries.map(formatSpellEntry).join("\n\n");
	return result;
}

function formatListEntry(entry: ListEntry): string {
	return entry.items.map((item) => `• ${cleanSpellText(item)}`).join("\n");
}

function formatTableEntry(entry: TableEntry): string {
	let result = entry.caption ? `**${entry.caption}**\n\n` : "";

	// Format headers
	result += `${entry.colLabels.join(" | ")}\n`;
	result += `${entry.colLabels.map(() => "---").join(" | ")}\n`;

	// Format rows
	entry.rows.forEach((row) => {
		const formattedCells = row.map((cell) => {
			if (typeof cell === "string") {
				return cell;
			}
			// Handle TableCell with roll data
			if ("type" in cell && cell.type === "cell") {
				if (cell.roll.exact) return cell.roll.exact.toString();
				if (cell.roll.min && cell.roll.max) {
					return `${cell.roll.min}-${cell.roll.max}`;
				}
				return "—";
			}
			return "—";
		});
		result += `${formattedCells.join(" | ")}\n`;
	});

	return result;
}

/**
 * Cleans spell text by removing formatting tags and converting to readable text.
 */
function cleanSpellText(text: string): string {
	return (
		text
			// Remove damage tags: {@damage 1d6} -> 1d6
			.replace(/\{@damage ([^}]+)\}/g, "$1")
			// Remove dice tags: {@dice 1d4} -> 1d4
			.replace(/\{@dice ([^}]+)\}/g, "$1")
			// Remove spell links: {@spell fireball} -> fireball
			.replace(/\{@spell ([^}|]+)(\|[^}]+)?\}/g, "$1")
			// Remove creature links: {@creature goblin} -> goblin
			.replace(/\{@creature ([^}|]+)(\|[^}]+)?\}/g, "$1")
			// Remove condition links: {@condition charmed} -> charmed
			.replace(/\{@condition ([^}|]+)(\|[^}]+)?\}/g, "$1")
			// Remove item links: {@item longsword} -> longsword
			.replace(/\{@item ([^}|]+)(\|[^}]+)?\}/g, "$1")
			// Remove ability check tags: {@dc 15} -> DC 15
			.replace(/\{@dc (\d+)\}/g, "DC $1")
			// Remove hit tags: {@hit 5} -> +5
			.replace(/\{@hit ([^}]+)\}/g, "+$1")
			// Remove other generic tags
			.replace(/\{@[^}]+\}/g, "")
			// Clean up extra whitespace
			.replace(/\s+/g, " ")
			.trim()
	);
}

/**
 * Formats the main spell description.
 */
export function getSpellDescription(spell: Spell): string {
	return spell.entries.map(formatSpellEntry).join("\n\n");
}

/**
 * Formats the "At Higher Levels" section.
 */
export function getSpellHigherLevels(spell: Spell): string {
	if (!spell.entriesHigherLevel || spell.entriesHigherLevel.length === 0) {
		return "";
	}

	return spell.entriesHigherLevel.map(formatSpellEntry).join("\n\n");
}

/**
 * Gets spell scaling information for cantrips.
 */
export function getSpellScaling(spell: Spell): string {
	if (!spell.scalingLevelDice) return "";

	const scaling = spell.scalingLevelDice;
	const levels = Object.keys(scaling.scaling).sort(
		(a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10),
	);

	let result = `**${scaling.label} scaling:**\n`;
	levels.forEach((level) => {
		const damage = scaling.scaling[level];
		if (level === "1") {
			result += `• Character level 1-4: ${damage}\n`;
		} else if (level === "5") {
			result += `• Character level 5-10: ${damage}\n`;
		} else if (level === "11") {
			result += `• Character level 11-16: ${damage}\n`;
		} else if (level === "17") {
			result += `• Character level 17-20: ${damage}\n`;
		} else {
			result += `• Character level ${level}+: ${damage}\n`;
		}
	});

	return result.trim();
}

/**
 * Formats damage types for display.
 */
export function getSpellDamageTypes(spell: Spell): string {
	if (!spell.damageInflict || spell.damageInflict.length === 0) return "";
	return spell.damageInflict.join(", ");
}

/**
 * Formats saving throws for display.
 */
export function getSpellSavingThrows(spell: Spell): string {
	if (!spell.savingThrow || spell.savingThrow.length === 0) return "";
	return spell.savingThrow
		.map((save) => save.charAt(0).toUpperCase() + save.slice(1))
		.join(", ");
}

/**
 * Formats conditions inflicted for display.
 */
export function getSpellConditions(spell: Spell): string {
	if (!spell.conditionInflict || spell.conditionInflict.length === 0) return "";
	return spell.conditionInflict.join(", ");
}

/**
 * Gets all tags and metadata for a spell.
 */
export function getSpellTags(spell: Spell): string[] {
	const tags: string[] = [];

	if (spell.meta?.ritual) tags.push("Ritual");
	if (spell.srd) tags.push("SRD");
	if (spell.basicRules) tags.push("Basic Rules");
	if (spell.damageInflict && spell.damageInflict.length > 0) tags.push("Damage");
	if (spell.savingThrow && spell.savingThrow.length > 0) tags.push("Save");
	if (spell.spellAttack && spell.spellAttack.length > 0) tags.push("Attack");
	if (spell.conditionInflict && spell.conditionInflict.length > 0)
		tags.push("Condition");

	return tags;
}
