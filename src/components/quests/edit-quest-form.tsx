import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QuestUpdateParams } from "~/api";
import {
	getQuestQueryKey,
	listQuestsQueryKey,
	updateQuestMutation,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";
import { schemas, useSmartForm } from "~/lib/smart-form-factory";
import { useUIActions } from "~/state/ui";
import { Button } from "../ui/button";
import { ParentQuestSelect } from "./parent-quest-select";

interface EditQuestFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<QuestUpdateParams>;
}

export function EditQuestForm({ initialData, params }: EditQuestFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const { setIsEditQuestOpen } = useUIActions();

	const { data: questsData, isLoading: questsLoading } = useListQuestsQuery({
		path: { game_id: gameId },
	});
	const quests = questsData?.data || [];

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			updateQuestMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			toast.success("Quest updated successfully!");
			queryClient.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getQuestQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			setIsEditQuestOpen(false);
		},
		schema: schemas.quest,
		entityName: "quest",
		initialValues: {
			...initialData,
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
						{renderSmartField("tags")}
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
						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Updating..." : "Update Quest"}
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
