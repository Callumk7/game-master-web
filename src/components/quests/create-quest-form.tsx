import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createQuestMutation,
	getQuestTreeQueryKey,
	listGameEntitiesQueryKey,
	listQuestsQueryKey,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { schemas, useSmartForm } from "~/lib/smart-form-factory";
import { useCreateQuestParentId } from "~/state/ui";
import { ParentQuestSelect } from "./parent-quest-select";

interface CreateQuestFormProps {
	container?: React.RefObject<HTMLElement | null>;
	onSuccess?: () => void;
}

export function CreateQuestForm({ container, onSuccess }: CreateQuestFormProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();

	// Fetch existing quests for parent selection
	const { data: questsData, isLoading: questsLoading } = useListQuestsQuery({
		path: { game_id: gameId },
	});
	const quests = questsData?.data || [];

	const parentId = useCreateQuestParentId();

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () => createQuestMutation({ path: { game_id: gameId } }),
		schema: schemas.quest,
		entityName: "quest",
		onSuccess: async () => {
			toast.success("Quest created successfully!");
			queryClient.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getQuestTreeQueryKey({
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
		},
		initialValues: {
			parent_id: parentId,
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
						{renderSmartField("status")}

						{/* Custom parent quest selector */}
						{!parentId && (
							<form.AppField name="parent_id">
								{(field) => (
									<form.Item>
										<field.Label>Parent Quest</field.Label>
										<field.Control>
											{questsLoading ? (
												<div className="text-muted-foreground text-sm p-2">
													Loading quests...
												</div>
											) : (
												<ParentQuestSelect
													quests={quests}
													value={field.state.value}
													onChange={field.handleChange}
													placeholder="Select parent quest (optional)"
													container={container}
												/>
											)}
										</field.Control>
										<field.Description>
											Choose a parent quest to create a hierarchical
											quest structure. Leave empty for main quests.
										</field.Description>
										<field.Message />
									</form.Item>
								)}
							</form.AppField>
						)}

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

			{mutation.isError && (
				<div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
					<p className="text-sm">
						{mutation.error instanceof Error
							? mutation.error.message
							: "Something went wrong"}
					</p>
				</div>
			)}
		</div>
	);
}
