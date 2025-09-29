import { mergeAttributes, Node } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import { Suggestion } from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";
import { MentionComponent } from "./mention-component";
import { MentionList } from "./mention-list";

export interface MentionItem {
	id: string;
	label: string;
	type: "character" | "faction" | "location" | "note" | "quest";
	gameId: string;
}

export const SimpleMention = Node.create({
	name: "mention",

	addOptions() {
		return {
			HTMLAttributes: {},
			suggestion: {
				char: "@",
				pluginKey: new PluginKey("mention"),
				command: ({ editor, range, props }: any) => {
					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{
								type: this.name,
								attrs: props,
							},
							{ type: "text", text: " " },
						])
						.run();

					window.getSelection()?.collapseToEnd();
				},
				allow: ({ state, range }: any) => {
					const $from = state.doc.resolve(range.from);
					const type = state.schema.nodes[this.name];
					const allow = !!$from.parent.type.contentMatch.matchType(type);
					return allow;
				},
				render: () => {
					let component: ReactRenderer<any>;
					let popup: Instance[];

					return {
						onStart: (props: any) => {
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

						onUpdate(props: any) {
							component?.updateProps(props);

							if (!props.clientRect || !popup?.length) {
								return;
							}

							popup[0].setProps({
								getReferenceClientRect: props.clientRect,
							});
						},

						onKeyDown(props: any) {
							if (props.event.key === "Escape") {
								if (popup?.length) {
									popup[0].hide();
								}
								return true;
							}

							return component?.ref?.onKeyDown(props);
						},

						onExit() {
							if (popup?.length) {
								popup.forEach((instance) => {
									if (!instance.state.isDestroyed) {
										instance.destroy();
									}
								});
							}
							component?.destroy();
						},
					};
				},
			},
		};
	},

	group: "inline",

	inline: true,

	selectable: false,

	atom: true,

	addAttributes() {
		return {
			id: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-id"),
				renderHTML: (attributes) => ({
					"data-id": attributes.id,
				}),
			},
			label: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-label"),
				renderHTML: (attributes) => ({
					"data-label": attributes.label,
				}),
			},
			type: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-type"),
				renderHTML: (attributes) => ({
					"data-type": attributes.type,
				}),
			},
			gameId: {
				default: null,
				parseHTML: (element) => element.getAttribute("data-game-id"),
				renderHTML: (attributes) => ({
					"data-game-id": attributes.gameId,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: `span[data-type="${this.name}"]`,
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"span",
			mergeAttributes(
				{ "data-type": this.name },
				this.options.HTMLAttributes,
				HTMLAttributes,
			),
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(MentionComponent, {
			stopEvent: (event) => {
				// Allow click events on the mention component
				return event.type === "click" || event.type === "mousedown";
			},
			// Use React 18 concurrent rendering to avoid flushSync conflicts
			as: "span",
			className: "mention-wrapper",
		});
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});
