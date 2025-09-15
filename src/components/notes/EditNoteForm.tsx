import { useParams, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";
import type { NoteParams } from "~/api";
import {
	getNoteQueryKey,
	listNotesQueryKey,
	updateNoteMutation,
} from "~/api/@tanstack/react-query.gen";
import { createFormComponent } from "~/components/forms/factory-v2";

// Schema for validation
const noteSchema = z.object({
	name: z.string().min(1, "Note name is required"),
	content: z.string().min(1, "Note content is required"),
});

// Field configuration
const noteFields = [
	{
		name: "name",
		label: "Note Name",
		type: "text" as const,
		placeholder: "Enter note name",
		required: true,
	},
	{
		name: "content",
		label: "Note Content",
		type: "textarea" as const,
		placeholder: "Write your note content...",
		required: true,
		description: "The main content of your note",
	},
];

interface EditNoteFormProps {
	initialData?: Partial<NoteParams>;
}

export function EditNoteForm({ initialData }: EditNoteFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/notes/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/notes/$id/edit" });

	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = updateNoteMutation({
				path: {
					game_id: gameId,
					id,
				},
			});
			return {
				...baseMutation,
				onSuccess: () => {
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
			};
		},
		schema: noteSchema,
		fields: noteFields,
		defaultValues: {
			name: initialData?.name || "",
			content: initialData?.content || "",
		} satisfies NoteParams,
		className: "max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md",
		entityName: "note",
	});

	return <FormWithContext />;
}

