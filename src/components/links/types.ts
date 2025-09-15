export type EntityType = 'character' | 'faction' | 'location' | 'note' | 'quest';

export interface EntityOption {
	label: string;
	value: string;
	type: EntityType;
}

export interface CreateLinkFormProps {
	gameId: string;
	sourceEntityType: EntityType;
	sourceEntityId: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	excludeTypes?: EntityType[];
	excludeIds?: string[];
}

export interface CreateLinkParams {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
	targetType: EntityType;
	targetId: string;
}
