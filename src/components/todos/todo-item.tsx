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
		<div 
			className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 group cursor-pointer"
			onClick={handleToggle}
		>
			<Checkbox
				checked={todo.completed}
				onCheckedChange={handleToggle}
				className="shrink-0 pointer-events-none"
			/>
			<span
				className={cn(
					"flex-1 text-sm transition-all select-none",
					todo.completed && "line-through text-muted-foreground"
				)}
			>
				{todo.text}
			</span>
			<Button
				variant="ghost"
				size="icon"
				onClick={handleDelete}
				className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	);
}