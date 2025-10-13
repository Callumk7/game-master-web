import { create } from "zustand";
import type { EntityLink } from "~/components/links/types";

interface EntityWindow {
	id: string;
	entity: EntityLink;
	isOpen: boolean;
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
	updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
	updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
	bringWindowToFront: (windowId: string) => void;
	closeAllEntityWindows: () => void;
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
		openEntityWindow: (entity: EntityLink) => {
			const existingWindow = get().entityWindows.find(
				(w) => w.entity.id === entity.id && w.entity.type === entity.type,
			);

			if (existingWindow) {
				// Window already exists, just bring it to front or ensure it's open
				set({
					entityWindows: get().entityWindows.map((w) =>
						w.id === existingWindow.id ? { ...w, isOpen: true } : w,
					),
				});
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
				position: { x: offset, y: offset },
				size: { width: 600, height: 400 },
				zIndex: BASE_Z_INDEX + globalLayerCounter,
				layerOrder: globalLayerCounter,
			};

			set({
				entityWindows: [...get().entityWindows, newWindow],
			});
		},
		closeEntityWindow: (windowId: string) => {
			set({
				entityWindows: get().entityWindows.map((w) =>
					w.id === windowId ? { ...w, isOpen: false } : w,
				),
			});
		},
		updateWindowPosition: (windowId: string, position: { x: number; y: number }) => {
			set({
				entityWindows: get().entityWindows.map((w) =>
					w.id === windowId ? { ...w, position } : w,
				),
			});
		},
		updateWindowSize: (windowId: string, size: { width: number; height: number }) => {
			set({
				entityWindows: get().entityWindows.map((w) =>
					w.id === windowId ? { ...w, size } : w,
				),
			});
		},
		bringWindowToFront: (windowId: string) => {
			globalLayerCounter += 1;
			const newZIndex = BASE_Z_INDEX + globalLayerCounter;

			set({
				entityWindows: get().entityWindows.map((w) =>
					w.id === windowId
						? { ...w, zIndex: newZIndex, layerOrder: globalLayerCounter }
						: w,
				),
			});
		},
		closeAllEntityWindows: () => {
			set({
				entityWindows: get().entityWindows.map((w) => ({ ...w, isOpen: false })),
			});
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

// Actions
export const useUIActions = () => useUIStore((state) => state.actions);
