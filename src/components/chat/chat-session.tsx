import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";

interface ChatSessionProps {
	gameId: string;
	threadId: string;
	initialMessages: UIMessage[];
	onMessagesChange: (messages: UIMessage[]) => void;
	resetKey: number;
}

export function ChatSession({
	gameId,
	threadId,
	initialMessages,
	onMessagesChange,
	resetKey,
}: ChatSessionProps) {
	const [input, setInput] = useState("");
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: `/api/chat/${gameId}`,
			}),
		[gameId],
	);
	const { messages, sendMessage, status, setMessages } = useChat({
		id: `chat-${gameId}-${threadId}`,
		transport,
	});

	const isStreaming = status === "streaming";

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only reseed when switching threads or a manual reset happens.
	useEffect(() => {
		setMessages(initialMessages);
		setInput("");
	}, [resetKey, setMessages, threadId]);

	useEffect(() => {
		onMessagesChange(messages);
	}, [messages, onMessagesChange]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll on message/streaming changes
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		container.scrollTo({
			top: container.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, isStreaming]);

	const submit = () => {
		if (isStreaming) return;
		if (!input.trim()) return;
		sendMessage({ text: input });
		setInput("");
	};

	return (
		<div className="flex flex-1 flex-col min-h-0">
			<div
				ref={messagesContainerRef}
				className="flex-1 min-h-0 overflow-y-auto pb-4"
			>
				<ChatMessageList
					messages={messages}
					isStreaming={isStreaming}
					routeGameId={gameId}
				/>
			</div>

			<ChatInput
				value={input}
				isStreaming={isStreaming}
				onChange={setInput}
				onSubmit={submit}
			/>
		</div>
	);
}
