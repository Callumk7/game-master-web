import { Link } from "@tanstack/react-router";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type * as React from "react";
import { cn } from "~/utils/cn";

interface MentionAttributes {
	id: string;
	label: string;
	type: "character" | "faction" | "location" | "note" | "quest";
	gameId: string;
}

export const MentionComponent: React.FC<ReactNodeViewProps> = ({ node }) => {
	const { id, label, type, gameId } = node.attrs as MentionAttributes;

	if (!id || !label || !type || !gameId) {
		return (
			<NodeViewWrapper className="inline">@{label || "unknown"}</NodeViewWrapper>
		);
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
				return "⚔";
			case "location":
				return "🗺";
			case "note":
				return "📝";
			case "quest":
				return "🎯";
			default:
				return "📄";
		}
	};

	const routeParams = getRouteParams();

	return (
		<NodeViewWrapper className="inline mention" as="span" draggable={false}>
			<Link
				{...routeParams}
				className={cn(
					"inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-sm",
					"bg-primary/10 text-primary border border-primary/20",
					"hover:bg-primary/20 hover:border-primary/30 hover:text-primary",
					"no-underline font-medium transition-colors cursor-pointer",
					"mention-link", // Add specific class for CSS targeting
				)}
				onMouseDown={(e) => {
					e.stopPropagation();
					e.preventDefault();
				}}
				onClick={(e) => {
					e.stopPropagation();
				}}
				onMouseUp={(e) => e.stopPropagation()}
			>
				<span className="text-xs">{getEntityIcon()}</span>
				<span>{label}</span>
			</Link>
		</NodeViewWrapper>
	);
};
