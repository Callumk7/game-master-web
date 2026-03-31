import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Loader2, MoreHorizontal, Network, Trash2 } from "lucide-react";
import * as React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCanvasActions } from "~/state/canvas";
import type { EntityType } from "~/types";
import { CanvasContext } from "./entity-node";

// ---------------------------------------------------------------------------
// Route map for entity detail pages
// ---------------------------------------------------------------------------

const entityRouteMap: Record<EntityType, string> = {
	character: "/games/$gameId/characters/$id",
	faction: "/games/$gameId/factions/$id",
	location: "/games/$gameId/locations/$id",
	note: "/games/$gameId/notes/$id",
	quest: "/games/$gameId/quests/$id",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NodeContextMenuProps {
	gameId: string;
	nodeId: string;
	entityType: EntityType;
	entityId: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NodeContextMenu({
	gameId,
	nodeId,
	entityType,
	entityId,
}: NodeContextMenuProps) {
	const navigate = useNavigate();
	const { removeNode } = useCanvasActions();
	const { loadLinks, loadingNodeId } = React.useContext(CanvasContext);

	const isLoading = loadingNodeId === nodeId;

	const handleLoadLinks = React.useCallback(() => {
		loadLinks(nodeId);
	}, [loadLinks, nodeId]);

	const handleViewEntity = React.useCallback(() => {
		const route = entityRouteMap[entityType];
		if (route) {
			navigate({
				to: route,
				params: { gameId, id: entityId },
			});
		}
	}, [navigate, gameId, entityType, entityId]);

	const handleRemove = React.useCallback(() => {
		removeNode(gameId, nodeId);
	}, [removeNode, gameId, nodeId]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className="nodrag nopan shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						aria-label="Node actions"
					>
						<MoreHorizontal className="size-4" />
					</button>
				}
			/>
			<DropdownMenuPositioner sideOffset={4} align="start">
				<DropdownMenuContent>
					<DropdownMenuItem onClick={handleLoadLinks} disabled={isLoading}>
						{isLoading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Network className="size-4" />
						)}
						{isLoading ? "Loading links…" : "Load Links"}
					</DropdownMenuItem>

					<DropdownMenuItem onClick={handleViewEntity}>
						<ExternalLink className="size-4" />
						View Entity
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem variant="destructive" onClick={handleRemove}>
						<Trash2 className="size-4" />
						Remove from Canvas
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
