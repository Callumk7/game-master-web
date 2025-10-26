import { type Editor, mergeAttributes, Node, type Range } from "@tiptap/core";
import { type EditorState, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import {
	Suggestion,
	type SuggestionKeyDownProps,
	type SuggestionProps,
} from "@tiptap/suggestion";
import tippy, { type Instance } from "tippy.js";
import { MentionComponent } from "./mention-component";
import { MentionList } from "./mention-list";

interface MentionListRef {
	onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

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
			onCreateRequest: undefined as
				| ((data: {
						type: MentionItem["type"];
						query: string;
						range: Range;
						editor: Editor;
				  }) => void)
				| undefined,
			suggestion: {
				char: "@",
				pluginKey: new PluginKey("mention"),
				command: (commandProps: {
					editor: Editor;
					range: Range;
					props: MentionItem;
				}) => {
					const { editor, range, props: item } = commandProps;
					// Check if this is a "create new" option
					if (item.id.startsWith("__create_")) {
						// Extract entity type from id (e.g., "__create_character__")
						const typeMatch = item.id.match(/__create_(\w+)__/);
						// Access onCreateRequest from the extension instance
						const extension = editor.extensionManager.extensions.find(
							(ext) => ext.name === "mention",
						);
						const onCreateRequest = extension?.options?.onCreateRequest;

						if (typeMatch && onCreateRequest) {
							const entityType = typeMatch[1] as MentionItem["type"];
							// Get the current query text
							const { from } = range;
							const textBefore = editor.state.doc.textBetween(
								Math.max(0, from - 100),
								from,
								"\n",
							);
							const queryMatch = textBefore.match(/@(\w*)$/);
							const query = queryMatch ? queryMatch[1] : "";

							onCreateRequest({
								type: entityType,
								query,
								range,
								editor,
							});
							return;
						}
					}

					// Normal mention insertion
					editor
						.chain()
						.focus()
						.insertContentAt(range, [
							{
								type: "mention",
								attrs: item,
							},
							{ type: "text", text: " " },
						])
						.run();

					window.getSelection()?.collapseToEnd();
				},
				allow: ({ state, range }: { state: EditorState; range: Range }) => {
					const $from = state.doc.resolve(range.from);
					const type = state.schema.nodes[this.name];
					const allow = !!$from.parent.type.contentMatch.matchType(type);
					return allow;
				},
				render: () => {
					let component: ReactRenderer<MentionListRef>;
					let popup: Instance[];

					return {
						onStart: (props: SuggestionProps<MentionItem>) => {
							component = new ReactRenderer(MentionList, {
								props,
								editor: props.editor,
							});

							if (!props.clientRect) {
								return;
							}

							const instance = tippy(document.body, {
								getReferenceClientRect: props.clientRect as () => DOMRect,
								appendTo: () => document.body,
								content: component.element,
								showOnCreate: true,
								interactive: true,
								trigger: "manual",
								placement: "bottom-start",
							});
							popup = [instance];
						},

						onUpdate(props: SuggestionProps<MentionItem>) {
							component?.updateProps(props);

							if (!props.clientRect || !popup?.length) {
								return;
							}

							popup[0].setProps({
								getReferenceClientRect: props.clientRect as () => DOMRect,
							});
						},

						onKeyDown(props: SuggestionKeyDownProps) {
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

	renderText({ node }) {
		return `@${node.attrs.label}`;
	},

	addNodeView() {
		return ReactNodeViewRenderer(MentionComponent, {
			stopEvent: ({ event }: { event: Event }) => {
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
