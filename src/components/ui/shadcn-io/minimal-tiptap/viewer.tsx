import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "~/utils/cn";

interface MinimalTiptapViewerProps {
	content?: object | null;
	className?: string;
}

function MinimalTiptapViewer({ content, className }: MinimalTiptapViewerProps) {
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
		],
		content,
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

export { MinimalTiptapViewer, type MinimalTiptapViewerProps };

