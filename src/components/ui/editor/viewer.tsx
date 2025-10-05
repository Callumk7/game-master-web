import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "~/utils/cn";
import { SimpleMention } from "./mention-extension-simple";
import { parseContentForEditor } from "./utils";
import "src/components/ui/editor/tiptap.css";

export interface TiptapViewerProps {
	content?: string;
	className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
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
			Table.configure({
				resizable: false, // Disable resizing in viewer
			}),
			TableRow,
			TableHeader,
			TableCell,
			// Add mention extension for rendering saved mentions
			SimpleMention.configure({
				suggestion: {
					// Disable suggestion in viewer (read-only)
					items: () => [],
				},
			}),
		],
		content: parseContentForEditor(content),
		editable: false,
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
					className,
				),
			},
		},
		immediatelyRender: false,
	});

	if (!editor) {
		return null;
	}

	return <EditorContent editor={editor} />;
}
