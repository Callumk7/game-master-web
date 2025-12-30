import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import { useState } from "react";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

export const Route = createFileRoute("/_auth/games/$gameId/chat")({
	component: Chat,
});

function Chat() {
	const { gameId } = Route.useParams();
	const [input, setInput] = useState("");
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: `/api/chat/${gameId}`,
		}),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
		sendMessage({ text: input });
		setInput("");
	};

	const isStreaming = status === "streaming";

	return (
		<Container className="h-[calc(100vh-4rem)]">
			<div className="flex flex-col h-full max-w-4xl mx-auto">
				{/* Messages */}
				<div className="flex-1 overflow-y-auto space-y-4 pb-4">
					{messages.map((message) => (
						<div key={message.id} className="space-y-1">
							<div className="text-sm font-medium">
								{message.role === "user" ? "You" : "Assistant"}
							</div>
							<div className="text-sm">
								{message.parts.map((part, i) => {
									if (part.type === "text") {
										return (
											<div
												key={`${message.id}-${i}`}
												className="whitespace-pre-wrap"
											>
												{part.text}
											</div>
										);
									}
									return null;
								})}
							</div>
						</div>
					))}
					{isStreaming && (
						<div className="text-sm text-muted-foreground">Thinking...</div>
					)}
				</div>

				{/* Input */}
				<form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t">
					<Textarea
						value={input}
						onChange={(e) => setInput(e.currentTarget.value)}
						placeholder="Ask about your game..."
						disabled={isStreaming}
						className="min-h-[60px]"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>
					<Button type="submit" disabled={!input.trim() || isStreaming}>
						<Send className="size-4" />
					</Button>
				</form>
			</div>
		</Container>
	);
}
