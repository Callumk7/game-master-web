import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { Brain, Send, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
					h1: ({ className: h1ClassName, ...props }) => (
						<h1
							{...props}
							className={cn(
								"text-2xl font-bold mt-4 mb-2 first:mt-0",
								h1ClassName,
							)}
						/>
					),
					h2: ({ className: h2ClassName, ...props }) => (
						<h2
							{...props}
							className={cn(
								"text-xl font-bold mt-3 mb-2 first:mt-0",
								h2ClassName,
							)}
						/>
					),
					h3: ({ className: h3ClassName, ...props }) => (
						<h3
							{...props}
							className={cn(
								"text-lg font-semibold mt-2 mb-1 first:mt-0",
								h3ClassName,
							)}
						/>
					),
					h4: ({ className: h4ClassName, ...props }) => (
						<h4
							{...props}
							className={cn(
								"text-base font-semibold mt-2 mb-1 first:mt-0",
								h4ClassName,
							)}
						/>
					),
					h5: ({ className: h5ClassName, ...props }) => (
						<h5
							{...props}
							className={cn(
								"text-sm font-semibold mt-2 mb-1 first:mt-0",
								h5ClassName,
							)}
						/>
					),
					h6: ({ className: h6ClassName, ...props }) => (
						<h6
							{...props}
							className={cn(
								"text-sm font-semibold mt-2 mb-1 first:mt-0",
								h6ClassName,
							)}
						/>
					),
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

function ReasoningPart({ part }: { part: { text: string; state?: string } }) {
	return (
		<div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2">
			<div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
				<Brain className="size-3" />
				<span>Thinking</span>
				{part.state === "streaming" && <span className="animate-pulse">...</span>}
			</div>
			<div className="text-sm text-muted-foreground italic">{part.text}</div>
		</div>
	);
}

function ToolPart({
	part,
}: {
	part: {
		type: string;
		state?: string;
		output?: unknown;
		errorText?: string;
	};
}) {
	if (part.type === "text" || part.type === "reasoning") return null;

	const toolName = part.type.startsWith("tool-")
		? part.type.replace("tool-", "")
		: part.type;

	return (
		<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
			<div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
				<Wrench className="size-3" />
				<span>{toolName}</span>
			</div>

			{"state" in part && (
				<>
					{part.state === "input-streaming" && (
						<div className="text-xs text-muted-foreground">
							Preparing input...
						</div>
					)}
					{part.state === "input-available" && (
						<div className="text-xs text-muted-foreground">Executing...</div>
					)}
					{part.state === "output-available" && part.output && (
						<pre className="text-xs overflow-auto bg-muted/50 rounded p-2 mt-2">
							{JSON.stringify(part.output, null, 2)}
						</pre>
					)}
					{part.state === "output-error" && part.errorText && (
						<div className="text-xs text-red-600 dark:text-red-400 mt-1">
							Error: {part.errorText}
						</div>
					)}
				</>
			)}
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
	const messagesContainerRef = useRef<HTMLDivElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll on message/streaming changes
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		// Smooth scroll to bottom when messages change or streaming state updates
		container.scrollTo({
			top: container.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, isStreaming]);

	return (
		<Container className="mt-0 mb-0 py-8 h-full min-h-0">
			<div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto">
				{/* Messages */}
				<div
					ref={messagesContainerRef}
					className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4"
				>
					{messages.map((message) => {
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

									{/* Render each message part */}
									{message.parts.map((part, partIdx) => {
										// Text parts
										if (part.type === "text") {
											return (
												<div
													key={`${message.id}-text-${partIdx}`}
													className={cn(
														"rounded-lg border px-3 py-2",
														isUser
															? "bg-primary text-primary-foreground"
															: "bg-card",
													)}
												>
													{isUser ? (
														<div className="text-sm whitespace-pre-wrap">
															{part.text}
														</div>
													) : (
														<MarkdownMessage
															content={part.text}
														/>
													)}
												</div>
											);
										}

										// Reasoning parts
										if (part.type === "reasoning") {
											return (
												<ReasoningPart
													key={`${message.id}-reasoning-${partIdx}`}
													part={part}
												/>
											);
										}

										// Tool parts
										if (part.type.startsWith("tool-")) {
											return (
												<ToolPart
													key={`${message.id}-tool-${partIdx}`}
													part={part}
												/>
											);
										}

										// Step boundaries
										if (part.type === "step-start") {
											return (
												<div
													key={`${message.id}-step-${partIdx}`}
													className="h-px bg-border my-2"
												/>
											);
										}

										return null;
									})}
								</div>
							</div>
						);
					})}
					{isStreaming && (
						<div className="text-sm text-muted-foreground">Thinking…</div>
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
