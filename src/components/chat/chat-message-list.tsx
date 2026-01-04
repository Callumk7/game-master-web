import type { UIMessage } from "ai";
import { cn } from "~/utils/cn";
import { MarkdownMessage } from "./markdown-message";
import { ReasoningPart } from "./reasoning-part";
import { ToolPart } from "./tool-part";

export function ChatMessageList({
	messages,
	isStreaming,
	routeGameId,
}: {
	messages: UIMessage[];
	isStreaming: boolean;
	routeGameId: string;
}) {
	return (
		<div className="space-y-4">
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
							className={cn("max-w-[85%] space-y-2", isUser && "items-end")}
						>
							<div
								className={cn(
									"text-xs text-muted-foreground",
									isUser ? "text-right" : "text-left",
								)}
							>
								{isUser ? "You" : "Assistant"}
							</div>

							{message.parts.map((part, partIdx) => {
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
												<MarkdownMessage content={part.text} />
											)}
										</div>
									);
								}

								if (part.type === "reasoning") {
									return (
										<ReasoningPart
											key={`${message.id}-reasoning-${partIdx}`}
											part={part}
										/>
									);
								}

								if (part.type.startsWith("tool-")) {
									return (
										<ToolPart
											key={`${message.id}-tool-${partIdx}`}
											part={part}
											routeGameId={routeGameId}
										/>
									);
								}

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
	);
}
