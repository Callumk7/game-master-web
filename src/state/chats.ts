import type { UIMessage } from "ai";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatThread {
	id: string;
	title: string;
	messages: UIMessage[];
	createdAt: number;
	updatedAt: number;
}

export interface GameChatState {
	currentThreadId: string | null;
	threadOrder: string[];
	counter: number;
	threads: Record<string, ChatThread>;
}

interface ChatState {
	games: Record<string, GameChatState>;
}

interface ChatActions {
	ensureGame: (gameId: string) => GameChatState;
	startThread: (
		gameId: string,
		options?: { title?: string; seedMessages?: UIMessage[] },
	) => string;
	setCurrentThread: (gameId: string, threadId: string) => void;
	replaceThreadMessages: (
		gameId: string,
		threadId: string,
		messages: UIMessage[],
	) => void;
	clearThread: (gameId: string, threadId: string) => void;
	renameThread: (gameId: string, threadId: string, title: string) => void;
}

export type ChatStore = ChatState & {
	actions: ChatActions;
};

const MAX_PERSISTED_MESSAGES = 100;

const defaultGameChatState = (): GameChatState => ({
	currentThreadId: null,
	threadOrder: [],
	counter: 0,
	threads: {},
});

const trimMessages = (messages: UIMessage[]): UIMessage[] => {
	if (messages.length > MAX_PERSISTED_MESSAGES) {
		return messages.slice(messages.length - MAX_PERSISTED_MESSAGES);
	}
	return messages.slice();
};

const promoteThreadToFront = (threadId: string, order: string[]) => [
	threadId,
	...order.filter((id) => id !== threadId),
];

const generateThreadId = (): string => {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}
	return `chat-${Math.random().toString(16).slice(2, 10)}`;
};

export const useChatStore = create<ChatStore>()(
	persist(
		(set, get) => ({
			games: {},
			actions: {
				ensureGame: (gameId) => {
					const games = get().games;
					const existing = games[gameId];
					if (existing) return existing;
					const next = defaultGameChatState();
					set({
						games: {
							...games,
							[gameId]: next,
						},
					});
					return next;
				},
				startThread: (gameId, options) => {
					const threadId = generateThreadId();
					set((state) => {
						const now = Date.now();
						const game = state.games[gameId] ?? defaultGameChatState();
						const nextCounter = game.counter + 1;
						const title = options?.title ?? `Chat ${nextCounter}`;
						const messages = options?.seedMessages
							? trimMessages(options.seedMessages)
							: [];
						const thread: ChatThread = {
							id: threadId,
							title,
							createdAt: now,
							updatedAt: now,
							messages,
						};
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									counter: nextCounter,
									currentThreadId: threadId,
									threadOrder: promoteThreadToFront(
										threadId,
										game.threadOrder,
									),
									threads: {
										...game.threads,
										[threadId]: thread,
									},
								},
							},
						};
					});
					return threadId;
				},
				setCurrentThread: (gameId, threadId) => {
					set((state) => {
						const game = state.games[gameId];
						if (!game || !game.threads[threadId]) return state;
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									currentThreadId: threadId,
									threadOrder: promoteThreadToFront(
										threadId,
										game.threadOrder,
									),
								},
							},
						};
					});
				},
				replaceThreadMessages: (gameId, threadId, messages) => {
					set((state) => {
						const game = state.games[gameId];
						if (!game || !game.threads[threadId]) return state;
						const thread = game.threads[threadId];
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											messages: trimMessages(messages),
											updatedAt: Date.now(),
										},
									},
								},
							},
						};
					});
				},
				clearThread: (gameId, threadId) => {
					set((state) => {
						const game = state.games[gameId];
						if (!game || !game.threads[threadId]) return state;
						const thread = game.threads[threadId];
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											messages: [],
											updatedAt: Date.now(),
										},
									},
								},
							},
						};
					});
				},
				renameThread: (gameId, threadId, title) => {
					set((state) => {
						const game = state.games[gameId];
						if (!game || !game.threads[threadId]) return state;
						const thread = game.threads[threadId];
						const nextTitle = title.trim();
						if (!nextTitle) return state;
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											title: nextTitle,
										},
									},
								},
							},
						};
					});
				},
			},
		}),
		{
			name: "chat-storage",
			partialize: (state) => ({ games: state.games }),
		},
	),
);

export const useGameChatState = (gameId: string) =>
	useChatStore((state) => state.games[gameId]);

export const useChatActions = () => useChatStore((state) => state.actions);
