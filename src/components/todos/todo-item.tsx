import { X } from "lucide-react";
import { type Todo, useTodoActions } from "~/state/todos";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/utils/cn";

interface TodoItemProps {
	todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
	const { toggleTodo, deleteTodo } = useTodoActions();

	const handleToggle = () => {
		toggleTodo(todo.id);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		deleteTodo(todo.id);
	};

	return (
		<div className="relative group">
			<button
				type="button"
				className="flex items-center gap-3 p-2 text-left rounded-md hover:bg-accent/50 cursor-pointer w-full pr-10"
				onClick={handleToggle}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleToggle();
					}
				}}
			>
				<Checkbox
					checked={todo.completed}
					className="shrink-0 pointer-events-none"
					tabIndex={-1}
				/>
				<span
					className={cn(
						"flex-1 text-sm transition-all select-none",
						todo.completed && "line-through text-muted-foreground",
					)}
				>
					{todo.text}
				</span>
			</button>
			<Button
				variant="ghost"
				size="icon"
				onClick={handleDelete}
				className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	);
}
