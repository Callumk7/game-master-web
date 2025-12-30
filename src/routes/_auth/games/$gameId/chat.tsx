import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Container } from "~/components/container";

export const Route = createFileRoute("/_auth/games/$gameId/chat")({
	component: Chat,
});

function Chat() {
	const { gameId } = Route.useParams();
	const [input, setInput] = useState("");
	const { messages, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			body: { gameId },
		}),
	});

	return (
		<Container>
			<div className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-200px)]">
				<div className="flex-1 overflow-y-auto space-y-4 p-4">
					{messages.map((message) => (
						<div key={message.id} className="whitespace-pre-wrap">
							<div className="font-semibold mb-1">
								{message.role === "user" ? "User: " : "AI: "}
							</div>
							{message.parts.map((part, i) => {
								switch (part.type) {
									case "text":
										return (
											<div
												key={`${message.id}-${i}`}
												className="ml-4"
											>
												{part.text}
											</div>
										);
									default:
										return null;
								}
							})}
						</div>
					))}
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						sendMessage({ text: input });
						setInput("");
					}}
					className="border-t p-4"
				>
					<input
						className="w-full p-3 border border-zinc-300 dark:border-zinc-800 rounded-lg bg-background"
						value={input}
						placeholder="Ask your Game Master anything..."
						onChange={(e) => setInput(e.currentTarget.value)}
					/>
				</form>
			</div>
		</Container>
	);
}
