/** biome-ignore-all lint/suspicious/noExplicitAny: Zod internal types */
import { z } from "zod";
import type { FieldConfig } from "./factory-v2";

/**
 * Extract default values from a Zod schema
 */
export function extractDefaultValues<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
): Partial<z.infer<typeof schema>> {
	const defaults: Record<string, unknown> = {};

	for (const [key, zodType] of Object.entries(schema.shape)) {
		const def = (zodType as { _def?: { defaultValue?: unknown } })._def;

		if (def?.defaultValue !== undefined) {
			defaults[key] =
				typeof def.defaultValue === "function"
					? def.defaultValue()
					: def.defaultValue;
		} else if (!(zodType instanceof z.ZodOptional)) {
			// Infer sensible defaults based on type (skip optional fields)
			if (zodType instanceof z.ZodString) {
				defaults[key] = "";
			} else if (zodType instanceof z.ZodNumber) {
				defaults[key] =
					(
						def as { checks?: Array<{ kind: string; value: number }> }
					)?.checks?.find((c) => c.kind === "min")?.value ?? 0;
			} else if (zodType instanceof z.ZodBoolean) {
				defaults[key] = false;
			} else if (zodType instanceof z.ZodArray) {
				defaults[key] = [];
			} else if (zodType instanceof z.ZodEnum) {
				// For enum fields (selects), default to empty string to maintain controlled state
				defaults[key] = "";
			}
		}
	}

	return defaults as Partial<z.infer<typeof schema>>;
}

/**
 * Generate field configurations from a Zod schema with smart type detection
 */
export function generateFieldsFromSchema<T extends z.ZodRawShape>(
	schema: z.ZodObject<T>,
	overrides: Partial<Record<keyof T, Partial<FieldConfig> | null>> = {},
): FieldConfig[] {
	const fields: FieldConfig[] = [];

	for (const [key, zodType] of Object.entries(schema.shape)) {
		const fieldName = key as keyof T;
		
		// Skip field if override is null (excludes the field)
		if (overrides[fieldName] === null) {
			continue;
		}

		const field: FieldConfig = {
			name: key,
			label: titleCase(key),
			type: "text",
			required: !(zodType instanceof z.ZodOptional),
			...overrides[fieldName],
		};

		// Detect field type from Zod type
		const actualType =
			zodType instanceof z.ZodOptional ? (zodType as any)._def.innerType : zodType;

		if (actualType instanceof z.ZodString) {
			const checks = (actualType as any)._def?.checks || [];

			// Check for email
			if (checks.some((c: { kind: string }) => c.kind === "email")) {
				field.type = "email";
			}
			// Check for URL
			else if (checks.some((c: { kind: string }) => c.kind === "url")) {
				field.type = "text";
				field.placeholder = "https://example.com";
			}
			// Check for rich text editor fields (complex content)
			else if (
				key.includes("content") ||
				key.includes("description") ||
				key.includes("notes") ||
				key.includes("body") ||
				key.includes("message")
			) {
				field.type = "editor";
			}
			// Check for password fields
			else if (key.includes("password")) {
				field.type = "password";
			}

			// Add string validation
			const minCheck = checks.find(
				(c: { kind: string; value?: number }) => c.kind === "min",
			);
			const maxCheck = checks.find(
				(c: { kind: string; value?: number }) => c.kind === "max",
			);
			if (minCheck || maxCheck) {
				field.validation = {
					minLength: minCheck?.value,
					maxLength: maxCheck?.value,
				};
			}
		} else if (actualType instanceof z.ZodNumber) {
			field.type = "number";

			const checks = (actualType as any)._def?.checks || [];
			const minCheck = checks.find(
				(c: { kind: string; value?: number }) => c.kind === "min",
			);
			const maxCheck = checks.find(
				(c: { kind: string; value?: number }) => c.kind === "max",
			);

			if (minCheck || maxCheck) {
				field.validation = {
					min: minCheck?.value,
					max: maxCheck?.value,
				};
			}
		} else if (actualType instanceof z.ZodBoolean) {
			field.type = "checkbox";
		} else if (actualType instanceof z.ZodEnum) {
			field.type = "select";
			const enumValues = actualType.options || [];
			field.options = enumValues.map((value) => ({
				value: String(value),
				label: titleCase(String(value)),
			}));
		} else if (actualType instanceof z.ZodDate) {
			field.type = "date";
		} else if (actualType instanceof z.ZodArray) {
			// Check if it's an array of strings, likely for tags
			const elementType = (actualType as any)._def?.element;
			if (elementType instanceof z.ZodString) {
				field.type = "tags";
			}
		}

		fields.push(field);
	}

	return fields;
}

/**
 * Convert snake_case or camelCase to Title Case
 */
function titleCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to spaces
		.replace(/[_-]/g, " ") // snake_case or kebab-case to spaces
		.replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize words
		.trim();
}

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
		}),

		faction: z.object({
			name: z.string().min(1, "Faction name is required"),
			tags: z.array(z.string()).optional(),
			content: z.string(),
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
			parent_id: z.string().optional(),
			parent_type: z
				.enum(["note", "quest", "location", "character", "faction"])
				.optional(),
			content: z.string().min(1, "Note content is required"),
		}),

		quest: z.object({
			name: z.string().min(1, "Quest name is required"),
			parent_id: z.string().optional(),
			tags: z.array(z.string()).optional(),
			content: z.string().min(1, "Quest content is required"),
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
