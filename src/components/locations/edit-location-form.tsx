import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { LocationUpdateParams } from "~/api";
import {
	getLocationQueryKey,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditLocationFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<LocationUpdateParams>;
}

export function EditLocationForm({ initialData, params }: EditLocationFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			updateLocationMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),
		onSuccess: async () => {
			toast("Location updated successfully!");
			queryClient.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getLocationQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			navigate({ to: ".." });
		},
		schema: schemas.location,
		entityName: "location",
		initialValues: {
			...initialData,
			image_url: initialData?.image_url || undefined,
		},
		fieldOverrides: {
			content: null,
		},
	});

	return <FormComponent />;
}
