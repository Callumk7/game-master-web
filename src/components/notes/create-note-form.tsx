import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { createNoteLink, type LinkRequest } from "~/api";
import {
	createNoteMutation,
	listGameEntitiesQueryKey,
	listNotesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { schemas, useSmartForm } from "~/lib/smart-form-factory";
import { getLinkQueryKey } from "~/queries/utils";
import type { EntityType } from "~/types";

interface CreateNoteFormProps {
	link?: {
		linkId: string;
		linkType: EntityType;
	};
	className?: string;
	submitText?: string;
	onSuccess?: () => void;
}

export function CreateNoteForm({
	link,
	className = "space-y-6",
	submitText = "Create Note",
	onSuccess: customOnSuccess,
}: CreateNoteFormProps = {}) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createNoteMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.note,
		entityName: "note",
		onSuccess: async ({ data: note }) => {
			if (note && link) {
				const result = await createNoteLink({
					path: { game_id: gameId, note_id: note.id },
					body: createLinkRequest(link),
				});

				if (result.error) {
					// TODO: handle secondary mutation here
				}

				if (result.response.ok) {
					queryClient.invalidateQueries({
						queryKey: getLinkQueryKey(link, gameId),
					});
				}
			}
			toast.success("Note created successfully!");
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
						{mutation.error instanceof Error
							? mutation.error.message
							: "Something went wrong"}
					</p>
				</div>
			)}
		</div>
	);
}

function createLinkRequest(link: { linkId: string; linkType: EntityType }): LinkRequest {
	return {
		entity_id: link.linkId,
		entity_type: link.linkType,
	};
}
