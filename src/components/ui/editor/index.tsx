import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import FileHandler from "@tiptap/extension-file-handler";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	ChevronDown,
	Code,
	Copy,
	Heading1,
	Heading2,
	Heading3,
	Highlighter,
	Image as ImageIcon,
	Italic,
	Link,
	List,
	ListOrdered,
	Minus,
	Plus,
	Quote,
	Redo,
	Strikethrough,
	Table as TableIcon,
	Trash2,
	Undo,
	Unlink,
} from "lucide-react";
import * as React from "react";
import { cn } from "~/utils/cn";
import "src/components/ui/editor/tiptap.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { Range } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import {
	listGameEntitiesOptions,
	uploadEntityImageMutation,
} from "~/api/@tanstack/react-query.gen";
import { SERVER_URL } from "~/routes/__root";
import type { EntityType } from "~/types";
import { Button } from "../button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import { Separator } from "../separator";
import { Toggle } from "../toggle";
import { EditorBubbleMenu } from "./bubble-menu";
import { MentionCreateDialog } from "./mention-create-dialog";
import { type MentionItem, SimpleMention } from "./mention-extension-simple";

export interface TiptapProps {
	content?: object | null;
	onChange?: (content: { json: object; text: string }) => void;
	placeholder?: string;
	editable?: boolean;
	className?: string;
	entityId?: string;
	entityType?: EntityType;
}

export function Tiptap({
	content = null,
	onChange,
	placeholder = "Start typing...",
	editable = true,
	className,
	entityId,
	entityType,
}: TiptapProps) {
	const params = useParams({ from: "/_auth/games/$gameId" });
	const gameId = params?.gameId;
	const queryClient = useQueryClient();

	// Dialog state for creating new entities from mentions
	const [createDialogState, setCreateDialogState] = React.useState<{
		open: boolean;
		type: MentionItem["type"];
		query: string;
		position: number; // Changed from Range
		editor: Editor;
	} | null>(null);

	// Image upload mutation
	const uploadImage = useMutation({
		...uploadEntityImageMutation(),
		onSuccess: () => {
			if (gameId && entityType && entityId) {
				queryClient.invalidateQueries({
					queryKey: ["listEntityImages", { gameId, entityType, entityId }],
				});
			}
		},
		onError: (error) => {
			console.error("Upload error:", error);
			toast.error("Failed to upload image");
		},
	});

	const { data: entitiesData } = useQuery({
		...listGameEntitiesOptions({ path: { game_id: gameId } }),
		enabled: !!gameId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Handle image upload
	const handleImageUpload = React.useCallback(
		async (file: File): Promise<string | null> => {
			if (!gameId || !entityType || !entityId) {
				toast.error("Cannot upload image: missing entity information");
				return null;
			}

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return null;
			}

			// Validate file size (20MB limit)
			if (file.size > 20 * 1024 * 1024) {
				toast.error("File size must be less than 20MB");
				return null;
			}

			try {
				const result = await uploadImage.mutateAsync({
					path: {
						game_id: gameId,
						entity_type: entityType,
						entity_id: entityId,
					},
					body: {
						"image[file]": file,
						"image[alt_text]": file.name,
					},
				});

				if (result.data?.file_url) {
					toast.success("Image uploaded successfully");
					return `${SERVER_URL}/${result.data.file_url}`;
				}

				toast.error("Failed to upload image");
				return null;
			} catch (error) {
				console.error("Upload error:", error);
				toast.error("Failed to upload image");
				return null;
			}
		},
		[gameId, entityType, entityId, uploadImage],
	);

	// Transform entities into mention items
	const mentionItems = React.useMemo((): MentionItem[] => {
		if (!entitiesData?.data?.entities || !gameId) return [];

		const items: MentionItem[] = [];
		const entities = entitiesData.data.entities;

		// Add characters
		entities.characters?.forEach((character) => {
			items.push({
				id: character.id,
				label: character.name,
				type: "character",
				gameId,
			});
		});

		// Add factions
		entities.factions?.forEach((faction) => {
			items.push({
				id: faction.id,
				label: faction.name,
				type: "faction",
				gameId,
			});
		});

		// Add locations
		entities.locations?.forEach((location) => {
			items.push({
				id: location.id,
				label: location.name,
				type: "location",
				gameId,
			});
		});

		// Add notes
		entities.notes?.forEach((note) => {
			items.push({
				id: note.id,
				label: note.name,
				type: "note",
				gameId,
			});
		});

		// Add quests
		entities.quests?.forEach((quest) => {
			items.push({
				id: quest.id,
				label: quest.name,
				type: "quest",
				gameId,
			});
		});

		return items;
	}, [entitiesData, gameId]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
			BubbleMenuExtension,
			Highlight.configure({
				multicolor: false,
			}),
			Image.configure({
				inline: false,
				allowBase64: false,
				HTMLAttributes: {
					class: "editor-image",
				},
			}),
			FileHandler.configure({
				allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
				onDrop: (currentEditor, files, _pos) => {
					files.forEach(async (file) => {
						const url = await handleImageUpload(file);
						if (url) {
							currentEditor
								.chain()
								.focus()
								.setImage({ src: url, alt: file.name })
								.run();
						}
					});
				},
				onPaste: (currentEditor, files) => {
					files.forEach(async (file) => {
						const url = await handleImageUpload(file);
						if (url) {
							currentEditor
								.chain()
								.focus()
								.setImage({ src: url, alt: file.name })
								.run();
						}
					});
				},
			}),
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			SimpleMention.configure({
				onCreateRequest: ({
					type,
					query,
					range,
					editor: requestEditor,
				}: {
					type: MentionItem["type"];
					query: string;
					range: Range;
					editor: Editor;
				}) => {
					const insertionPos = range.from;

					requestEditor.chain().focus().deleteRange(range).run();
					setCreateDialogState({
						open: true,
						type,
						query,
						position: insertionPos,
						editor: requestEditor,
					});
				},
				suggestion: {
					items: ({ query }: { query: string }) => {
						// Filter existing entities
						const filtered = mentionItems
							.filter((item) =>
								item.label.toLowerCase().includes(query.toLowerCase()),
							)
							.slice(0, 10);

						// Always add "Create new" options at the bottom
						const createOptions: MentionItem[] = [
							{
								id: "__create_character__",
								label: "Create new character...",
								type: "character",
								gameId: gameId || "",
							},
							{
								id: "__create_quest__",
								label: "Create new quest...",
								type: "quest",
								gameId: gameId || "",
							},
							{
								id: "__create_location__",
								label: "Create new location...",
								type: "location",
								gameId: gameId || "",
							},
							{
								id: "__create_faction__",
								label: "Create new faction...",
								type: "faction",
								gameId: gameId || "",
							},
							{
								id: "__create_note__",
								label: "Create new note...",
								type: "note",
								gameId: gameId || "",
							},
						];

						return [...filtered, ...createOptions];
					},
				},
			}),
		],
		content,
		editable,
		onUpdate: ({ editor }) => {
			if (!onChange) return;
			// Defer the onChange callback to avoid flushSync conflicts
			React.startTransition(() => {
				onChange({
					json: editor.getJSON(),
					text: editor.getText(),
				});
			});
		},
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
					"min-h-[360px] px-3 pt-1 pb-2 border-0",
				),
			},
		},
		immediatelyRender: false,
	});

	// Handle entity creation success
	const handleEntityCreated = React.useCallback(
		(entity: { id: string; name: string; type: MentionItem["type"] }) => {
			if (!createDialogState || !gameId) return;

			const { position, editor: dialogEditor } = createDialogState;

			// Insert the mention at the stored range
			dialogEditor
				.chain()
				.focus()
				.insertContentAt(position, [
					{
						type: "mention",
						attrs: {
							id: entity.id,
							label: entity.name,
							type: entity.type,
							gameId,
						},
					},
					{ type: "text", text: " " },
				])
				.run();

			// Close the dialog
			setCreateDialogState(null);
		},
		[createDialogState, gameId],
	);

	// Cleanup effect to prevent memory leaks and flushSync issues on unmount
	React.useEffect(() => {
		return () => {
			if (editor) {
				editor.destroy();
			}
		};
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div
			className={cn(
				"border min-h-1/2 bg-input/30 rounded-lg overflow-hidden",
				className,
			)}
		>
			<div className="border-b px-3 py-1.5 flex flex-wrap items-center gap-1">
				<Toggle
					size="sm"
					pressed={editor.isActive("bold")}
					onPressedChange={() => editor.chain().focus().toggleBold().run()}
					disabled={!editor.can().chain().focus().toggleBold().run()}
				>
					<Bold className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("italic")}
					onPressedChange={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
				>
					<Italic className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("strike")}
					onPressedChange={() => editor.chain().focus().toggleStrike().run()}
					disabled={!editor.can().chain().focus().toggleStrike().run()}
				>
					<Strikethrough className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("code")}
					onPressedChange={() => editor.chain().focus().toggleCode().run()}
					disabled={!editor.can().chain().focus().toggleCode().run()}
				>
					<Code className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("highlight")}
					onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
					disabled={!editor.can().chain().focus().toggleHighlight().run()}
				>
					<Highlighter className="h-4 w-4" />
				</Toggle>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						const url = window.prompt("Enter URL:");
						if (url) {
							editor.chain().focus().setLink({ href: url }).run();
						}
					}}
					disabled={!editor.can().chain().focus().setLink({ href: "" }).run()}
				>
					<Link className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						const input = document.createElement("input");
						input.type = "file";
						input.accept = "image/*";
						input.onchange = async (e) => {
							const file = (e.target as HTMLInputElement).files?.[0];
							if (file) {
								const url = await handleImageUpload(file);
								if (url) {
									editor
										.chain()
										.focus()
										.setImage({ src: url, alt: file.name })
										.run();
								}
							}
						};
						input.click();
					}}
					disabled={!gameId || !entityType || !entityId}
					title="Insert image"
				>
					<ImageIcon className="h-4 w-4" />
				</Button>

				{editor.isActive("link") && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().unsetLink().run()}
					>
						<Unlink className="h-4 w-4" />
					</Button>
				)}

				<Separator orientation="vertical" className="h-6" />

				<Toggle
					size="sm"
					pressed={editor.isActive("heading", { level: 1 })}
					onPressedChange={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
				>
					<Heading1 className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("heading", { level: 2 })}
					onPressedChange={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
				>
					<Heading2 className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("heading", { level: 3 })}
					onPressedChange={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
				>
					<Heading3 className="h-4 w-4" />
				</Toggle>

				<Separator orientation="vertical" className="h-6" />

				<Toggle
					size="sm"
					pressed={editor.isActive("bulletList")}
					onPressedChange={() =>
						editor.chain().focus().toggleBulletList().run()
					}
				>
					<List className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("orderedList")}
					onPressedChange={() =>
						editor.chain().focus().toggleOrderedList().run()
					}
				>
					<ListOrdered className="h-4 w-4" />
				</Toggle>

				<Toggle
					size="sm"
					pressed={editor.isActive("blockquote")}
					onPressedChange={() =>
						editor.chain().focus().toggleBlockquote().run()
					}
				>
					<Quote className="h-4 w-4" />
				</Toggle>

				<Separator orientation="vertical" className="h-6" />

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="sm" title="Table options" />
						}
					>
						<TableIcon className="h-4 w-4" />
						<ChevronDown className="h-3 w-3" />
					</DropdownMenuTrigger>
					<DropdownMenuPositioner>
						<DropdownMenuContent className="w-48">
							<DropdownMenuItem
								onClick={() =>
									editor
										.chain()
										.focus()
										.insertTable({
											rows: 3,
											cols: 3,
											withHeaderRow: true,
										})
										.run()
								}
								disabled={!editor.can().insertTable()}
							>
								<TableIcon className="h-4 w-4 mr-2" />
								Insert Table
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() =>
									editor.chain().focus().addColumnBefore().run()
								}
								disabled={!editor.can().addColumnBefore()}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Column Before
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() =>
									editor.chain().focus().addColumnAfter().run()
								}
								disabled={!editor.can().addColumnAfter()}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Column After
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() =>
									editor.chain().focus().deleteColumn().run()
								}
								disabled={!editor.can().deleteColumn()}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Column
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() =>
									editor.chain().focus().addRowBefore().run()
								}
								disabled={!editor.can().addRowBefore()}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Row Before
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() => editor.chain().focus().addRowAfter().run()}
								disabled={!editor.can().addRowAfter()}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Row After
							</DropdownMenuItem>

							<DropdownMenuItem
								onClick={() => editor.chain().focus().deleteRow().run()}
								disabled={!editor.can().deleteRow()}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Row
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() => editor.chain().focus().deleteTable().run()}
								disabled={!editor.can().deleteTable()}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Table
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenuPositioner>
				</DropdownMenu>

				<Separator orientation="vertical" className="h-6" />

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
				>
					<Minus className="h-4 w-4" />
				</Button>

				<Separator orientation="vertical" className="h-6" />

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().chain().focus().undo().run()}
				>
					<Undo className="h-4 w-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().chain().focus().redo().run()}
				>
					<Redo className="h-4 w-4" />
				</Button>

				<Separator orientation="vertical" className="h-6" />

				<Button
					variant="ghost"
					size="sm"
					onClick={async () => {
						const text = editor.getText();
						try {
							await navigator.clipboard.writeText(text);
							toast.success("Copied to clipboard");
						} catch (error) {
							console.error("Failed to copy:", error);
							toast.error("Failed to copy to clipboard");
						}
					}}
					title="Copy plain text to clipboard"
				>
					<Copy className="h-4 w-4" />
				</Button>
			</div>

			<EditorBubbleMenu editor={editor} />
			<EditorContent editor={editor} placeholder={placeholder} />

			{/* Create entity dialog */}
			{createDialogState && gameId && (
				<MentionCreateDialog
					open={createDialogState.open}
					onOpenChange={(open) => {
						if (!open) {
							setCreateDialogState(null);
						}
					}}
					entityType={createDialogState.type}
					defaultName={createDialogState.query}
					gameId={gameId}
					onSuccess={handleEntityCreated}
				/>
			)}
		</div>
	);
}
