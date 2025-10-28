import * as React from "react";
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
	createCharacterFactionId?: string;
	isCreateLocationOpen: boolean;
	createLocationParentId: string | undefined;
	isCreateNoteOpen: boolean;
	createNoteParentId: string | undefined;
	isCreateQuestOpen: boolean;
	createQuestParentId: string | undefined;
	isCommanderOpen: boolean;
	isTodoDrawerOpen: boolean;
	// Edit modal state
	isEditCharacterOpen: boolean;
	editCharacterId: string | undefined;
	isEditFactionOpen: boolean;
	editFactionId: string | undefined;
	isEditLocationOpen: boolean;
	editLocationId: string | undefined;
	isEditNoteOpen: boolean;
	editNoteId: string | undefined;
	isEditQuestOpen: boolean;
	editQuestId: string | undefined;
	// Windows
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
	setCreateCharacterFactionId: (factionId: string | undefined) => void;
	setIsCreateLocationOpen: (isOpen: boolean) => void;
	setCreateLocationParentId: (parentId: string | undefined) => void;
	setIsCreateNoteOpen: (isOpen: boolean) => void;
	setCreateNoteParentId: (parentId: string | undefined) => void;
	setIsCreateQuestOpen: (isOpen: boolean) => void;
	setCreateQuestParentId: (parentId: string | undefined) => void;
	setIsCommanderOpen: (isOpen: boolean) => void;
	setIsTodoDrawerOpen: (isOpen: boolean) => void;
	// Edit modal actions
	setIsEditCharacterOpen: (isOpen: boolean) => void;
	setEditCharacterId: (id: string | undefined) => void;
	setIsEditFactionOpen: (isOpen: boolean) => void;
	setEditFactionId: (id: string | undefined) => void;
	setIsEditLocationOpen: (isOpen: boolean) => void;
	setEditLocationId: (id: string | undefined) => void;
	setIsEditNoteOpen: (isOpen: boolean) => void;
	setEditNoteId: (id: string | undefined) => void;
	setIsEditQuestOpen: (isOpen: boolean) => void;
	setEditQuestId: (id: string | undefined) => void;
	// Window actions
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
	createCharacterFactionId: undefined,
	isCreateLocationOpen: false,
	createLocationParentId: undefined,
	isCreateNoteOpen: false,
	createNoteParentId: undefined,
	isCreateQuestOpen: false,
	createQuestParentId: undefined,
	isCommanderOpen: false,
	isTodoDrawerOpen: false,
	// Edit modal state
	isEditCharacterOpen: false,
	editCharacterId: undefined,
	isEditFactionOpen: false,
	editFactionId: undefined,
	isEditLocationOpen: false,
	editLocationId: undefined,
	isEditNoteOpen: false,
	editNoteId: undefined,
	isEditQuestOpen: false,
	editQuestId: undefined,
	// Windows
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
		setCreateCharacterFactionId: (factionId: string | undefined) =>
			set({ createCharacterFactionId: factionId }),
		setIsCreateLocationOpen: (isOpen: boolean) =>
			set({ isCreateLocationOpen: isOpen }),
		setCreateLocationParentId: (parentId: string | undefined) =>
			set({ createLocationParentId: parentId }),
		setIsCreateNoteOpen: (isOpen: boolean) => set({ isCreateNoteOpen: isOpen }),
		setCreateNoteParentId: (parentId: string | undefined) =>
			set({ createNoteParentId: parentId }),
		setIsCreateQuestOpen: (isOpen: boolean) => set({ isCreateQuestOpen: isOpen }),
		setCreateQuestParentId: (parentId: string | undefined) =>
			set({ createQuestParentId: parentId }),
		setIsCommanderOpen: (isOpen: boolean) => set({ isCommanderOpen: isOpen }),
		setIsTodoDrawerOpen: (isOpen: boolean) => set({ isTodoDrawerOpen: isOpen }),
		// Edit modal actions
		setIsEditCharacterOpen: (isOpen: boolean) => set({ isEditCharacterOpen: isOpen }),
		setEditCharacterId: (id: string | undefined) => set({ editCharacterId: id }),
		setIsEditFactionOpen: (isOpen: boolean) => set({ isEditFactionOpen: isOpen }),
		setEditFactionId: (id: string | undefined) => set({ editFactionId: id }),
		setIsEditLocationOpen: (isOpen: boolean) => set({ isEditLocationOpen: isOpen }),
		setEditLocationId: (id: string | undefined) => set({ editLocationId: id }),
		setIsEditNoteOpen: (isOpen: boolean) => set({ isEditNoteOpen: isOpen }),
		setEditNoteId: (id: string | undefined) => set({ editNoteId: id }),
		setIsEditQuestOpen: (isOpen: boolean) => set({ isEditQuestOpen: isOpen }),
		setEditQuestId: (id: string | undefined) => set({ editQuestId: id }),
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
export const useCreateCharacterFactionId = () =>
	useUIStore((state) => state.createCharacterFactionId);
export const useIsCreateLocationOpen = () =>
	useUIStore((state) => state.isCreateLocationOpen);
export const useCreateLocationParentId = () =>
	useUIStore((state) => state.createLocationParentId);
export const useIsCreateNoteOpen = () => useUIStore((state) => state.isCreateNoteOpen);
export const useCreateNoteParentId = () =>
	useUIStore((state) => state.createNoteParentId);
export const useIsCreateQuestOpen = () => useUIStore((state) => state.isCreateQuestOpen);
export const useCreateQuestParentId = () =>
	useUIStore((state) => state.createQuestParentId);
export const useIsCommanderOpen = () => useUIStore((state) => state.isCommanderOpen);
export const useIsTodoDrawerOpen = () => useUIStore((state) => state.isTodoDrawerOpen);

// Edit modal selectors
export const useIsEditCharacterOpen = () =>
	useUIStore((state) => state.isEditCharacterOpen);
export const useEditCharacterId = () => useUIStore((state) => state.editCharacterId);
export const useHandleEditCharacter = (id: string) => {
	const { setIsEditCharacterOpen, setEditCharacterId } = useUIActions();
	return () => {
		setIsEditCharacterOpen(true);
		setEditCharacterId(id);
	};
};
export const useIsEditFactionOpen = () => useUIStore((state) => state.isEditFactionOpen);
export const useEditFactionId = () => useUIStore((state) => state.editFactionId);
export const useHandleEditFaction = (id: string) => {
	const { setIsEditFactionOpen, setEditFactionId } = useUIActions();
	return () => {
		setIsEditFactionOpen(true);
		setEditFactionId(id);
	};
};
export const useIsEditLocationOpen = () =>
	useUIStore((state) => state.isEditLocationOpen);
export const useEditLocationId = () => useUIStore((state) => state.editLocationId);
export const useHandleEditLocation = (id: string) => {
	const { setIsEditLocationOpen, setEditLocationId } = useUIActions();
	return () => {
		setIsEditLocationOpen(true);
		setEditLocationId(id);
	};
};
export const useIsEditNoteOpen = () => useUIStore((state) => state.isEditNoteOpen);
export const useEditNoteId = () => useUIStore((state) => state.editNoteId);
export const useHandleEditNote = (id: string) => {
	const { setIsEditNoteOpen, setEditNoteId } = useUIActions();
	return () => {
		setIsEditNoteOpen(true);
		setEditNoteId(id);
	};
};
export const useIsEditQuestOpen = () => useUIStore((state) => state.isEditQuestOpen);
export const useEditQuestId = () => useUIStore((state) => state.editQuestId);
export const useHandleEditQuest = (id: string) => {
	const { setIsEditQuestOpen, setEditQuestId } = useUIActions();
	return () => {
		setIsEditQuestOpen(true);
		setEditQuestId(id);
	};
};

// Single interface for editing an entity
export const useHandleEditEntity = (id: string, entityType: EntityType) => {
	const handleEditCharacter = useHandleEditCharacter(id);
	const handleEditFaction = useHandleEditFaction(id);
	const handleEditLocation = useHandleEditLocation(id);
	const handleEditNote = useHandleEditNote(id);
	const handleEditQuest = useHandleEditQuest(id);

	return entityType === "character"
		? handleEditCharacter
		: entityType === "faction"
			? handleEditFaction
			: entityType === "location"
				? handleEditLocation
				: entityType === "note"
					? handleEditNote
					: entityType === "quest"
						? handleEditQuest
						: undefined;
};

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
export const useGameTabs = (gameId: string) => {
	const allTabs = useTabList();
	return React.useMemo(
		() => allTabs.filter((t) => t.gameId === gameId),
		[allTabs, gameId],
	);
};

// Actions
export const useUIActions = () => useUIStore((state) => state.actions);
