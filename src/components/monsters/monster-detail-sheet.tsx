import type * as React from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import type { Monster } from "~/types/monster";
import {
	formatAbilityScore,
	formatDamageTypes,
	formatLanguages,
	formatSavingThrows,
	formatSenses,
	formatSkills,
	formatTraitAction,
	getArmorClassWithSource,
	getChallengeRatingWithXP,
	getHitPointsWithFormula,
	getMonsterTypeWithTags,
} from "~/utils/monster-display";
import { getMonsterSize, getMonsterSpeed } from "~/utils/monster-utils";

interface MonsterDetailSheetProps {
	monster: Monster;
	children: React.ReactNode;
}

export function MonsterDetailSheet({ monster, children }: MonsterDetailSheetProps) {
	return (
		<Sheet>
			<SheetTrigger>{children}</SheetTrigger>
			<SheetContent side="right" width="lg" className="overflow-y-auto p-8 pt-10">
				<SheetHeader>
					<SheetTitle>{monster.name}</SheetTitle>
					<SheetDescription>
						{getMonsterSize(monster)} {getMonsterTypeWithTags(monster)}
					</SheetDescription>
				</SheetHeader>
				<div className="space-y-6 pr-6">
					{/* Basic Stats */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-semibold">Armor Class:</span>{" "}
								{getArmorClassWithSource(monster)}
							</div>
							<div>
								<span className="font-semibold">Hit Points:</span>{" "}
								{getHitPointsWithFormula(monster)}
							</div>
							<div className="col-span-2">
								<span className="font-semibold">Speed:</span>{" "}
								{getMonsterSpeed(monster)}
							</div>
						</div>
					</div>

					{/* Ability Scores */}
					<div className="border rounded-lg p-4">
						<div className="grid grid-cols-6 gap-2 text-center">
							<div>
								<div className="font-semibold text-xs">STR</div>
								<div className="text-sm">
									{formatAbilityScore(monster.str)}
								</div>
							</div>
							<div>
								<div className="font-semibold text-xs">DEX</div>
								<div className="text-sm">
									{formatAbilityScore(monster.dex)}
								</div>
							</div>
							<div>
								<div className="font-semibold text-xs">CON</div>
								<div className="text-sm">
									{formatAbilityScore(monster.con)}
								</div>
							</div>
							<div>
								<div className="font-semibold text-xs">INT</div>
								<div className="text-sm">
									{formatAbilityScore(monster.int)}
								</div>
							</div>
							<div>
								<div className="font-semibold text-xs">WIS</div>
								<div className="text-sm">
									{formatAbilityScore(monster.wis)}
								</div>
							</div>
							<div>
								<div className="font-semibold text-xs">CHA</div>
								<div className="text-sm">
									{formatAbilityScore(monster.cha)}
								</div>
							</div>
						</div>
					</div>

					{/* Extended Stats */}
					<div className="space-y-3 text-sm">
						{monster.save && (
							<div>
								<span className="font-semibold">Saving Throws:</span>{" "}
								{formatSavingThrows(monster.save)}
							</div>
						)}
						{monster.skill && (
							<div>
								<span className="font-semibold">Skills:</span>{" "}
								{formatSkills(monster.skill)}
							</div>
						)}
						{monster.resist && (
							<div>
								<span className="font-semibold">Damage Resistances:</span>{" "}
								{formatDamageTypes(monster.resist)}
							</div>
						)}
						{monster.immune && (
							<div>
								<span className="font-semibold">Damage Immunities:</span>{" "}
								{formatDamageTypes(monster.immune)}
							</div>
						)}
						{monster.vulnerable && (
							<div>
								<span className="font-semibold">
									Damage Vulnerabilities:
								</span>{" "}
								{formatDamageTypes(monster.vulnerable)}
							</div>
						)}
						{monster.conditionImmune &&
							monster.conditionImmune.length > 0 && (
								<div>
									<span className="font-semibold">
										Condition Immunities:
									</span>{" "}
									{monster.conditionImmune.join(", ")}
								</div>
							)}
						<div>
							<span className="font-semibold">Senses:</span>{" "}
							{formatSenses(monster.senses, monster.passive)}
						</div>
						<div>
							<span className="font-semibold">Languages:</span>{" "}
							{formatLanguages(monster.languages)}
						</div>
						<div>
							<span className="font-semibold">Challenge Rating:</span>{" "}
							{getChallengeRatingWithXP(monster)}
						</div>
					</div>

					{/* Traits */}
					{monster.trait && monster.trait.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Traits
							</h3>
							<div className="space-y-3">
								{monster.trait.map((trait, index) => {
									const formatted = formatTraitAction(trait);
									return (
										<div
											key={`trait-${trait.name}-${index}`}
											className="text-sm"
										>
											<div className="font-semibold mb-1">
												{formatted.name}
											</div>
											<div className="whitespace-pre-wrap text-muted-foreground">
												{formatted.description}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Actions */}
					{monster.action && monster.action.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Actions
							</h3>
							<div className="space-y-3">
								{monster.action.map((action, index) => {
									const formatted = formatTraitAction(action);
									return (
										<div
											key={`action-${action.name}-${index}`}
											className="text-sm"
										>
											<div className="font-semibold mb-1">
												{formatted.name}
											</div>
											<div className="whitespace-pre-wrap text-muted-foreground">
												{formatted.description}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Reactions */}
					{monster.reaction && monster.reaction.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Reactions
							</h3>
							<div className="space-y-3">
								{monster.reaction.map((reaction, index) => {
									const formatted = formatTraitAction(reaction);
									return (
										<div
											key={`reaction-${reaction.name}-${index}`}
											className="text-sm"
										>
											<div className="font-semibold mb-1">
												{formatted.name}
											</div>
											<div className="whitespace-pre-wrap text-muted-foreground">
												{formatted.description}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Legendary Actions */}
					{monster.legendary && monster.legendary.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Legendary Actions
							</h3>
							{monster.legendaryHeader && (
								<div className="text-sm text-muted-foreground mb-3">
									{monster.legendaryHeader.join(" ")}
								</div>
							)}
							<div className="space-y-3">
								{monster.legendary.map((legendary, index) => {
									const formatted = formatTraitAction(legendary);
									return (
										<div
											key={`legendary-${legendary.name}-${index}`}
											className="text-sm"
										>
											<div className="font-semibold mb-1">
												{formatted.name}
											</div>
											<div className="whitespace-pre-wrap text-muted-foreground">
												{formatted.description}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Spellcasting */}
					{monster.spellcasting && monster.spellcasting.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Spellcasting
							</h3>
							<div className="space-y-4">
								{monster.spellcasting.map((spellcasting, index) => (
									<div
										key={`spellcasting-${spellcasting.name}-${index}`}
										className="text-sm"
									>
										<div className="font-semibold mb-2">
											{spellcasting.name}
										</div>
										{spellcasting.headerEntries && (
											<div className="mb-3 text-muted-foreground">
												{spellcasting.headerEntries.join(" ")}
											</div>
										)}

										{spellcasting.will && (
											<div className="mb-2">
												<span className="font-medium">
													At will:
												</span>{" "}
												{spellcasting.will.join(", ")}
											</div>
										)}

										{spellcasting.daily && (
											<div className="space-y-1">
												{Object.entries(spellcasting.daily).map(
													([frequency, spells]) => (
														<div key={frequency}>
															<span className="font-medium">
																{frequency}:
															</span>{" "}
															{spells.join(", ")}
														</div>
													),
												)}
											</div>
										)}

										{spellcasting.spells && (
											<div className="space-y-1">
												{Object.entries(spellcasting.spells).map(
													([level, spellLevel]) => (
														<div key={level}>
															<span className="font-medium">
																{level === "0"
																	? "Cantrips"
																	: `${level}${getOrdinalSuffix(Number.parseInt(level, 10))} level`}
																{spellLevel.slots
																	? ` (${spellLevel.slots} slots)`
																	: ""}
																:
															</span>{" "}
															{spellLevel.spells.join(", ")}
														</div>
													),
												)}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}

function getOrdinalSuffix(num: number): string {
	const j = num % 10;
	const k = num % 100;
	if (j === 1 && k !== 11) return "st";
	if (j === 2 && k !== 12) return "nd";
	if (j === 3 && k !== 13) return "rd";
	return "th";
}
