import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EntityImageComponent } from "./entity-image-component";

export interface EntityImageAttributes {
	imageId: string;
	entityId: string;
	entityType: string;
	gameId: string;
	alt?: string;
	width?: number;
	height?: number;
}

export const EntityImage = Node.create({
	name: "entityImage",

	group: "block",

	draggable: true,

	addAttributes() {
		return {
			imageId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-image-id"),
				renderHTML: (attributes) => ({
					"data-image-id": attributes.imageId,
				}),
			},
			entityId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-entity-id"),
				renderHTML: (attributes) => ({
					"data-entity-id": attributes.entityId,
				}),
			},
			entityType: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-entity-type"),
				renderHTML: (attributes) => ({
					"data-entity-type": attributes.entityType,
				}),
			},
			gameId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-game-id"),
				renderHTML: (attributes) => ({
					"data-game-id": attributes.gameId,
				}),
			},
			alt: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-alt"),
				renderHTML: (attributes) => ({
					"data-alt": attributes.alt,
				}),
			},
			width: {
				default: null,
				parseHTML: (element) => {
					const width = element.getAttribute("data-width");
					return width ? Number.parseInt(width, 10) : null;
				},
				renderHTML: (attributes) => ({
					"data-width": attributes.width,
				}),
			},
			height: {
				default: null,
				parseHTML: (element) => {
					const height = element.getAttribute("data-height");
					return height ? Number.parseInt(height, 10) : null;
				},
				renderHTML: (attributes) => ({
					"data-height": attributes.height,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="entityImage"]',
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes({ "data-type": "entityImage" }, HTMLAttributes),
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(EntityImageComponent, {
			as: "div",
			className: "entity-image-wrapper",
		});
	},
});
