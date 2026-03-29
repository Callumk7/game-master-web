import { createFileRoute, redirect } from "@tanstack/react-router";
import { ChatSession } from "~/components/chat/chat-session";
import { ChatSessionSwitcher } from "~/components/chat/chat-session-switcher";
import { Container } from "~/components/container";
import { useGameChatController } from "~/hooks/useGameChatController";
import { isChatEnabled } from "~/utils/features";

export const Route = createFileRoute("/_auth/games/$gameId/chat")({
	beforeLoad: ({ params }) => {
		if (!isChatEnabled) {
			throw redirect({ to: "/games/$gameId", params });
		}
	},
	component: Chat,
});

function Chat() {
	const { gameId } = Route.useParams();
	const controller = useGameChatController(gameId);

	if (!controller.hasHydrated || !controller.currentThread) {
		return (
			<Container className="mt-0 mb-0 py-8 h-full min-h-0">
				<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
					{controller.hasHydrated ? "Preparing chat…" : "Loading chat history…"}
				</div>
			</Container>
		);
	}

	return (
		<Container className="mt-0 mb-0 pb-8 pt-2 h-full min-h-0">
			<div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto">
				<ChatSessionSwitcher
					threads={controller.threads}
					currentThreadId={controller.currentThreadId}
					onSelect={controller.actions.selectThread}
					onNewChat={controller.actions.newChat}
					onClearThread={controller.actions.clearThread}
					onDeleteThread={controller.actions.deleteThread}
				/>
				<ChatSession
					key={controller.currentThread.id}
					gameId={gameId}
					threadId={controller.currentThread.id}
					initialMessages={controller.currentThread.messages}
					onMessagesChange={controller.actions.messagesChanged}
					resetKey={controller.currentResetKey}
				/>
			</div>
		</Container>
	);
}
