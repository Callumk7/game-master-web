import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatThread } from "~/state/chats";
import { useChatActions, useChatStore, useGameChatState } from "~/state/chats";

const compareThreadsStable = (a: ChatThread, b: ChatThread) => {
	if (a.createdAt !== b.createdAt) return a.createdAt - b.createdAt;
	return a.id.localeCompare(b.id);
};

export function useGameChatController(gameId: string) {
	const chatState = useGameChatState(gameId);
	const {
		ensureGame,
		startThread,
		setCurrentThread,
		replaceThreadMessages,
		clearThread,
		deleteThread,
	} = useChatActions();

	const [hasHydrated, setHasHydrated] = useState(
		() => useChatStore.persist?.hasHydrated?.() ?? false,
	);
	const [threadResetKeys, setThreadResetKeys] = useState<Record<string, number>>({});

	useEffect(() => {
		const unsubFinish = useChatStore.persist?.onFinishHydration?.(() =>
			setHasHydrated(true),
		);
		const unsubHydrate = useChatStore.persist?.onHydrate?.(() =>
			setHasHydrated(false),
		);
		return () => {
			unsubFinish?.();
			unsubHydrate?.();
		};
	}, []);

	useEffect(() => {
		if (!hasHydrated) return;
		const game = ensureGame(gameId);
		const existingThreadId = chatState?.currentThreadId ?? game.currentThreadId;
		if (!existingThreadId) {
			startThread(gameId);
		}
	}, [ensureGame, gameId, hasHydrated, startThread, chatState?.currentThreadId]);

	useEffect(() => {
		if (!hasHydrated || !chatState?.currentThreadId) return;
		if (!chatState.threads[chatState.currentThreadId]) {
			startThread(gameId);
		}
	}, [chatState, gameId, hasHydrated, startThread]);

	const currentThreadId = chatState?.currentThreadId ?? null;
	const threads = useMemo(() => {
		if (!chatState) return [];
		return Object.values(chatState.threads)
			.filter((thread): thread is ChatThread => Boolean(thread))
			.sort(compareThreadsStable);
	}, [chatState]);

	const currentThread =
		currentThreadId && chatState
			? (chatState.threads[currentThreadId] ?? null)
			: null;

	const selectThread = useCallback(
		(threadId: string) => {
			if (!threadId || threadId === currentThreadId) return;
			setCurrentThread(gameId, threadId);
		},
		[currentThreadId, gameId, setCurrentThread],
	);

	const newChat = useCallback(() => {
		startThread(gameId);
	}, [gameId, startThread]);

	const messagesChanged = useCallback(
		(updatedMessages: UIMessage[]) => {
			if (!currentThreadId) return;
			replaceThreadMessages(gameId, currentThreadId, updatedMessages);
		},
		[currentThreadId, gameId, replaceThreadMessages],
	);

	const clearThreadById = useCallback(
		(threadId: string) => {
			clearThread(gameId, threadId);
			setThreadResetKeys((prev) => ({ ...prev, [threadId]: Date.now() }));
		},
		[clearThread, gameId],
	);

	const deleteThreadById = useCallback(
		(threadId: string) => {
			deleteThread(gameId, threadId);
			setThreadResetKeys((prev) => {
				const next = { ...prev };
				delete next[threadId];
				return next;
			});
		},
		[deleteThread, gameId],
	);

	const currentResetKey = currentThread ? (threadResetKeys[currentThread.id] ?? 0) : 0;

	return {
		hasHydrated,
		threads,
		currentThreadId,
		currentThread,
		currentResetKey,
		actions: {
			selectThread,
			newChat,
			clearThread: clearThreadById,
			deleteThread: deleteThreadById,
			messagesChanged,
		},
	} as const;
}
