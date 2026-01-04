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
import { Tiptap } from "~/components/ui/editor";
import { TiptapViewer } from "~/components/ui/editor/viewer";
import { Link } from "~/components/ui/link";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/utils/cn";

export const Route = createFileRoute("/_auth/games/$gameId/chat")({
	component: Chat,
});

const creationToolLinkConfig = {
	createCharacter: {
		to: "/games/$gameId/characters/$id",
		label: "Open character",
	},
	createFaction: {
		to: "/games/$gameId/factions/$id",
		label: "Open faction",
	},
	createLocation: {
		to: "/games/$gameId/locations/$id",
		label: "Open location",
	},
	createQuest: {
		to: "/games/$gameId/quests/$id",
		label: "Open quest",
	},
	createNote: {
		to: "/games/$gameId/notes/$id",
		label: "Open note",
	},
} as const;

type CreationToolName = keyof typeof creationToolLinkConfig;

type ProposedEntityUpdateToolOutput =
	| {
			success: true;
			changeId: string;
			gameId: string;
			entityType: "character" | "quest" | "location" | "faction" | "note";
			entityId: string;
			beforeHash: string;
			before: {
				name: string | null;
				tags: Array<string> | null;
				content: string | null;
				content_plain_text: string | null;
				content_json?: object | null;
			};
			proposed: {
				name?: string;
				tags?: Array<string>;
				content_json?: object | null;
				content_plain_text?: string;
				// other optional update fields, passed through to commit route:
				[key: string]: unknown;
			};
			approvalRequired: true;
			message?: string;
	  }
	| {
			success: false;
			error: string;
	  };

function isProposedEntityUpdateToolOutput(
	output: unknown,
): output is ProposedEntityUpdateToolOutput {
	if (!output || typeof output !== "object") return false;
	if (!("success" in output)) return false;
	return true;
}

function isCreationToolSuccessOutput(
	output: unknown,
): output is { success: true; id: string; message?: string } {
	if (!output || typeof output !== "object") return false;
	if (!("success" in output) || !("id" in output)) return false;
	return (
		Boolean((output as { success: boolean; id?: unknown }).success) &&
		typeof (output as { id?: unknown }).id === "string"
	);
}

function EntityCreationLink({
	gameId,
	entityId,
	label,
	message,
	to,
}: {
	gameId: string;
	entityId: string;
	label: string;
	message?: string;
	to: string;
}) {
	return (
		<div className="flex flex-col gap-2">
			{message ? <div className="text-sm text-foreground">{message}</div> : null}
			<Link to={to} params={{ gameId, id: entityId }} variant="outline" size="sm">
				{label}
			</Link>
		</div>
	);
}

function ProposedEntityUpdatePart({
	output,
}: {
	output: ProposedEntityUpdateToolOutput;
}) {
	const { gameId: routeGameId } = Route.useParams();

	if (!output.success) {
		return (
			<div className="text-xs text-red-600 dark:text-red-400">
				Error: {output.error}
			</div>
		);
	}

	return <ProposedEntityUpdateSuccessPart output={output} routeGameId={routeGameId} />;
}

type CommitResponse =
	| {
			success: true;
			undo: { expectedCurrentHash: string; restore: Record<string, unknown> };
	  }
	| { success?: false; error?: string };

type UndoResponse = { success: true } | { success?: false; error?: string };

function isCommitResponse(v: unknown): v is CommitResponse {
	return !!v && typeof v === "object" && "success" in v;
}

function isUndoResponse(v: unknown): v is UndoResponse {
	return !!v && typeof v === "object" && "success" in v;
}

function ProposedEntityUpdateSuccessPart({
	output,
	routeGameId,
}: {
	output: Extract<ProposedEntityUpdateToolOutput, { success: true }>;
	routeGameId: string;
}) {
	const initialJson =
		(output.proposed.content_json as object | null | undefined) ??
		output.before.content_json ??
		null;

	const [showCurrent, setShowCurrent] = useState(false);
	const [draft, setDraft] = useState<{ json: object | null; text: string }>({
		json: initialJson,
		text:
			output.proposed.content_plain_text ?? output.before.content_plain_text ?? "",
	});
	const [status, setStatus] = useState<
		"idle" | "committing" | "committed" | "undoing" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);
	const [undo, setUndo] = useState<{
		expectedCurrentHash: string;
		restore: Record<string, unknown>;
	} | null>(null);

	const effectiveJson = draft.json ?? initialJson;

	const commit = async () => {
		setStatus("committing");
		setError(null);

		try {
			const { content_json: _contentJson, ...other } = output.proposed;
			const after: Record<string, unknown> = {
				...other,
			};

			if (effectiveJson) {
				after.content = JSON.stringify(effectiveJson);
				after.content_plain_text = draft.text ?? "";
			}

			const res = await fetch("/api/entity-updates/commit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: output.gameId ?? routeGameId,
					entityType: output.entityType,
					entityId: output.entityId,
					beforeHash: output.beforeHash,
					after,
				}),
			});

			const json: unknown = await res.json();
			const parsed = isCommitResponse(json) ? (json as CommitResponse) : null;
			if (!res.ok || !parsed?.success) {
				throw new Error(
					(parsed && "error" in parsed && parsed.error) ||
						"Failed to apply update",
				);
			}

			setUndo(parsed.undo ?? null);
			setStatus("committed");
		} catch (e) {
			setStatus("error");
			setError(e instanceof Error ? e.message : "Failed to apply update");
		}
	};

	const undoUpdate = async () => {
		if (!undo) return;
		setStatus("undoing");
		setError(null);

		try {
			const res = await fetch("/api/entity-updates/undo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: output.gameId ?? routeGameId,
					entityType: output.entityType,
					entityId: output.entityId,
					expectedCurrentHash: undo.expectedCurrentHash,
					restore: undo.restore,
				}),
			});

			const json: unknown = await res.json();
			const parsed = isUndoResponse(json) ? json : null;
			if (!res.ok || !parsed?.success) {
				throw new Error(
					(parsed && "error" in parsed && parsed.error) ||
						"Failed to undo update",
				);
			}

			setUndo(null);
			setStatus("idle");
		} catch (e) {
			setStatus("error");
			setError(e instanceof Error ? e.message : "Failed to undo update");
		}
	};

	const disabled = status === "committing" || status === "undoing";

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">
					Proposed update:{" "}
					<span className="font-medium">{output.entityType}</span>{" "}
					<span className="font-mono">{output.entityId}</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowCurrent((v) => !v)}
						disabled={disabled}
					>
						{showCurrent ? "Hide current" : "Show current"}
					</Button>
				</div>
			</div>

			{showCurrent && (
				<div className="rounded border bg-muted/30 p-3">
					<div className="text-xs font-medium text-muted-foreground mb-2">
						Current content
					</div>
					<TiptapViewer
						content={output.before.content ?? ""}
						className="prose-sm"
					/>
				</div>
			)}

			<div className="rounded border bg-card p-3">
				<div className="text-xs font-medium text-muted-foreground mb-2">
					Proposed content (editable before approval)
				</div>
				<Tiptap
					key={output.changeId}
					content={effectiveJson}
					onChange={({ json, text }) => setDraft({ json, text })}
					entityId={output.entityId}
					entityType={output.entityType}
				/>
			</div>

			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">
					{status === "committing"
						? "Applying…"
						: status === "committed"
							? "Applied."
							: status === "undoing"
								? "Undoing…"
								: status === "error"
									? "Error."
									: "Review, edit, then approve to apply."}
				</div>
				<div className="flex items-center gap-2">
					{undo ? (
						<Button
							variant="outline"
							size="sm"
							onClick={undoUpdate}
							disabled={disabled}
						>
							Undo
						</Button>
					) : null}
					<Button
						size="sm"
						onClick={commit}
						disabled={disabled || status === "committed"}
					>
						Approve & Apply
					</Button>
				</div>
			</div>

			{error ? (
				<div className="text-xs text-red-600 dark:text-red-400">{error}</div>
			) : null}
		</div>
	);
}

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
	const { gameId } = Route.useParams();

	if (part.type === "text" || part.type === "reasoning") return null;

	const toolName = part.type.startsWith("tool-")
		? part.type.replace("tool-", "")
		: part.type;

	const creationConfig =
		(
			creationToolLinkConfig as Record<
				string,
				(typeof creationToolLinkConfig)[CreationToolName] | undefined
			>
		)[toolName] ?? null;

	const creationOutput =
		creationConfig && isCreationToolSuccessOutput(part.output) ? part.output : null;

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
						<div className="mt-2">
							{toolName === "proposeEntityUpdate" &&
							isProposedEntityUpdateToolOutput(part.output) ? (
								<ProposedEntityUpdatePart output={part.output} />
							) : creationConfig && creationOutput ? (
								<EntityCreationLink
									gameId={gameId}
									entityId={creationOutput.id}
									label={creationConfig.label}
									message={creationOutput.message}
									to={creationConfig.to}
								/>
							) : (
								<pre className="text-xs overflow-auto bg-muted/50 rounded p-2">
									{JSON.stringify(part.output, null, 2)}
								</pre>
							)}
						</div>
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

	const isStreaming = status === "streaming";

	const handleSubmit = (
		e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		e.preventDefault();
		if (isStreaming) return;
		if (!input.trim()) return;
		sendMessage({ text: input });
		setInput("");
	};

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
						className="min-h-[60px]"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>
					<Button
						type="submit"
						disabled={!input.trim() || isStreaming}
						onMouseDown={(e) => {
							// Prevent the button from stealing focus from the textarea on click.
							e.preventDefault();
						}}
					>
						<Send className="size-4" />
					</Button>
				</form>
			</div>
		</Container>
	);
}
