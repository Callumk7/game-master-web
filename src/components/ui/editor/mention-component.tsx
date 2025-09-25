import { NodeViewWrapper } from "@tiptap/react";
import * as React from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { cn } from "~/utils/cn";

interface MentionComponentProps {
	node: {
		attrs: {
			id: string;
			label: string;
			type: "character" | "faction" | "location" | "note" | "quest";
			gameId: string;
		};
	};
}

export const MentionComponent: React.FC<MentionComponentProps> = ({ node }) => {
	const { id, label, type, gameId } = node.attrs;
	const router = useRouter();

	if (!id || !label || !type || !gameId) {
		return <NodeViewWrapper className="inline">@{label || "unknown"}</NodeViewWrapper>;
	}

	const getRouteParams = () => {
		switch (type) {
			case "character":
				return {
					to: "/games/$gameId/characters/$id" as const,
					params: { gameId, id },
				};
			case "faction":
				return {
					to: "/games/$gameId/factions/$id" as const,
					params: { gameId, id },
				};
			case "location":
				return {
					to: "/games/$gameId/locations/$id" as const,
					params: { gameId, id },
				};
			case "note":
				return {
					to: "/games/$gameId/notes/$id" as const,
					params: { gameId, id },
				};
			case "quest":
				return {
					to: "/games/$gameId/quests/$id" as const,
					params: { gameId, id },
				};
			default:
				return {
					to: "/games/$gameId" as const,
					params: { gameId },
				};
		}
	};

	const getEntityIcon = () => {
		switch (type) {
			case "character":
				return "👤";
			case "faction":
				return "⚔️";
			case "location":
				return "🗺️";
			case "note":
				return "📝";
			case "quest":
				return "🎯";
			default:
				return "📄";
		}
	};

	const routeParams = getRouteParams();

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		
		// Defer navigation to avoid flushSync conflicts with React rendering
		React.startTransition(() => {
			// Use setTimeout to ensure navigation happens after current render cycle
			setTimeout(() => {
				router.navigate({
					...routeParams,
				});
			}, 0);
		});
	};

	return (
		<NodeViewWrapper 
			className="inline mention" 
			as="span"
			draggable={false}
		>
			<button
				type="button"
				onClick={handleClick}
				onMouseDown={(e) => e.stopPropagation()}
				className={cn(
					"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm",
					"bg-primary/10 text-primary border border-primary/20",
					"hover:bg-primary/20 hover:border-primary/30",
					"no-underline font-medium transition-colors cursor-pointer",
					"border-none bg-transparent p-0 m-0",
				)}
			>
				<span 
					className={cn(
						"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm",
						"bg-primary/10 text-primary border border-primary/20",
						"hover:bg-primary/20 hover:border-primary/30",
						"font-medium transition-colors",
					)}
				>
					<span className="text-xs">{getEntityIcon()}</span>
					<span>{label}</span>
				</span>
			</button>
		</NodeViewWrapper>
	);
};
