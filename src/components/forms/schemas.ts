import { z } from "zod";

// Schema generators based on your Swagger definitions

export const schemas = {
	// Character schemas
	character: z.object({
		character: z.object({
			name: z.string().min(1, "Name is required"),
			class: z.string().min(1, "Class is required"),
			level: z.number().min(1).max(20),
			content: z.string().optional(),
			image_url: z.url().optional().or(z.literal("")),
		}),
	}),

	// Faction schemas
	faction: z.object({
		faction: z.object({
			name: z.string().min(1, "Name is required"),
			content: z.string().min(1, "Content is required"),
		}),
	}),

	// Location schemas
	location: z.object({
		location: z.object({
			name: z.string().min(1, "Name is required"),
			type: z.enum([
				"continent",
				"nation",
				"region",
				"city",
				"settlement",
				"building",
				"complex",
			]),
			content: z.string().optional(),
			parent_id: z.string().optional(),
		}),
	}),

	// Quest schemas
	quest: z.object({
		quest: z.object({
			name: z.string().min(1, "Name is required"),
			content: z.string().min(1, "Content is required"),
		}),
	}),

	// Note schemas
	note: z.object({
		note: z.object({
			name: z.string().min(1, "Name is required"),
			content: z.string().min(1, "Content is required"),
		}),
	}),

	// Game schemas
	game: z.object({
		game: z.object({
			name: z.string().min(1, "Name is required"),
			content: z.string().optional(),
			setting: z.string().optional(),
		}),
	}),

	// Link schemas
	link: z.object({
		entity_type: z.enum(["character", "faction", "location", "quest"]),
		entity_id: z.string().min(1, "Entity ID is required"),
	}),

	// Auth schemas
	login: z.object({
		email: z.email("Invalid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	}),

	signup: z.object({
		email: z.email("Invalid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	}),
};

// Field configurations for each entity type
export const fieldConfigs = {
	character: [
		{ name: "character.name", label: "Name", type: "text" as const, required: true },
		{
			name: "character.class",
			label: "Class",
			type: "text" as const,
			required: true,
		},
		{
			name: "character.level",
			label: "Level",
			type: "number" as const,
			required: true,
		},
		{
			name: "character.content",
			label: "Content",
			type: "textarea" as const,
		},
		{ name: "character.image_url", label: "Image URL", type: "text" as const },
	],

	faction: [
		{ name: "faction.name", label: "Name", type: "text" as const, required: true },
		{
			name: "faction.content",
			label: "Content",
			type: "textarea" as const,
			required: true,
		},
	],

	location: [
		{ name: "location.name", label: "Name", type: "text" as const, required: true },
		{
			name: "location.type",
			label: "Type",
			type: "select" as const,
			required: true,
			options: [
				{ value: "continent", label: "Continent" },
				{ value: "nation", label: "Nation" },
				{ value: "region", label: "Region" },
				{ value: "city", label: "City" },
				{ value: "settlement", label: "Settlement" },
				{ value: "building", label: "Building" },
				{ value: "complex", label: "Complex" },
			],
		},
		{ name: "location.content", label: "Content", type: "textarea" as const },
		{
			name: "location.parent_id",
			label: "Parent Location ID",
			type: "text" as const,
		},
	],

	quest: [
		{ name: "quest.name", label: "Name", type: "text" as const, required: true },
		{
			name: "quest.content",
			label: "Content",
			type: "textarea" as const,
			required: true,
		},
	],

	note: [
		{ name: "note.name", label: "Name", type: "text" as const, required: true },
		{
			name: "note.content",
			label: "Content",
			type: "textarea" as const,
			required: true,
		},
	],

	game: [
		{ name: "game.name", label: "Name", type: "text" as const, required: true },
		{ name: "game.content", label: "Content", type: "textarea" as const },
		{ name: "game.setting", label: "Setting", type: "text" as const },
	],

	link: [
		{
			name: "entity_type",
			label: "Entity Type",
			type: "select" as const,
			required: true,
			options: [
				{ value: "character", label: "Character" },
				{ value: "faction", label: "Faction" },
				{ value: "location", label: "Location" },
				{ value: "quest", label: "Quest" },
			],
		},
		{
			name: "entity_id",
			label: "Entity ID",
			type: "text" as const,
			required: true,
		},
	],

	login: [
		{ name: "email", label: "Email", type: "email" as const, required: true },
		{
			name: "password",
			label: "Password",
			type: "password" as const,
			required: true,
		},
	],

	signup: [
		{ name: "email", label: "Email", type: "email" as const, required: true },
		{
			name: "password",
			label: "Password",
			type: "password" as const,
			required: true,
		},
	],
};
