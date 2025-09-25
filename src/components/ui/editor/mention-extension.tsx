import { Mention } from "@tiptap/extension-mention";
import { ReactRenderer, ReactNodeViewRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import tippy, { type Instance } from "tippy.js";
import { MentionList } from "./mention-list";
import { MentionComponent } from "./mention-component";

export interface MentionItem {
	id: string;
	label: string;
	type: "character" | "faction" | "location" | "note" | "quest";
	gameId: string;
}

export const CustomMention = Mention.extend({
	name: "mention",

	addAttributes() {
		return {
			...this.parent?.(),
			id: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-id"),
				renderHTML: (attributes) => {
					if (!attributes.id) return {};
					return { "data-id": attributes.id };
				},
			},
			label: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-label") || element.textContent,
				renderHTML: (attributes) => {
					if (!attributes.label) return {};
					return { "data-label": attributes.label };
				},
			},
			type: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-type"),
				renderHTML: (attributes) => {
					if (!attributes.type) return {};
					return { "data-type": attributes.type };
				},
			},
			gameId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-game-id"),
				renderHTML: (attributes) => {
					if (!attributes.gameId) return {};
					return { "data-game-id": attributes.gameId };
				},
			},
		};
	},

	addNodeView() {
		console.log("Adding node view for mention");
		return ReactNodeViewRenderer(MentionComponent, {
			contentDOMElementTag: "span",
		});
	},
}).configure({
	suggestion: {
		items: ({ query }) => {
			// This will be populated from the component
			return [];
		},
		command: ({ editor, range, props }) => {
			console.log("Mention command called with props:", props);
			// Insert mention with all required attributes
			editor
				.chain()
				.focus()
				.insertContentAt(range, [
					{
						type: "mention",
						attrs: {
							id: props.id,
							label: props.label,
							type: props.type,
							gameId: props.gameId,
						},
					},
					{ type: "text", text: " " },
				])
				.run();
		},
		render: () => {
			let component: ReactRenderer<any>;
			let popup: Instance[];

			return {
				onStart: (props) => {
					component = new ReactRenderer(MentionList, {
						props,
						editor: props.editor,
					});

					if (!props.clientRect) {
						return;
					}

					popup = tippy("body", {
						getReferenceClientRect: props.clientRect,
						appendTo: () => document.body,
						content: component.element,
						showOnCreate: true,
						interactive: true,
						trigger: "manual",
						placement: "bottom-start",
					});
				},

				onUpdate(props) {
					component.updateProps(props);

					if (!props.clientRect) {
						return;
					}

					popup[0].setProps({
						getReferenceClientRect: props.clientRect,
					});
				},

				onKeyDown(props) {
					if (props.event.key === "Escape") {
						popup[0].hide();
						return true;
					}

					return component.ref?.onKeyDown(props);
				},

				onExit() {
					popup[0].destroy();
					component.destroy();
				},
			};
		},
		pluginKey: new PluginKey("mention"),
	},
});
