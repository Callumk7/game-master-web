import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { NoteUpdateParams } from "~/api";
import {
	getNoteQueryKey,
	listNotesQueryKey,
	updateNoteMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditNoteFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<NoteUpdateParams>;
}

export function EditNoteForm({ initialData, params }: EditNoteFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			updateNoteMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			toast("Note updated successfully!");
			queryClient.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getNoteQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			navigate({ to: ".." });
		},
		schema: schemas.note,
		entityName: "note",
		initialValues: {
			...initialData,
		},
		fieldOverrides: {
			content: null,
		},
	});

	return <FormComponent />;
}
