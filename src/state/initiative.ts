import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Unit {
	id: string;
	name: string;
	health: number;
	ac: number;
	initiative: number;
}

interface StateUnit extends Unit {
	dead: boolean;
}

// State now uses an Array
interface State {
	units: StateUnit[];
}

interface Actions {
	addUnit: (unit: Unit) => void;
	removeUnit: (id: string) => void;
	clear: () => void;
	setUnitHealth: (id: string, health: number) => void;
	setUnitInitiative: (id: string, initiative: number) => void;
	setUnitAC: (id: string, ac: number) => void;
	sortUnits: () => void;
	toggleDead: (id: string) => void;
}

type InitiativeStore = State & {
	actions: Actions;
};

const useInitiativeStore = create<InitiativeStore>()(
	persist(
		(set, get) => ({
			units: [], // Default state is an empty array
			actions: {
				addUnit: (unit: Unit) => {
					// Add logic to prevent duplicates by id
					if (get().units.some((u) => u.id === unit.id)) {
						return; // Or handle as an update
					}
					set({ units: [...get().units, { ...unit, dead: false }] });
				},

				removeUnit: (id: string) => {
					set({ units: get().units.filter((unit) => unit.id !== id) });
				},

				clear: () => {
					set({ units: [] });
				},

				setUnitHealth: (id: string, health: number) => {
					set({
						units: get().units.map((unit) =>
							unit.id === id ? { ...unit, health } : unit,
						),
					});
				},

				toggleDead: (id: string) => {
					set({
						units: get().units.map((unit) =>
							unit.id === id ? { ...unit, dead: !unit.dead } : unit,
						),
					});
				},

				setUnitInitiative: (id: string, initiative: number) => {
					set({
						units: get().units.map((unit) =>
							unit.id === id ? { ...unit, initiative } : unit,
						),
					});
				},

				setUnitAC: (id: string, ac: number) => {
					set({
						units: get().units.map((unit) =>
							unit.id === id ? { ...unit, ac } : unit,
						),
					});
				},

				sortUnits: () => {
					const sortedUnits = [...get().units].sort((a, b) => {
						if (a.dead && !b.dead) {
							return 1;
						} else if (!a.dead && b.dead) {
							return -1;
						} else {
							return b.initiative - a.initiative;
						}
					});
					set({ units: sortedUnits });
				},
			},
		}),
		{
			name: "initiative-storage",
			partialize: (state) => ({ units: state.units }),
		},
	),
);

export const useInitiativeUnits = () => useInitiativeStore((state) => state.units);
export const useInitiativeActions = () => useInitiativeStore((state) => state.actions);
