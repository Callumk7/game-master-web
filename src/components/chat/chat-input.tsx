import { Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export function ChatInput({
	value,
	isStreaming,
	onChange,
	onSubmit,
}: {
	value: string;
	isStreaming: boolean;
	onChange: (next: string) => void;
	onSubmit: () => void;
}) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="flex gap-2 pt-4 border-t"
		>
			<Textarea
				value={value}
				onChange={(e) => onChange(e.currentTarget.value)}
				placeholder="Ask about your game..."
				className="min-h-[60px]"
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						onSubmit();
					}
				}}
			/>
			<Button
				type="submit"
				disabled={!value.trim() || isStreaming}
				onMouseDown={(e) => {
					// Prevent the button from stealing focus from the textarea on click.
					e.preventDefault();
				}}
			>
				<Send className="size-4" />
			</Button>
		</form>
	);
}
