import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatUIMessage } from "~/types";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { TokenUsage } from "./token-usage";

interface ChatSessionProps {
	gameId: string;
	threadId: string;
	initialMessages: ChatUIMessage[];
	onMessagesChange: (messages: ChatUIMessage[]) => void;
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
	const { messages, sendMessage, status, setMessages } = useChat<ChatUIMessage>({
		id: `chat-${gameId}-${threadId}`,
		transport,
	});

	const isStreaming = status === "streaming";

	// Calculate total tokens across all messages
	const totalTokens = useMemo(() => {
		return messages.reduce((sum, msg) => {
			return sum + (msg.metadata?.totalTokens ?? 0);
		}, 0);
	}, [messages]);

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
			{/* Token usage indicator */}
			{totalTokens > 0 && <TokenUsage totalTokens={totalTokens} />}

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
