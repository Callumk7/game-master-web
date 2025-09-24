import { useParams, useRouteContext } from "@tanstack/react-router";
import type { NoteUpdateParams } from "~/api";
import {
	getNoteQueryKey,
	listNotesQueryKey,
	updateNoteMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditNoteFormProps {
	initialData?: Partial<NoteUpdateParams>;
}

export function EditNoteForm({ initialData }: EditNoteFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/notes/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/notes/$id/edit" });

	const FormWithContext = createSmartForm({
		mutation: () =>
			updateNoteMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			context.queryClient.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			context.queryClient.invalidateQueries({
				queryKey: getNoteQueryKey({
					path: {
						game_id: gameId,
						id,
					},
				}),
			});
		},
		schema: schemas.note,
		initialValues: initialData,
		entityName: "note",
	});

	return <FormWithContext />;
}
