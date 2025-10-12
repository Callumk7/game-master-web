import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link, Strikethrough, Unlink } from "lucide-react";
import { cn } from "~/utils/cn";
import { Button } from "../button";
import { Toggle } from "../toggle";

interface EditorBubbleMenuProps {
	editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
	return (
		<BubbleMenu
			editor={editor}
			className={cn(
				"flex items-center gap-1 p-2 rounded-lg border bg-popover shadow-lg",
			)}
		>
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

			{editor.isActive("link") && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().unsetLink().run()}
				>
					<Unlink className="h-4 w-4" />
				</Button>
			)}
		</BubbleMenu>
	);
}
