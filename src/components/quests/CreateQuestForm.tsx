import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createQuestMutation,
	listQuestsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";
import { useListQuestsQuery } from "~/queries/quests";
import { Button } from "~/components/ui/button";
import { ParentQuestSelect } from "./ParentQuestSelect";

export function CreateQuestForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/quests/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/quests/new" });
	const navigate = useNavigate();

	// Fetch existing quests for parent selection
	const { data: questsData, isLoading: questsLoading } = useListQuestsQuery(gameId);
	const quests = questsData?.data || [];

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () => createQuestMutation({ path: { game_id: gameId } }),
		schema: schemas.quest,
		entityName: "quest",
		onSuccess: async () => {
			toast("Quest created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
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
						
						{/* Custom parent quest selector */}
						<form.AppField name="parent_id">
							{(field) => (
								<form.Item>
									<field.Label>
										Parent Quest
									</field.Label>
									<field.Control>
										{questsLoading ? (
											<div className="text-muted-foreground text-sm p-2">Loading quests...</div>
										) : (
											<ParentQuestSelect
												quests={quests}
												value={field.state.value}
												onChange={field.handleChange}
												placeholder="Select parent quest (optional)"
											/>
										)}
									</field.Control>
									<field.Description>
										Choose a parent quest to create a hierarchical quest structure. Leave empty for main quests.
									</field.Description>
									<field.Message />
								</form.Item>
							)}
						</form.AppField>
						
						{renderSmartField("tags")}
						{renderSmartField("content")}

						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Creating..." : "Create Quest"}
							</Button>

							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (
										form.state.isDirty &&
										!confirm("Are you sure? All unsaved changes will be lost.")
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

			{mutation.isError && (
				<div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
					<p className="text-sm">
						{(mutation.error as any)?.message || "Something went wrong"}
					</p>
				</div>
			)}
		</div>
	);
}
