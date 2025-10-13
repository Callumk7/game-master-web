import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import { createCharacterLink } from "~/api";
import {
	createCharacterMutation,
	getFactionLinksQueryKey,
	getFactionMembersQueryKey,
	listCharactersQueryKey,
	listFactionsOptions,
	listGameEntitiesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { schemas, useSmartForm } from "~/lib/smart-form-factory";
import { Button } from "../ui/button";
import { FormField } from "../ui/composite/form-field";
import { FactionSelect } from "./faction-select";

interface CreateCharacterFormProps {
	onSuccess?: () => void;
	factionId?: string;
	container?: React.RefObject<HTMLElement | null>;
}

export function CreateCharacterForm({
	onSuccess,
	factionId,
	container,
}: CreateCharacterFormProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [factionRole, setFactionRole] = React.useState<string>("");

	const { data: factionsData, isLoading: factionsLoading } = useQuery({
		...listFactionsOptions({ path: { game_id: gameId } }),
		enabled: factionId === undefined,
	});

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createCharacterMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.character,
		entityName: "character",
		onSuccess: async ({ data: character }) => {
			if (character && factionId) {
				const result = await createCharacterLink({
					path: { game_id: gameId, character_id: character.id },
					body: {
						entity_id: factionId,
						entity_type: "faction",
						faction_role: factionRole,
						is_primary: true,
					},
				});

				if (result.error) {
					// TODO: handle secondary mutation here
				}

				if (result.response.ok) {
					queryClient.invalidateQueries({
						queryKey: getFactionLinksQueryKey({
							path: { game_id: gameId, faction_id: factionId },
						}),
					});
					queryClient.invalidateQueries({
						queryKey: getFactionMembersQueryKey({
							path: { game_id: gameId, faction_id: factionId },
						}),
					});
				}
			}
			toast("Character created successfully!");
			queryClient.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});

			if (onSuccess) {
				onSuccess();
			}

			if (character) {
				navigate({
					to: "/games/$gameId/characters/$id",
					params: { gameId, id: character.id },
				});
			}
		},
	});

	return (
		<div className="space-y-6">
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="space-y-6">
						{renderSmartField("name")}
						{renderSmartField("class")}
						{renderSmartField("level")}
						{renderSmartField("tags")}
						{!factionId && (
							<form.AppField name="member_of_faction_id">
								{(field) => (
									<form.Item>
										<field.Label>Faction</field.Label>
										<field.Control>
											{factionsLoading ? (
												<div className="text-muted-foreground text-sm p-2">
													Loading factions...
												</div>
											) : (
												<FactionSelect
													factions={factionsData?.data ?? []}
													value={field.state.value}
													onChange={field.handleChange}
													placeholder="Select faction"
													container={container}
												/>
											)}
										</field.Control>
										<field.Description>
											Choose a faction to create a character within.
										</field.Description>
										<field.Message />
									</form.Item>
								)}
							</form.AppField>
						)}

						{/* NOT a form field, but for the secondary mutation */}
						{factionId && (
							<FormField
								label="Faction Role"
								value={factionRole}
								onChange={(e) => setFactionRole(e.currentTarget.value)}
							/>
						)}

						{renderSmartField("content")}

						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Creating..." : "Create Character"}
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
						</div>
					</div>
				</form>
			</form.AppForm>
		</div>
	);
}
