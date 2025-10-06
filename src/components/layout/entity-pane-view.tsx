import { ExternalLink, RefreshCw } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useEntityData } from "~/hooks/use-entity-data";
import { useEntityMutations } from "~/hooks/use-entity-mutations";
import { useEntityNavigation } from "~/hooks/use-entity-navigation";
import type { EntityPath } from "~/types/split-view";
import { EntityContentDisplay } from "./entity-content-display";

interface EntityPaneViewProps {
	gameId: string;
	entityPath: EntityPath;
}

export function EntityPaneView({ gameId, entityPath }: EntityPaneViewProps) {
	const {
		data: entity,
		isLoading,
		isError,
	} = useEntityData({
		gameId,
		entityType: entityPath.type,
		entityId: entityPath.id,
	});

	const { mutateAsync, isPending } = useEntityMutations({
		gameId,
		entityType: entityPath.type,
		entityId: entityPath.id,
	});

	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		await mutateAsync(payload);
	};

	const handleRefresh = () => {
		refreshEntity(entityPath.type, entityPath.id);
	};

	const handleOpenFullView = () => {
		openFullView(entityPath.type, entityPath.id);
	};

	return (
		<div className="h-full flex flex-col">
			{/* Pane Header */}
			<div className="flex-shrink-0 flex items-center justify-between p-2 border-b bg-card">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs">
						{entityPath.type.slice(0, -1)} {/* Remove 's' suffix */}
					</Badge>
					<span className="text-sm font-medium truncate">{entityPath.id}</span>
				</div>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={handleRefresh}
						title="Refresh"
					>
						<RefreshCw className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={handleOpenFullView}
						title="Open in full view"
					>
						<ExternalLink className="h-3 w-3" />
					</Button>
				</div>
			</div>

			{/* Entity Content */}
			<div className="flex-1 min-h-0">
				<ScrollArea className="h-[75vh]">
					{entity && (
						<EntityContentDisplay
							entity={entity}
							entityType={entityPath.type}
							gameId={gameId}
							onSave={handleSave}
							isSaving={isPending}
							isLoading={isLoading}
							isError={isError}
						/>
					)}
				</ScrollArea>
			</div>
		</div>
	);
}
