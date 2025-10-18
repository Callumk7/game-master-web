import { create } from "zustand";
import type { EntityLink } from "~/components/links/types";
import type { EntityType } from "~/types";
import type { EntityPath } from "~/types/split-view";

export interface Tab {
	data: {
		id: string;
		name: string;
	};
	entityType: EntityType; // e.g., 'characters', 'factions', 'notes'
	gameId: string;
}

interface EntityWindow {
	id: string;
	entity: EntityLink;
	isOpen: boolean;
	isMinimized: boolean;
	position?: { x: number; y: number };
	size?: { width: number; height: number };
	zIndex: number;
	layerOrder: number;
}

interface State {
	isCreateFactionOpen: boolean;
	isCreateCharacterOpen: boolean;
	isCreateLocationOpen: boolean;
	isCreateNoteOpen: boolean;
	isCreateQuestOpen: boolean;
	isCommanderOpen: boolean;
	isTodoDrawerOpen: boolean;
	entityWindows: EntityWindow[];
	// Split view state
	splitViewLeftPane?: EntityPath;
	splitViewRightPane?: EntityPath;
	splitViewLeftSelectorOpen: boolean;
	splitViewRightSelectorOpen: boolean;
	// Tab state
	tabList: Tab[];
}

interface Actions {
	setIsCreateFactionOpen: (isOpen: boolean) => void;
	setIsCreateCharacterOpen: (isOpen: boolean) => void;
	setIsCreateLocationOpen: (isOpen: boolean) => void;
	setIsCreateNoteOpen: (isOpen: boolean) => void;
	setIsCreateQuestOpen: (isOpen: boolean) => void;
	setIsCommanderOpen: (isOpen: boolean) => void;
	setIsTodoDrawerOpen: (isOpen: boolean) => void;
	openEntityWindow: (entity: EntityLink) => void;
	closeEntityWindow: (windowId: string) => void;
	minimizeEntityWindow: (windowId: string) => void;
	restoreEntityWindow: (windowId: string) => void;
	updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
	updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
	bringWindowToFront: (windowId: string) => void;
	closeAllEntityWindows: () => void;
	// Split view actions
	updateSplitViewPanes: (leftPane?: EntityPath, rightPane?: EntityPath) => void;
	openSplitViewLeftSelector: () => void;
	openSplitViewRightSelector: () => void;
	closeSplitViewSelectors: () => void;
	clearSplitView: () => void;
	// Tab actions
	addTab: (tab: Tab) => void;
	removeTab: (tabId: string) => void;
	clearAllTabs: () => void;
}

export type Store = State & {
	actions: Actions;
};

let windowCounter = 0;
let globalLayerCounter = 0;
const BASE_Z_INDEX = 1000;

const useUIStore = create<Store>()((set, get) => ({
	isCreateFactionOpen: false,
	isCreateCharacterOpen: false,
	isCreateLocationOpen: false,
	isCreateNoteOpen: false,
	isCreateQuestOpen: false,
	isCommanderOpen: false,
	isTodoDrawerOpen: false,
	entityWindows: [],
	// Split view initial state
	splitViewLeftPane: undefined,
	splitViewRightPane: undefined,
	splitViewLeftSelectorOpen: false,
	splitViewRightSelectorOpen: false,
	// Tab inital state
	tabList: [],
	// Actions
	actions: {
		setIsCreateFactionOpen: (isOpen: boolean) => set({ isCreateFactionOpen: isOpen }),
		setIsCreateCharacterOpen: (isOpen: boolean) =>
			set({ isCreateCharacterOpen: isOpen }),
		setIsCreateLocationOpen: (isOpen: boolean) =>
			set({ isCreateLocationOpen: isOpen }),
		setIsCreateNoteOpen: (isOpen: boolean) => set({ isCreateNoteOpen: isOpen }),
		setIsCreateQuestOpen: (isOpen: boolean) => set({ isCreateQuestOpen: isOpen }),
		setIsCommanderOpen: (isOpen: boolean) => set({ isCommanderOpen: isOpen }),
		setIsTodoDrawerOpen: (isOpen: boolean) => set({ isTodoDrawerOpen: isOpen }),
		// Entity window actions
		openEntityWindow: (entity: EntityLink) => {
			const existingWindow = get().entityWindows.find(
				(w) => w.entity.id === entity.id && w.entity.type === entity.type,
			);

			if (existingWindow) {
				// Window already exists, just bring it to front or ensure it's open
				set((state) => ({
					entityWindows: state.entityWindows.map((w) =>
						w.id === existingWindow.id ? { ...w, isOpen: true } : w,
					),
				}));
				return;
			}

			// Create new window with staggered position
			const offset = windowCounter * 30;
			windowCounter = (windowCounter + 1) % 10;
			globalLayerCounter += 1;

			const newWindow: EntityWindow = {
				id: `${entity.type}-${entity.id}-${Date.now()}`,
				entity,
				isOpen: true,
				isMinimized: false,
				position: { x: offset, y: offset },
				size: { width: 600, height: 400 },
				zIndex: BASE_Z_INDEX + globalLayerCounter,
				layerOrder: globalLayerCounter,
			};

			set((state) => ({
				entityWindows: [...state.entityWindows, newWindow],
			}));
		},
		closeEntityWindow: (windowId: string) => {
			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId ? { ...w, isOpen: false } : w,
				),
			}));
		},
		minimizeEntityWindow: (windowId: string) => {
			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId ? { ...w, isMinimized: true } : w,
				),
			}));
		},
		restoreEntityWindow: (windowId: string) => {
			globalLayerCounter += 1;
			const newZIndex = BASE_Z_INDEX + globalLayerCounter;

			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId
						? {
								...w,
								isMinimized: false,
								zIndex: newZIndex,
								layerOrder: globalLayerCounter,
							}
						: w,
				),
			}));
		},
		updateWindowPosition: (windowId: string, position: { x: number; y: number }) => {
			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId ? { ...w, position } : w,
				),
			}));
		},
		updateWindowSize: (windowId: string, size: { width: number; height: number }) => {
			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId ? { ...w, size } : w,
				),
			}));
		},
		bringWindowToFront: (windowId: string) => {
			globalLayerCounter += 1;
			const newZIndex = BASE_Z_INDEX + globalLayerCounter;

			set((state) => ({
				entityWindows: state.entityWindows.map((w) =>
					w.id === windowId
						? { ...w, zIndex: newZIndex, layerOrder: globalLayerCounter }
						: w,
				),
			}));
		},
		closeAllEntityWindows: () => {
			set((state) => ({
				entityWindows: state.entityWindows.map((w) => ({ ...w, isOpen: false })),
			}));
		},
		// Split view actions
		updateSplitViewPanes: (leftPane?: EntityPath, rightPane?: EntityPath) => {
			set({
				splitViewLeftPane: leftPane,
				splitViewRightPane: rightPane,
			});
		},
		openSplitViewLeftSelector: () => {
			set({ splitViewLeftSelectorOpen: true });
		},
		openSplitViewRightSelector: () => {
			set({ splitViewRightSelectorOpen: true });
		},
		closeSplitViewSelectors: () => {
			set({
				splitViewLeftSelectorOpen: false,
				splitViewRightSelectorOpen: false,
			});
		},
		clearSplitView: () => {
			set({
				splitViewLeftPane: undefined,
				splitViewRightPane: undefined,
				splitViewLeftSelectorOpen: false,
				splitViewRightSelectorOpen: false,
			});
		},
		// Tab actions
		addTab: (tab: Tab) => {
			// Do not add duplicate tabs
			if (!get().tabList.some((t) => t.data.id === tab.data.id)) {
				set((state) => ({
					tabList: [...state.tabList, tab],
				}));
			}
			// Integrate with split view
			if (
				!get().splitViewLeftPane &&
				get().splitViewRightPane?.id !== tab.data.id
			) {
				set({ splitViewLeftPane: { type: tab.entityType, id: tab.data.id } });
			} else if (
				!get().splitViewRightPane &&
				get().splitViewLeftPane?.id !== tab.data.id
			) {
				set({ splitViewRightPane: { type: tab.entityType, id: tab.data.id } });
			}
		},
		removeTab: (tabId: string) => {
			set((state) => ({
				tabList: state.tabList.filter((t) => t.data.id !== tabId),
			}));
		},
		clearAllTabs: () => {
			set({ tabList: [] });
		},
	},
}));

// Selectors
export const useIsCreateFactionOpen = () =>
	useUIStore((state) => state.isCreateFactionOpen);
export const useIsCreateCharacterOpen = () =>
	useUIStore((state) => state.isCreateCharacterOpen);
export const useIsCreateLocationOpen = () =>
	useUIStore((state) => state.isCreateLocationOpen);
export const useIsCreateNoteOpen = () => useUIStore((state) => state.isCreateNoteOpen);
export const useIsCreateQuestOpen = () => useUIStore((state) => state.isCreateQuestOpen);
export const useIsCommanderOpen = () => useUIStore((state) => state.isCommanderOpen);
export const useIsTodoDrawerOpen = () => useUIStore((state) => state.isTodoDrawerOpen);

// Entity window selectors
export const useEntityWindows = () => useUIStore((state) => state.entityWindows);

// Split view selectors
export const useSplitViewLeftPane = () => useUIStore((state) => state.splitViewLeftPane);
export const useSplitViewRightPane = () =>
	useUIStore((state) => state.splitViewRightPane);
export const useSplitViewLeftSelectorOpen = () =>
	useUIStore((state) => state.splitViewLeftSelectorOpen);
export const useSplitViewRightSelectorOpen = () =>
	useUIStore((state) => state.splitViewRightSelectorOpen);

// Tab selectors
export const useTabList = () => useUIStore((state) => state.tabList);

// Actions
export const useUIActions = () => useUIStore((state) => state.actions);
