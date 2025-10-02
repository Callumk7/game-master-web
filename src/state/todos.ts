import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: Date;
}

interface State {
	todos: Todo[];
}

interface Actions {
	addTodo: (text: string) => void;
	toggleTodo: (id: string) => void;
	deleteTodo: (id: string) => void;
}

export type TodoStore = State & {
	actions: Actions;
};

const useTodoStore = create<TodoStore>()(
	persist(
		(set, get) => ({
			todos: [],
			isDrawerOpen: false,
			actions: {
				addTodo: (text: string) => {
					const newTodo: Todo = {
						id: crypto.randomUUID(),
						text: text.trim(),
						completed: false,
						createdAt: new Date(),
					};
					set({ todos: [...get().todos, newTodo] });
				},
				toggleTodo: (id: string) => {
					set({
						todos: get().todos.map((todo) =>
							todo.id === id
								? { ...todo, completed: !todo.completed }
								: todo,
						),
					});
				},
				deleteTodo: (id: string) => {
					set({
						todos: get().todos.filter((todo) => todo.id !== id),
					});
				},
			},
		}),
		{
			name: "todos-storage",
			partialize: (state) => ({ todos: state.todos }),
		},
	),
);

// Selectors
export const useTodos = () => useTodoStore((state) => state.todos);

// Actions
export const useTodoActions = () => useTodoStore((state) => state.actions);

