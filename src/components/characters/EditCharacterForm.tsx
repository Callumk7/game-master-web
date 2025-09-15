import { useParams, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";
import {
	getCharacterQueryKey,
	listCharactersQueryKey,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";
import type { CharacterParams } from "~/api/types.gen";
import { createFormComponent } from "~/components/forms/factory-v2";

// Schema for validation
const characterSchema = z.object({
	name: z.string().min(1, "Character name is required"),
	class: z.string().min(1, "Character class is required"),
	level: z
		.number()
		.min(1, "Level must be at least 1")
		.max(100, "Level cannot exceed 100"),
	description: z.string().optional(),
	image_url: z.url("Must be a valid URL").optional().or(z.literal("")),
});

// Field configuration
const characterFields = [
	{
		name: "name",
		label: "Character Name",
		type: "text" as const,
		placeholder: "Enter character name",
		required: true,
	},
	{
		name: "class",
		label: "Character Class",
		type: "text" as const,
		placeholder: "e.g., Fighter, Wizard, Rogue",
		required: true,
		description: "The character's class or profession",
	},
	{
		name: "level",
		label: "Level",
		type: "number" as const,
		placeholder: "1",
		required: true,
		validation: {
			min: 1,
			max: 100,
		},
		description: "Character level (1-100)",
	},
	{
		name: "description",
		label: "Description",
		type: "textarea" as const,
		placeholder: "Describe the character's appearance, personality, backstory...",
		required: false,
		description: "Optional character description and background",
	},
	{
		name: "image_url",
		label: "Image URL",
		type: "text" as const,
		placeholder: "https://example.com/character-image.jpg",
		required: false,
		description: "Optional URL to a character portrait image",
	},
];

interface EditCharacterFormProps {
	initialData?: Partial<CharacterParams>;
}

export function EditCharacterForm({ initialData }: EditCharacterFormProps) {
	const { gameId, id } = useParams({
		from: "/_auth/games/$gameId/characters/$id/edit",
	});
	const context = useRouteContext({ from: "/_auth/games/$gameId/characters/$id/edit" });

	// Create form component with proper context handling
	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = updateCharacterMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			});
			return {
				...baseMutation,
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listCharactersQueryKey({
							path: { game_id: gameId },
						}),
					});
					context.queryClient.invalidateQueries({
						queryKey: getCharacterQueryKey({
							path: {
								game_id: gameId,
								id: id,
							},
						}),
					});
				},
			};
		},
		schema: characterSchema,
		fields: characterFields,
		defaultValues: {
			name: initialData?.name || "",
			class: initialData?.class || "",
			level: initialData?.level || 1,
			description: initialData?.description || "",
			image_url: initialData?.image_url || "",
		} satisfies CharacterParams,
		className: "max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md",
		entityName: "character",
	});

	return <FormWithContext />;
}

