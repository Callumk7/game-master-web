import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import type { NoteParams } from "~/api";
import { createNoteMutation, listNotesQueryKey } from "~/api/@tanstack/react-query.gen";
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

export function CreateNoteForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/notes/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/notes/new" });
	const navigate = useNavigate();

	// Create form component with proper context handling
	const FormWithContext = createFormComponent({
		mutationOptions: () =>
			createNoteMutation({
				path: { game_id: gameId },
			}),
		onSuccess: async () => {
			toast("Note created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
		schema: noteSchema,
		fields: noteFields,
		defaultValues: {
			name: "",
			content: "",
		} satisfies NoteParams,
		className: "max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md",
		entityName: "note",
	});

	return <FormWithContext />;
}
