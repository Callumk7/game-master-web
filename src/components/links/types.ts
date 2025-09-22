import type { LinkRequest } from "~/api/types.gen";
import type { EntityType } from "~/types";

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

export interface CreateLinkParams extends LinkRequest {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
}
