import { EntityViewHeader } from "~/components/entity-view";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { Spinner } from "~/components/ui/spinner";
import type { EntityType as SingularEntityType } from "~/types";
import type {
	Character,
	Entity,
	EntityMutationPayload,
	EntityType,
	Quest,
} from "~/types/split-view";

const singularTypeMap: Record<EntityType, SingularEntityType> = {
	characters: "character",
	factions: "faction",
	locations: "location",
	notes: "note",
	quests: "quest",
};

interface EntityContentDisplayProps {
	entity: Entity;
	entityType: EntityType;
	gameId: string;
	onSave: (payload: EntityMutationPayload) => Promise<void>;
	isSaving: boolean;
	isLoading?: boolean;
	isError?: boolean;
}

export function EntityContentDisplay({
	entity,
	entityType,
	gameId,
	onSave,
	isSaving,
	isLoading,
	isError,
}: EntityContentDisplayProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-32">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	if (isError || !entity) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				{singularTypeMap[entityType]} not found
			</div>
		);
	}

	const badges = createEntityBadges(entity, entityType);
	const singularType = singularTypeMap[entityType];

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={entity.id}
				type={singularType}
				content={entity.content}
				content_plain_text={entity.content_plain_text}
				name={entity.name}
				badges={badges}
				pinned={entity.pinned}
			/>
			<EntityEditor
				content={entity.content}
				gameId={gameId}
				entityType={singularType}
				entityId={entity.id}
				onSave={onSave}
				isSaving={isSaving}
				className="min-h-[200px]"
			/>
		</div>
	);
}

function createEntityBadges(entity: Entity, entityType: EntityType): React.ReactNode {
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
		case "characters": {
			const character = entity as Character;
			return (
				<div className="flex flex-wrap gap-2">
					{character.class && <Badge>{character.class}</Badge>}
					{character.level && <Badge>Level: {character.level}</Badge>}
					{commonTags}
				</div>
			);
		}
		case "quests": {
			const quest = entity as Quest;
			return (
				<div className="flex flex-wrap gap-2">
					<Badge>{quest.status}</Badge>
					{commonTags}
				</div>
			);
		}
		default:
			return commonTags;
	}
}
