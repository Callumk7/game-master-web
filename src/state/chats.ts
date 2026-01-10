import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatUIMessage } from "~/types";

export interface ChatThread {
	id: string;
	title: string;
	messages: ChatUIMessage[];
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
		options?: { title?: string; seedMessages?: ChatUIMessage[] },
	) => string;
	setCurrentThread: (gameId: string, threadId: string) => void;
	replaceThreadMessages: (
		gameId: string,
		threadId: string,
		messages: ChatUIMessage[],
	) => void;
	clearThread: (gameId: string, threadId: string) => void;
	deleteThread: (gameId: string, threadId: string) => void;
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

const trimMessages = (messages: ChatUIMessage[]): ChatUIMessage[] => {
	if (messages.length > MAX_PERSISTED_MESSAGES) {
		return messages.slice(messages.length - MAX_PERSISTED_MESSAGES);
	}
	return messages.slice();
};

const appendThreadToEnd = (threadId: string, order: string[]) => [
	...order.filter((id) => id !== threadId),
	threadId,
];

const normalizeGameChatState = (input: unknown): GameChatState => {
	const candidate = input as Partial<GameChatState> | null | undefined;
	const threads = (candidate?.threads ?? {}) as Record<string, ChatThread>;

	// Keep order in sync with actual thread IDs.
	const threadIds = Object.keys(threads);
	const threadOrder = (candidate?.threadOrder ?? []).filter(
		(id): id is string => typeof id === "string" && id in threads,
	);
	const normalizedOrder =
		threadOrder.length === threadIds.length
			? threadOrder
			: // Preserve existing order first, then append missing IDs.
				[...threadOrder, ...threadIds.filter((id) => !threadOrder.includes(id))];

	const currentThreadIdRaw = candidate?.currentThreadId ?? null;
	const currentThreadId =
		typeof currentThreadIdRaw === "string" && currentThreadIdRaw in threads
			? currentThreadIdRaw
			: null;

	const counterRaw = candidate?.counter ?? 0;
	const counter =
		typeof counterRaw === "number" && Number.isFinite(counterRaw) ? counterRaw : 0;

	// Ensure persisted messages don’t grow without bound.
	const nextThreads: Record<string, ChatThread> = {};
	for (const [id, thread] of Object.entries(threads)) {
		if (!thread) continue;
		nextThreads[id] = {
			...thread,
			messages: Array.isArray(thread.messages) ? trimMessages(thread.messages) : [],
		};
	}

	return {
		currentThreadId,
		threadOrder: normalizedOrder,
		counter,
		threads: nextThreads,
	};
};

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
					const existing = get().games[gameId];
					if (existing) return existing;

					const next = defaultGameChatState();
					set((state) => {
						if (state.games[gameId]) return state;
						return {
							games: {
								...state.games,
								[gameId]: next,
							},
						};
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
									threadOrder: appendThreadToEnd(
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
						const now = Date.now();
						const thread = game.threads[threadId];
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									currentThreadId: threadId,
									threadOrder: appendThreadToEnd(
										threadId,
										game.threadOrder,
									),
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											updatedAt: now,
										},
									},
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
						const now = Date.now();
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									threadOrder: appendThreadToEnd(
										threadId,
										game.threadOrder,
									),
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											messages: trimMessages(messages),
											updatedAt: now,
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
						const now = Date.now();
						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									threadOrder: appendThreadToEnd(
										threadId,
										game.threadOrder,
									),
									threads: {
										...game.threads,
										[threadId]: {
											...thread,
											messages: [],
											updatedAt: now,
										},
									},
								},
							},
						};
					});
				},
				deleteThread: (gameId, threadId) => {
					set((state) => {
						const game = state.games[gameId];
						if (!game || !game.threads[threadId]) return state;

						const nextThreads = { ...game.threads };
						delete nextThreads[threadId];

						const nextOrder = game.threadOrder.filter(
							(id) => id !== threadId,
						);

						const currentWasDeleted = game.currentThreadId === threadId;
						let nextCurrentThreadId = game.currentThreadId;
						if (currentWasDeleted) {
							// Prefer the "next" thread in order (same index), otherwise fallback to last/none.
							const removedIndex = game.threadOrder.indexOf(threadId);
							const candidate =
								removedIndex >= 0 && removedIndex < nextOrder.length
									? nextOrder[removedIndex]
									: nextOrder[nextOrder.length - 1];
							nextCurrentThreadId = candidate ?? null;
						}

						return {
							games: {
								...state.games,
								[gameId]: {
									...game,
									currentThreadId: nextCurrentThreadId,
									threadOrder: nextOrder,
									threads: nextThreads,
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
											updatedAt: Date.now(),
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
			version: 1,
			migrate: (persisted) => {
				const state = persisted as Partial<ChatState> | null | undefined;
				const games = (state?.games ?? {}) as Record<string, unknown>;
				const nextGames: Record<string, GameChatState> = {};
				for (const [gameId, gameState] of Object.entries(games)) {
					nextGames[gameId] = normalizeGameChatState(gameState);
				}
				return { games: nextGames };
			},
		},
	),
);

export const useGameChatState = (gameId: string) =>
	useChatStore((state) => state.games[gameId]);

export const useChatActions = () => useChatStore((state) => state.actions);
