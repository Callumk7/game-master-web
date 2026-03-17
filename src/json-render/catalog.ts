import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
	components: {
		// === Layout Components ===
		Stack: {
			props: z.object({
				direction: z
					.enum(["row", "column"])
					.optional()
					.default("column")
					.describe("Layout direction"),
				gap: z
					.enum(["none", "sm", "md", "lg", "xl"])
					.optional()
					.default("md")
					.describe("Gap between children"),
				align: z
					.enum(["start", "center", "end", "stretch", "baseline"])
					.optional()
					.default("stretch")
					.describe("Cross-axis alignment"),
				justify: z
					.enum(["start", "center", "end", "between", "around"])
					.optional()
					.default("start")
					.describe("Main-axis justification"),
				wrap: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether children should wrap"),
			}),
			slots: ["default"],
			description:
				"A flex container for laying out children with full control over direction, spacing, and alignment",
		},

		Grid: {
			props: z.object({
				columns: z
					.number()
					.int()
					.min(1)
					.max(12)
					.optional()
					.default(1)
					.describe("Number of columns"),
				gap: z
					.enum(["none", "sm", "md", "lg"])
					.optional()
					.default("md")
					.describe("Gap between grid items"),
			}),
			slots: ["default"],
			description: "A CSS grid container for multi-column layouts",
		},

		Container: {
			props: z.object({
				padding: z
					.enum(["none", "sm", "md", "lg", "xl"])
					.optional()
					.default("md")
					.describe("Container padding"),
				maxWidth: z
					.enum(["sm", "md", "lg", "xl", "2xl", "full"])
					.optional()
					.default("full")
					.describe("Maximum width"),
				background: z
					.enum(["none", "muted", "card", "primary", "secondary"])
					.optional()
					.default("none")
					.describe("Background color"),
				border: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to show a border"),
				rounded: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to round corners"),
			}),
			slots: ["default"],
			description: "A container for content with padding and optional styling",
		},

		// === Typography Components ===
		Heading: {
			props: z.object({
				content: z.string().describe("Heading text"),
				level: z
					.enum(["1", "2", "3", "4", "5", "6"])
					.optional()
					.default("2")
					.describe("Heading level (1-6)"),
			}),
			description: "A semantic heading element with automatic sizing",
		},

		Text: {
			props: z.object({
				content: z.string().describe("Text content to display"),
				variant: z
					.enum([
						"default",
						"muted",
						"primary",
						"secondary",
						"destructive",
						"success",
						"warning",
						"info",
					])
					.optional()
					.default("default")
					.describe("Text style variant"),
				size: z
					.enum(["xs", "sm", "default", "lg", "xl"])
					.optional()
					.default("default")
					.describe("Text size"),
				weight: z
					.enum(["normal", "medium", "semibold", "bold"])
					.optional()
					.default("normal")
					.describe("Font weight"),
			}),
			description: "Text content with flexible styling options",
		},

		// === Card Components ===
		Card: {
			props: z.object({
				title: z.string().describe("Card title"),
				description: z.string().optional().describe("Optional card description"),
				variant: z
					.enum(["default", "outline", "ghost", "elevated"])
					.optional()
					.default("default")
					.describe("Card style variant"),
			}),
			slots: ["default"],
			description: "A card container for grouping related content",
		},

		MetricCard: {
			props: z.object({
				label: z.string().describe("Metric label"),
				value: z.string().describe("Metric value"),
				change: z
					.string()
					.optional()
					.describe("Optional change indicator (e.g., '+12%')"),
				changeVariant: z
					.enum(["positive", "negative", "neutral"])
					.optional()
					.describe("Color ofchange indicator"),
				icon: z.string().optional().describe("Optional icon name"),
			}),
			description:
				"A metric card showing a key value with label and optional change indicator",
		},

		CharacterCard: {
			props: z.object({
				name: z.string().describe("Character name"),
				race: z.string().optional().describe("Character race"),
				class: z.string().optional().describe("Character class"),
				level: z.number().int().optional().describe("Character level"),
				status: z
					.enum(["alive", "dead", "unknown"])
					.optional()
					.default("alive")
					.describe("Character status"),
				tags: z.array(z.string()).optional().describe("Tags for the character"),
			}),
			description:
				"A card specifically for displaying character information in a TTRPG context",
		},

		QuestCard: {
			props: z.object({
				title: z.string().describe("Quest title"),
				description: z.string().optional().describe("Quest description"),
				status: z
					.enum([
						"preparing",
						"ready",
						"active",
						"paused",
						"completed",
						"cancelled",
					])
					.optional()
					.default("preparing")
					.describe("Quest status"),
				objectives: z
					.array(
						z.object({
							text: z.string().describe("Objective description"),
							completed: z
								.boolean()
								.optional()
								.default(false)
								.describe("Whether objective is completed"),
						}),
					)
					.optional()
					.describe("Quest objectives"),
			}),
			description:
				"A card for displaying quest information with status and objectives",
		},

		// === Data Display Components ===
		Table: {
			props: z.object({
				columns: z
					.array(
						z.object({
							key: z.string().describe("Column key"),
							header: z.string().describe("Column header text"),
							align: z
								.enum(["left", "center", "right"])
								.optional()
								.default("left")
								.describe("Column alignment"),
						}),
					)
					.describe("Table columns"),
				rows: z
					.array(z.record(z.string(), z.unknown()))
					.describe("Table rows as key-value objects"),
				rowKey: z
					.string()
					.optional()
					.default("id")
					.describe("Key to use for row uniqueness"),
			}),
			description: "A data table for displaying structured data",
		},

		EntityList: {
			props: z.object({
				items: z
					.array(
						z.object({
							id: z.string().describe("Unique identifier"),
							name: z.string().describe("Entity name"),
							type: z
								.enum([
									"character",
									"location",
									"quest",
									"faction",
									"note",
								])
								.optional()
								.describe("Entity type"),
							description: z
								.string()
								.optional()
								.describe("Short description"),
							imageUrl: z
								.string()
								.optional()
								.describe("Optional image URL"),
							badges: z
								.array(
									z.object({
										text: z.string().describe("Badge text"),
										variant: z
											.enum([
												"default",
												"secondary",
												"destructive",
												"outline",
												"success",
												"warning",
												"info",
											])
											.optional(),
									}),
								)
								.optional()
								.describe("Status badges"),
						}),
					)
					.describe("List of entities to display"),
				layout: z
					.enum(["list", "grid", "compact"])
					.optional()
					.default("list")
					.describe("Display layout"),
			}),
			description: "A list display for entities like characters, locations, quests",
		},

		// === Interactive Components ===
		Button: {
			props: z.object({
				label: z.string().describe("Button text"),
				variant: z
					.enum([
						"default",
						"secondary",
						"outline",
						"ghost",
						"destructive",
						"success",
					])
					.optional()
					.default("default")
					.describe("Button style"),
				size: z
					.enum(["sm", "default", "lg"])
					.optional()
					.default("default")
					.describe("Button size"),
				icon: z.string().optional().describe("Optional icon name"),
				action: z
					.string()
					.optional()
					.describe("Action identifier to emit when clicked"),
			}),
			description: "A clickable button with multiple style variants",
		},

		ButtonGroup: {
			props: z.object({
				buttons: z
					.array(
						z.object({
							label: z.string().describe("Button text"),
							variant: z
								.enum([
									"default",
									"secondary",
									"outline",
									"ghost",
									"destructive",
									"success",
								])
								.optional(),
							action: z.string().optional(),
						}),
					)
					.describe("Buttons in the group"),
				align: z
					.enum(["start", "center", "end", "between"])
					.optional()
					.default("start")
					.describe("Button alignment"),
			}),
			description: "A group of related buttons",
		},

		Badge: {
			props: z.object({
				label: z.string().describe("Badge text"),
				variant: z
					.enum([
						"default",
						"secondary",
						"destructive",
						"outline",
						"success",
						"warning",
						"info",
					])
					.optional()
					.default("default")
					.describe("Badge style"),
				size: z
					.enum(["sm", "default"])
					.optional()
					.default("default")
					.describe("Badge size"),
			}),
			description: "A small badge for labels and status indicators",
		},

		BadgeGroup: {
			props: z.object({
				badges: z
					.array(
						z.object({
							label: z.string().describe("Badge text"),
							variant: z
								.enum([
									"default",
									"secondary",
									"destructive",
									"outline",
									"success",
									"warning",
									"info",
								])
								.optional(),
						}),
					)
					.describe("Badges to display"),
				wrap: z
					.boolean()
					.optional()
					.default(true)
					.describe("Whether badges should wrap"),
			}),
			description: "A group of related badges",
		},

		// === Feedback Components ===
		Alert: {
			props: z.object({
				title: z.string().describe("Alert title"),
				description: z.string().optional().describe("Alert description"),
				variant: z
					.enum(["default", "destructive", "success", "warning", "info"])
					.optional()
					.default("default")
					.describe("Alert style"),
			}),
			description: "An alert for important messages",
		},

		Progress: {
			props: z.object({
				value: z.number().min(0).max(100).describe("Progress percentage (0-100)"),
				label: z
					.string()
					.optional()
					.describe("Optional label above the progress bar"),
				showValue: z
					.boolean()
					.optional()
					.default(false)
					.describe("Whether to show the percentage"),
				variant: z
					.enum(["default", "success", "warning", "destructive"])
					.optional()
					.default("default")
					.describe("Progress bar color"),
			}),
			description: "A progress bar for showing completion status",
		},

		StatBlock: {
			props: z.object({
				title: z
					.string()
					.optional()
					.describe("Optional title for the stat block"),
				stats: z
					.array(
						z.object({
							name: z.string().describe("Stat name"),
							value: z
								.union([z.string(), z.number()])
								.describe("Stat value"),
							modifier: z
								.string()
								.optional()
								.describe("Optional modifier (e.g., '+3')"),
						}),
					)
					.describe("Array of stats to display"),
				columns: z
					.number()
					.int()
					.min(1)
					.max(6)
					.optional()
					.default(2)
					.describe("Number of columns for stat display"),
			}),
			description: "A D&D-style stat block for displaying character attributes",
		},

		// === Media Components ===
		Avatar: {
			props: z.object({
				name: z.string().describe("Name for fallback initials"),
				imageUrl: z.string().optional().describe("Optional image URL"),
				size: z
					.enum(["sm", "default", "lg", "xl"])
					.optional()
					.default("default")
					.describe("Avatar size"),
			}),
			description: "An avatar with image or initials fallback",
		},

		AvatarGroup: {
			props: z.object({
				avatars: z
					.array(
						z.object({
							name: z.string().describe("Name for initials"),
							imageUrl: z
								.string()
								.optional()
								.describe("Optional image URL"),
						}),
					)
					.describe("Avatars to display"),
				max: z
					.number()
					.int()
					.min(1)
					.optional()
					.default(4)
					.describe("Maximum avatars to show before +N"),
				size: z
					.enum(["sm", "default", "lg"])
					.optional()
					.default("default")
					.describe("Avatar size"),
			}),
			description: "A group of avatars with overflow indicator",
		},

		Divider: {
			props: z.object({
				orientation: z
					.enum(["horizontal", "vertical"])
					.optional()
					.default("horizontal")
					.describe("Divider direction"),
				label: z.string().optional().describe("Optional label for the divider"),
			}),
			description: "A visual divider with optional label",
		},

		// === Input Components ===
		Input: {
			props: z.object({
				placeholder: z.string().optional().describe("Input placeholder text"),
				label: z.string().optional().describe("Optional label for the input"),
				type: z
					.enum(["text", "number", "email", "password"])
					.optional()
					.default("text")
					.describe("Input type"),
			}),
			description: "A text input field with optional label",
		},

		TextArea: {
			props: z.object({
				placeholder: z.string().optional().describe("Textarea placeholder"),
				label: z.string().optional().describe("Optional label"),
				rows: z
					.number()
					.int()
					.min(2)
					.max(20)
					.optional()
					.default(3)
					.describe("Number of visible text lines"),
			}),
			description: "A multi-line text input",
		},

		// === Composite Components ===
		Dashboard: {
			props: z.object({
				title: z.string().describe("Dashboard title"),
				description: z.string().optional().describe("Dashboard description"),
			}),
			slots: ["default"],
			description: "A dashboard container with header section",
		},

		InfoGrid: {
			props: z.object({
				title: z.string().optional().describe("Grid section title"),
				items: z
					.array(
						z.object({
							label: z.string().describe("Item label"),
							value: z.string().describe("Item value"),
							variant: z
								.enum(["default", "muted", "primary"])
								.optional()
								.default("default"),
						}),
					)
					.describe("Grid items"),
				columns: z
					.number()
					.int()
					.min(1)
					.max(4)
					.optional()
					.default(2)
					.describe("Number of columns"),
			}),
			description: "A grid of labeled values, like a character info card",
		},

		// === Timeline/History ===
		Timeline: {
			props: z.object({
				items: z
					.array(
						z.object({
							title: z.string().describe("Event title"),
							description: z
								.string()
								.optional()
								.describe("Event description"),
							timestamp: z
								.string()
								.optional()
								.describe("When the event occurred"),
							variant: z
								.enum([
									"default",
									"success",
									"warning",
									"destructive",
									"info",
								])
								.optional()
								.default("default")
								.describe("Event status indicator"),
						}),
					)
					.describe("Timeline events"),
			}),
			description: "A vertical timeline for showing events or history",
		},
	},

	actions: {
		click: {
			params: z.object({
				action: z.string().optional().describe("Action type"),
				elementId: z.string().optional().describe("Element identifier"),
				data: z
					.record(z.string(), z.unknown())
					.optional()
					.describe("Additional action data"),
			}),
			description: "Generic click action",
		},
		navigate: {
			params: z.object({
				path: z.string().describe("Navigation path"),
			}),
			description: "Navigate to a different page",
		},
	},
});
