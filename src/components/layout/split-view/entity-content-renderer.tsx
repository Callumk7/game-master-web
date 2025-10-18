import { ExternalLink, PlusCircle, RefreshCw, X } from "lucide-react";
import type * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Spinner } from "~/components/ui/spinner";
import { EntityViewHeader } from "~/components/views/entity-view";
import type { EntityType } from "~/types";
import type { EntityMutationPayload } from "~/types/split-view";

interface BaseEntity {
	id: string;
	name: string;
	content?: string;
	content_plain_text?: string;
	tags?: string[];
	pinned?: boolean;
}

interface CharacterEntity extends BaseEntity {
	class?: string;
	level?: number;
}

interface QuestEntity extends BaseEntity {
	status?: string;
}

type EntityUnion = BaseEntity | CharacterEntity | QuestEntity;

interface EntityContentRendererProps<T extends EntityUnion> {
	entity: T | undefined;
	entityType: EntityType;
	gameId: string;
	onSave: (payload: EntityMutationPayload) => Promise<void>;
	isLoading: boolean;
	isError: boolean;
	onClearEntity: () => void;
	onAddEntity: () => void;
	onRefresh: () => void;
	onOpenFullView: () => void;
}

export function EntityContentRenderer<T extends EntityUnion>({
	entity,
	entityType,
	gameId,
	onSave,
	isLoading,
	isError,
	onClearEntity,
	onAddEntity,
	onRefresh,
	onOpenFullView,
}: EntityContentRendererProps<T>) {
	return (
		<div className="h-[calc(100vh-170px)] flex flex-col">
			{/* Pane Header */}
			<div className="flex-shrink-0 flex items-center justify-between p-2 border-b bg-card">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs">
						{entityType}
					</Badge>
					<span className="text-sm font-medium truncate">{entity?.name}</span>
				</div>
				<div className="flex gap-3">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onRefresh}
						title="Refresh"
					>
						<RefreshCw className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onOpenFullView}
						title="Open in full view"
					>
						<ExternalLink className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onClearEntity}
					>
						<X className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onAddEntity}
					>
						<PlusCircle className="h-3 w-3" />
					</Button>
				</div>
			</div>

			{/* Entity Content */}
			<div className="flex-1 min-h-0">
				<ScrollArea className="h-[85vh]">
					{isLoading ? (
						<div className="flex items-center justify-center h-32">
							<Spinner className="h-6 w-6" />
						</div>
					) : isError || !entity ? (
						<div className="p-4 text-center text-muted-foreground">
							{entityType} not found
						</div>
					) : (
						<div className="p-4 space-y-4">
							<EntityViewHeader
								id={entity.id}
								gameId={gameId}
								type={entityType}
								content={entity.content || ""}
								content_plain_text={entity.content_plain_text || ""}
								name={entity.name}
								badges={createEntityBadges(entity, entityType)}
								pinned={entity.pinned}
							/>
							<EntityEditor
								content={entity.content || ""}
								gameId={gameId}
								entityType={entityType}
								entityId={entity.id}
								onSave={onSave}
								className="min-h-[200px]"
							/>
						</div>
					)}
				</ScrollArea>
			</div>
		</div>
	);
}

function createEntityBadges(
	entity: EntityUnion,
	entityType: EntityType,
): React.ReactNode {
	const commonTags = entity.tags && entity.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{entity.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	switch (entityType) {
		case "character": {
			const character = entity as CharacterEntity;
			return (
				<div className="flex flex-wrap gap-2">
					{character.class && <Badge>{character.class}</Badge>}
					{character.level && <Badge>Level: {character.level}</Badge>}
					{commonTags}
				</div>
			);
		}
		case "quest": {
			const quest = entity as QuestEntity;
			return (
				<div className="flex flex-wrap gap-2">
					{quest.status && <Badge>{quest.status}</Badge>}
					{commonTags}
				</div>
			);
		}
		default:
			return commonTags;
	}
}
