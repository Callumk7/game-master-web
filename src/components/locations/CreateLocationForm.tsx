import { useParams, useRouteContext } from "@tanstack/react-router";
import z from "zod";
import {
	createLocationMutation,
	listLocationsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { LocationParams } from "~/api/types.gen";
import { createFormComponent } from "../forms/factory-v2";

const locationSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	description: z.string().optional(),
	type: z.enum([
		"continent",
		"nation", 
		"region",
		"city",
		"settlement",
		"building",
		"complex",
	]),
	parent_id: z.string().optional(),
});

const locationFields = [
	{
		name: "name",
		label: "Location Name",
		type: "text" as const,
		placeholder: "Enter location name",
		required: true,
	},
	{
		name: "type",
		label: "Location Type",
		type: "select" as const,
		options: [
			{ value: "continent", label: "Continent" },
			{ value: "nation", label: "Nation" },
			{ value: "region", label: "Region" },
			{ value: "city", label: "City" },
			{ value: "settlement", label: "Settlement" },
			{ value: "building", label: "Building" },
			{ value: "complex", label: "Complex" },
		],
		placeholder: "Select location type",
		required: true,
	},
	{
		name: "description",
		label: "Location Description",
		type: "textarea" as const,
		placeholder: "Describe the location's features, history, and notable characteristics...",
		required: false,
		description: "Optional description of the location",
	},
	{
		name: "parent_id",
		label: "Parent Location ID",
		type: "text" as const,
		placeholder: "Enter parent location ID (optional)",
		required: false,
		description: "ID of the parent location (e.g., city for a building)",
	},
];

export function CreateLocationForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/locations/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/locations/new" });

	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = createLocationMutation({
				path: { game_id: gameId },
			});
			return {
				...baseMutation,
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listLocationsQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			};
		},
		schema: locationSchema,
		fields: locationFields,
		defaultValues: {
			name: "",
			description: "",
			type: "city",
			parent_id: undefined,
		} satisfies LocationParams,
		entityName: "location",
	});

	return <FormWithContext />;
}