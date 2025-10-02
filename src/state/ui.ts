import { create } from "zustand";

interface State {
	isCreateFactionOpen: boolean;
	isCreateCharacterOpen: boolean;
	isCreateLocationOpen: boolean;
	isCreateNoteOpen: boolean;
	isCreateQuestOpen: boolean;
	isCommanderOpen: boolean;
	isTodoDrawerOpen: boolean;
}

interface Actions {
	setIsCreateFactionOpen: (isOpen: boolean) => void;
	setIsCreateCharacterOpen: (isOpen: boolean) => void;
	setIsCreateLocationOpen: (isOpen: boolean) => void;
	setIsCreateNoteOpen: (isOpen: boolean) => void;
	setIsCreateQuestOpen: (isOpen: boolean) => void;
	setIsCommanderOpen: (isOpen: boolean) => void;
	setIsTodoDrawerOpen: (isOpen: boolean) => void;
}

export type Store = State & {
	actions: Actions;
};

const useUIStore = create<Store>()((set) => ({
	isCreateFactionOpen: false,
	isCreateCharacterOpen: false,
	isCreateLocationOpen: false,
	isCreateNoteOpen: false,
	isCreateQuestOpen: false,
	isCommanderOpen: false,
	isTodoDrawerOpen: false,
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

// Actions
export const useUIActions = () => useUIStore((state) => state.actions);
