import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createLocationMutation,
	listLocationsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

export function CreateLocationFormV2() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/locations/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/locations/new" });
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createLocationMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.location,
		entityName: "location",
		onSuccess: async () => {
			toast("Location created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return <FormComponent />;
}
