import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/utils/cn";

export const Route = createFileRoute("/_auth/games/$gameId/chat")({
	component: Chat,
});

function MarkdownMessage({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"prose prose-sm dark:prose-invert max-w-none",
				"prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent",
				"prose-code:before:content-none prose-code:after:content-none",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSanitize]}
				components={{
					a: ({ className: aClassName, ...props }) => (
						<a
							{...props}
							className={cn(
								"underline underline-offset-4",
								"decoration-muted-foreground hover:decoration-foreground",
								aClassName,
							)}
							target="_blank"
							rel="noreferrer"
						/>
					),
					code: ({ className: codeClassName, children, ...props }) => {
						const isBlock = /\blanguage-/.test(codeClassName ?? "");

						if (!isBlock) {
							return (
								<code
									{...props}
									className={cn(
										"rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
										codeClassName,
									)}
								>
									{children}
								</code>
							);
						}

						return (
							<pre className="rounded-md border bg-muted/50 p-3 overflow-x-auto">
								<code
									{...props}
									className={cn("font-mono text-sm", codeClassName)}
								>
									{children}
								</code>
							</pre>
						);
					},
					hr: (props) => <hr {...props} className="my-4 border-muted" />,
					ul: ({ className: ulClassName, ...props }) => (
						<ul {...props} className={cn("my-2", ulClassName)} />
					),
					ol: ({ className: olClassName, ...props }) => (
						<ol {...props} className={cn("my-2", olClassName)} />
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

function Chat() {
	const { gameId } = Route.useParams();
	const [input, setInput] = useState("");
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: `/api/chat/${gameId}`,
		}),
	});

	const handleSubmit = (
		e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		e.preventDefault();
		if (!input.trim()) return;
		sendMessage({ text: input });
		setInput("");
	};

	const isStreaming = status === "streaming";
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const displayMessages = useMemo(() => {
		return messages.map((message) => {
			const text = message.parts
				.filter((p) => p.type === "text")
				.map((p) => p.text)
				.join("");
			return { ...message, text };
		});
	}, [messages]);

	useEffect(() => {
		// Tie scrolling to message count + streaming state (otherwise Biome flags deps as unnecessary).
		void displayMessages.length;
		void isStreaming;
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [displayMessages.length, isStreaming]);

	return (
		<Container className="mt-0 mb-0 py-8 h-full min-h-0">
			<div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto">
				{/* Messages */}
				<div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4">
					{displayMessages.map((message) => {
						const isUser = message.role === "user";

						return (
							<div
								key={message.id}
								className={cn(
									"flex w-full",
									isUser ? "justify-end" : "justify-start",
								)}
							>
								<div
									className={cn(
										"max-w-[85%] space-y-2",
										isUser && "items-end",
									)}
								>
									<div
										className={cn(
											"text-xs text-muted-foreground",
											isUser ? "text-right" : "text-left",
										)}
									>
										{isUser ? "You" : "Assistant"}
									</div>
									<div
										className={cn(
											"rounded-lg border px-3 py-2",
											isUser
												? "bg-primary text-primary-foreground"
												: "bg-card",
										)}
									>
										{isUser ? (
											<div className="text-sm whitespace-pre-wrap">
												{message.text}
											</div>
										) : (
											<MarkdownMessage content={message.text} />
										)}
									</div>
								</div>
							</div>
						);
					})}
					{isStreaming && (
						<div className="text-sm text-muted-foreground">Thinking…</div>
					)}
					<div ref={bottomRef} />
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
