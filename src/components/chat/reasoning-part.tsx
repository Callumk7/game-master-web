import { Brain } from "lucide-react";

export function ReasoningPart({ part }: { part: { text: string; state?: string } }) {
	return (
		<div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2">
			<div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
				<Brain className="size-3" />
				<span>Thinking</span>
				{part.state === "streaming" && <span className="animate-pulse">...</span>}
			</div>
			<div className="text-sm text-muted-foreground italic">{part.text}</div>
		</div>
	);
}
