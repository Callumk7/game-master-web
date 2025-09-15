import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { createNoteMutation, listNotesQueryKey } from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

export function CreateNoteFormV2() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/notes/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/notes/new" });
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createNoteMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.note,
		entityName: "note",
		onSuccess: async () => {
			toast("Note created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return <FormComponent />;
}
