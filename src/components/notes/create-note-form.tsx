import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createNoteMutation,
	listGameEntitiesQueryKey,
	listNotesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import type { EntityType } from "~/types";
import { useSmartForm, schemas } from "~/lib/smart-form-factory";

interface CreateNoteFormProps {
	/** Optional parent entity ID */
	parentId?: string;
	/** Optional parent entity type */
	parentType?: EntityType;
	/** Custom CSS class for form container */
	className?: string;
	/** Custom submit button text */
	submitText?: string;
	/** Custom success callback (overrides default navigation) */
	onSuccess?: () => void;
}

export function CreateNoteForm({
	parentId,
	parentType,
	className = "space-y-6",
	submitText = "Create Note",
	onSuccess: customOnSuccess,
}: CreateNoteFormProps = {}) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();

	// Prepare initial values with parent info if provided
	const initialValues = {
		...(parentId && { parent_id: parentId }),
		...(parentType && { parent_type: parentType }),
	};

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createNoteMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.note,
		entityName: "note",
		initialValues,
		onSuccess: async () => {
			toast("Note created successfully!");
			queryClient.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});

			if (customOnSuccess) {
				customOnSuccess();
			} else {
			}
		},
	});

	return (
		<div className={className}>
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="space-y-6">
						{renderSmartField("name")}
						{renderSmartField("tags")}

						{/* Only show parent fields if not pre-filled via props */}
						{!parentId &&
							renderSmartField("parent_id", {
								label: "Parent Entity ID",
								description:
									"Optional ID of the parent entity this note belongs to",
							})}

						{!parentType &&
							renderSmartField("parent_type", {
								label: "Parent Entity Type",
								description: "Type of the parent entity",
							})}

						{renderSmartField("content")}

						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Creating..." : submitText}
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
						{(mutation.error as any)?.message || "Something went wrong"}
					</p>
				</div>
			)}
		</div>
	);
}
