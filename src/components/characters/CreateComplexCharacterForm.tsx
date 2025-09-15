import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
	createCharacterMutation,
	listCharactersQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useSmartForm } from "~/components/forms/smart-factory";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

// Complex character schema with conditional validation
const complexCharacterSchema = z
	.object({
		// Basic Info
		name: z.string().min(2, "Character name must be at least 2 characters"),
		class: z.enum([
			"fighter",
			"wizard",
			"rogue",
			"cleric",
			"ranger",
			"barbarian",
			"bard",
			"warlock",
		]),
		race: z.enum([
			"human",
			"elf",
			"dwarf",
			"halfling",
			"orc",
			"tiefling",
			"dragonborn",
		]),
		level: z.coerce
			.number()
			.min(1, "Level must be at least 1")
			.max(20, "Level cannot exceed 20"),

		// Attributes (D&D style)
		strength: z.coerce.number().min(3).max(18).default(10),
		dexterity: z.coerce.number().min(3).max(18).default(10),
		constitution: z.coerce.number().min(3).max(18).default(10),
		intelligence: z.coerce.number().min(3).max(18).default(10),
		wisdom: z.coerce.number().min(3).max(18).default(10),
		charisma: z.coerce.number().min(3).max(18).default(10),

		// Background & Description
		background: z
			.enum([
				"acolyte",
				"criminal",
				"folk_hero",
				"noble",
				"sage",
				"soldier",
				"charlatan",
				"entertainer",
			])
			.optional(),
		alignment: z
			.enum([
				"lawful_good",
				"neutral_good",
				"chaotic_good",
				"lawful_neutral",
				"true_neutral",
				"chaotic_neutral",
				"lawful_evil",
				"neutral_evil",
				"chaotic_evil",
			])
			.optional(),
		description: z
			.string()
			.max(1000, "Description cannot exceed 1000 characters")
			.optional(),

		// Advanced Options
		hit_points: z.coerce.number().min(1).optional(),
		armor_class: z.coerce.number().min(10).max(30).optional(),
		proficiency_bonus: z.coerce.number().min(2).max(6).default(2),

		// Equipment & Features
		starting_equipment: z.string().optional(),
		special_abilities: z.string().optional(),

		// Meta
		image_url: z.url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
		is_npc: z.boolean().default(false),
		is_public: z.boolean().default(false),
	})
	.refine(
		(data) => {
			// Custom validation: HP should scale with level and constitution
			if (data.hit_points && data.level && data.constitution) {
				const expectedMinHP =
					data.level * 4 + (data.constitution - 10) * data.level;
				return data.hit_points >= expectedMinHP * 0.5;
			}
			return true;
		},
		{
			message: "Hit points seem too low for this level and constitution",
			path: ["hit_points"],
		},
	);

export function CreateComplexCharacterForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/characters/new" });
	const context = useRouteContext({
		from: "/_auth/games/$gameId/characters/new",
	});
	const navigate = useNavigate();

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createCharacterMutation({
				path: { game_id: gameId },
			}),
		schema: complexCharacterSchema,
		entityName: "character",
		onSuccess: async () => {
			toast.success("Character created successfully!", {
				description: `${form.state.values.name} has been added to your game!`,
			});
			await context.queryClient.refetchQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	// Watch for class/race changes to show conditional content
	const watchedValues = {
		class: form.state.values.class as string,
		race: form.state.values.race as string,
		level: form.state.values.level as number,
		constitution: form.state.values.constitution as number,
	};

	// Calculate suggested HP based on class and level
	const getSuggestedHP = () => {
		const { class: charClass, level, constitution } = watchedValues;
		if (!charClass || !level || !constitution) return null;

		const hitDice = {
			fighter: 10,
			barbarian: 12,
			ranger: 10,
			wizard: 6,
			warlock: 8,
			rogue: 8,
			bard: 8,
			cleric: 8,
		};

		const baseDie = hitDice[charClass as keyof typeof hitDice] || 8;
		const conMod = Math.floor((constitution - 10) / 2);
		return Math.max(
			1,
			baseDie + conMod + (level - 1) * (Math.floor(baseDie / 2) + 1 + conMod),
		);
	};

	const suggestedHP = getSuggestedHP();

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Create New Character
						{watchedValues.class && (
							<Badge variant="secondary" className="capitalize">
								{watchedValues.class}
							</Badge>
						)}
						{watchedValues.race && (
							<Badge variant="outline" className="capitalize">
								{watchedValues.race.replace("_", " ")}
							</Badge>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form.AppForm>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-8"
						>
							{/* Basic Information */}
							<section>
								<h3 className="text-lg font-semibold mb-4">
									Basic Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{renderSmartField("name", {
										placeholder: "Enter character name",
									})}

									{renderSmartField("class", {
										description: "Character's primary class",
										placeholder: "Select a class",
									})}

									{renderSmartField("race", {
										description: "Character's species or ancestry",
										placeholder: "Select a race",
									})}

									{renderSmartField("level", {
										description: "Character level (1-20)",
									})}
								</div>
							</section>

							<Separator />

							{/* Attributes */}
							<section>
								<h3 className="text-lg font-semibold mb-4">
									Ability Scores
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
									{renderSmartField("strength", {
										description: "Physical power",
									})}
									{renderSmartField("dexterity", {
										description: "Agility and reflexes",
									})}
									{renderSmartField("constitution", {
										description: "Health and stamina",
									})}
									{renderSmartField("intelligence", {
										description: "Reasoning ability",
									})}
									{renderSmartField("wisdom", {
										description: "Awareness and insight",
									})}
									{renderSmartField("charisma", {
										description: "Force of personality",
									})}
								</div>
							</section>

							<Separator />

							{/* Background & Personality */}
							<section>
								<h3 className="text-lg font-semibold mb-4">
									Background & Personality
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{renderSmartField("background", {
										description:
											"Character's life before adventuring",
										placeholder: "Select background",
									})}

									{renderSmartField("alignment", {
										description: "Moral and ethical outlook",
										placeholder: "Select alignment",
									})}
								</div>

								<div className="mt-4">
									{renderSmartField("description", {
										type: "textarea",
										placeholder:
											"Describe your character's appearance, personality, goals, fears, and backstory...",
										description:
											"Rich character description (max 1000 characters)",
									})}
								</div>
							</section>

							<Separator />

							{/* Combat Stats */}
							<section>
								<h3 className="text-lg font-semibold mb-4">
									Combat Statistics
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{renderSmartField("hit_points", {
										description: suggestedHP
											? `Suggested: ${suggestedHP} HP`
											: "Maximum hit points",
										placeholder: suggestedHP?.toString(),
									})}

									{renderSmartField("armor_class", {
										description: "Difficulty to hit in combat",
										placeholder: "10",
									})}

									{renderSmartField("proficiency_bonus", {
										description: "Bonus to proficient skills/attacks",
									})}
								</div>
							</section>

							{/* Conditional Content based on class */}
							{watchedValues.class && (
								<>
									<Separator />
									<section>
										<h3 className="text-lg font-semibold mb-4">
											{watchedValues.class === "wizard"
												? "Spellcasting"
												: watchedValues.class === "fighter"
													? "Combat Training"
													: watchedValues.class === "rogue"
														? "Roguish Features"
														: "Class Features"}
										</h3>
										<div className="space-y-4">
											{renderSmartField("starting_equipment", {
												type: "textarea",
												placeholder:
													watchedValues.class === "wizard"
														? "Spellbook, component pouch, scholar's pack..."
														: watchedValues.class ===
																"fighter"
															? "Chain mail, shield, martial weapon..."
															: watchedValues.class ===
																	"rogue"
																? "Leather armor, thieves' tools, rapier..."
																: "List starting equipment...",
												description: `Equipment typical for a ${watchedValues.class}`,
											})}

											{renderSmartField("special_abilities", {
												type: "textarea",
												placeholder:
													watchedValues.class === "wizard"
														? "Cantrips known, spell slots, arcane recovery..."
														: watchedValues.class ===
																"barbarian"
															? "Rage, unarmored defense..."
															: watchedValues.class ===
																	"rogue"
																? "Sneak attack, thieves' cant..."
																: "Special abilities and features...",
												description: `Class features and special abilities for ${watchedValues.class}`,
											})}
										</div>
									</section>
								</>
							)}

							<Separator />

							{/* Advanced Options */}
							<section>
								<h3 className="text-lg font-semibold mb-4">
									Advanced Options
								</h3>
								<div className="space-y-4">
									{renderSmartField("image_url", {
										placeholder:
											"https://example.com/character-portrait.jpg",
										description: "URL to character portrait image",
									})}

									<div className="flex gap-6">
										{renderSmartField("is_npc", {
											description: "This is a Non-Player Character",
										})}

										{renderSmartField("is_public", {
											description:
												"Other players can view this character",
										})}
									</div>
								</div>
							</section>

							{/* Form Actions */}
							<div className="flex gap-3 pt-6 border-t">
								<Button
									type="submit"
									disabled={mutation.isPending || !form.state.isValid}
									className="flex-1"
								>
									{mutation.isPending
										? "Creating..."
										: "Create Character"}
								</Button>

								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (
											form.state.isDirty &&
											!confirm(
												"Are you sure? All unsaved changes will be lost.",
											)
										) {
											return;
										}
										form.reset();
									}}
								>
									Reset
								</Button>

								<Button
									type="button"
									variant="ghost"
									onClick={() => navigate({ to: ".." })}
								>
									Cancel
								</Button>
							</div>

							{/* Development Debug */}
							{typeof window !== "undefined" && import.meta.env?.DEV && (
								<details className="mt-6 p-4 bg-muted rounded-lg">
									<summary className="cursor-pointer font-semibold mb-2">
										🔧 Debug Info
									</summary>
									<div className="space-y-2 text-xs">
										<div>
											<strong>Form Valid:</strong>{" "}
											{form.state.isValid ? "✅" : "❌"}
										</div>
										<div>
											<strong>Dirty:</strong>{" "}
											{form.state.isDirty ? "✅" : "❌"}
										</div>
										<div>
											<strong>Errors:</strong>
											<pre>
												{JSON.stringify(
													form.state.errors,
													null,
													2,
												)}
											</pre>
										</div>
										<div>
											<strong>Values:</strong>
											<pre>
												{JSON.stringify(
													form.state.values,
													null,
													2,
												)}
											</pre>
										</div>
									</div>
								</details>
							)}
						</form>
					</form.AppForm>
				</CardContent>
			</Card>
		</div>
	);
}
