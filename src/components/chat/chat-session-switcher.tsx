import { EllipsisVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { ChatThread } from "~/state/chats";

export function ChatSessionSwitcher({
	threads,
	currentThreadId,
	onSelect,
	onNewChat,
	onClearThread,
	onDeleteThread,
}: {
	threads: ChatThread[];
	currentThreadId: string | null;
	onSelect: (threadId: string) => void;
	onNewChat: () => void;
	onClearThread: (threadId: string) => void;
	onDeleteThread: (threadId: string) => void;
}) {
	const hasThreads = threads.length > 0;

	return (
		<div className="mb-3 flex items-center gap-2">
			{hasThreads ? (
				<Tabs
					value={currentThreadId ?? undefined}
					onValueChange={(value) => {
						if (typeof value === "string") onSelect(value);
					}}
					className="min-w-0 flex-1"
				>
					<div className="min-w-0 flex-1 overflow-x-auto">
						<TabsList className="w-max">
							{threads.map((thread) => (
								<TabsTrigger
									key={thread.id}
									value={thread.id}
									className="flex-none"
									title={thread.title}
								>
									<span className="max-w-[9rem] truncate">
										{thread.title}
									</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>
				</Tabs>
			) : (
				<div className="text-xs text-muted-foreground">
					Start your first chat.
				</div>
			)}

			<Button
				variant="ghost"
				size="icon"
				onClick={onNewChat}
				title="New chat"
				className="shrink-0"
			>
				<Plus className="size-4" />
				<span className="sr-only">New chat</span>
			</Button>

			{currentThreadId ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="shrink-0 text-muted-foreground"
							/>
						}
					>
						<EllipsisVertical className="size-4" />
						<span className="sr-only">Open chat actions</span>
					</DropdownMenuTrigger>
					<DropdownMenuPositioner>
						<DropdownMenuContent>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									onClearThread(currentThreadId);
								}}
							>
								<Trash2 className="mr-2 size-4" />
								Clear chat
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									const ok = globalThis.confirm(
										"Delete this chat? This cannot be undone.",
									);
									if (!ok) return;
									onDeleteThread(currentThreadId);
								}}
							>
								<Trash2 className="mr-2 size-4" />
								Delete chat
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenuPositioner>
				</DropdownMenu>
			) : null}
		</div>
	);
}
