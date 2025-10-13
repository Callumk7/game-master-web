import { z } from "zod";
import { _Statuses } from "~/types";

/**
 * Create a Zod schema from TypeScript types (manual helper for now)
 * In the future, this could be generated from OpenAPI
 */
export function createSchemaFor() {
	return {
		character: z.object({
			name: z.string().min(1, "Character name is required"),
			class: z.string().min(1, "Character class is required"),
			level: z.coerce
				.number()
				.min(1, "Level must be at least 1")
				.max(100, "Level cannot exceed 100"),
			image_url: z.union([z.url(), z.literal("")]).optional(),
			tags: z.array(z.string()).optional(),
			content: z.string().optional(),
			alive: z.boolean().optional(),
		}),

		faction: z.object({
			name: z.string().min(1, "Faction name is required"),
			tags: z.array(z.string()).optional(),
			content: z.string().optional(),
		}),

		// Add more schemas as needed
		game: z.object({
			name: z.string().min(1, "Game name is required"),
			setting: z.string().optional(),
			content: z.string().optional(),
		}),

		note: z.object({
			name: z.string().min(1, "Note name is required"),
			tags: z.array(z.string()).optional(),
			content: z.string().optional(),
		}),

		quest: z.object({
			name: z.string().min(1, "Quest name is required"),
			parent_id: z.string().nullable().optional(),
			tags: z.array(z.string()).optional(),
			content: z.string().optional(),
			status: z.enum(_Statuses),
		}),

		location: z.object({
			name: z.string().min(1, "Location name is required"),
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
			tags: z.array(z.string()).optional(),
			content: z.string().optional(),
		}),
	};
}

export const schemas = createSchemaFor();
