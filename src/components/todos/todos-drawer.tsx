import { CheckSquare, ListTodo, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { useTodoActions, useTodos } from "~/state/todos";
import { useIsTodoDrawerOpen, useUIActions } from "~/state/ui";
import { TodoItem } from "./todo-item";

export function TodosDrawer() {
	const [newTodoText, setNewTodoText] = useState("");
	const todos = useTodos();
	const isOpen = useIsTodoDrawerOpen();
	const { addTodo } = useTodoActions();
	const { setIsTodoDrawerOpen } = useUIActions();

	const handleAddTodo = (e: React.FormEvent) => {
		e.preventDefault();
		if (newTodoText.trim()) {
			addTodo(newTodoText);
			setNewTodoText("");
		}
	};

	const completedCount = todos.filter((todo) => todo.completed).length;

	return (
		<>
			{/* Floating Action Button */}
			<Popover open={isOpen} onOpenChange={setIsTodoDrawerOpen}>
				<PopoverTrigger
					render={
						<Button
							size="icon"
							className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
						>
							<ListTodo className="h-5 w-5" />
						</Button>
					}
				></PopoverTrigger>

				<PopoverPositioner side="top" align="end" sideOffset={16}>
					<PopoverContent className="w-80 p-0">
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b">
							<div className="flex items-center gap-2">
								<CheckSquare className="h-4 w-4" />
								<h3 className="font-semibold text-sm">Todos</h3>
								{todos.length > 0 && (
									<span className="text-xs text-muted-foreground">
										{completedCount}/{todos.length}
									</span>
								)}
							</div>
						</div>

						{/* Add Todo Form */}
						<div className="p-4 border-b">
							<form onSubmit={handleAddTodo} className="flex gap-2">
								<Input
									value={newTodoText}
									onChange={(e) => setNewTodoText(e.target.value)}
									placeholder="Add a new todo..."
									className="flex-1 h-8 text-sm"
								/>
								<Button
									type="submit"
									size="icon"
									variant="outline"
									className="h-8 w-8 shrink-0"
									disabled={!newTodoText.trim()}
								>
									<Plus className="h-3 w-3" />
								</Button>
							</form>
						</div>

						{/* Todo List */}
						<div className="max-h-80 overflow-y-auto">
							{todos.length === 0 ? (
								<div className="p-3 text-center text-sm text-muted-foreground">
									<ListTodo className="h-6 w-6 mx-auto mb-2 opacity-50" />
								</div>
							) : (
								<div className="p-2 space-y-1">
									{todos
										.sort((a, b) => {
											if (a.completed && !b.completed) return 1;
											if (!a.completed && b.completed) return -1;
											return (
												new Date(b.createdAt).getTime() -
												new Date(a.createdAt).getTime()
											);
										})
										.map((todo, index) => (
											<div key={todo.id}>
												<TodoItem todo={todo} />
												{index < todos.length - 1 && (
													<Separator className="my-1" />
												)}
											</div>
										))}
								</div>
							)}
						</div>
					</PopoverContent>
				</PopoverPositioner>
			</Popover>
		</>
	);
}
