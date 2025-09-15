import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createGameMutation,
	listGamesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "~/components/forms/type-utils";

export function CreateGameFormV3() {
	const context = useRouteContext({ from: "/_auth/games/new" });
	const navigate = useNavigate();

	// Create form with minimal configuration - everything auto-generated!
	const FormComponent = createSmartForm({
		mutation: () => createGameMutation({}),
		schema: schemas.game,
		entityName: "game",
		onSuccess: async () => {
			toast("Game created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listGamesQueryKey({}),
			});
			navigate({ to: "/games" });
		},
		// Optional: customize specific fields only when needed
		fieldOverrides: {
			description: {
				type: "textarea",
				placeholder: "Describe your game world, setting, or campaign...",
				description: "Optional description of your game",
			},
			setting: {
				placeholder: "e.g., Medieval Fantasy, Cyberpunk, Modern Horror",
				description: "The genre or setting of your game",
			},
		},
		className: "max-w-lg mx-auto bg-card p-6 rounded-lg shadow-md",
		submitText: "Create Game",
	});

	return <FormComponent />;
}
