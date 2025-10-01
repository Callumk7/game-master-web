import type { LinkRequest } from "~/api/types.gen";
import type { EntityType } from "~/types";

export interface EntityOption {
	label: string;
	value: string;
	type: EntityType;
}

export interface CreateLinkParams extends LinkRequest {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
}

export interface DeleteLinkParams {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
	targetType: EntityType;
	targetId: string;
}

export interface UpdateLinkParams {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
	targetType: EntityType;
	targetId: string;
	data: {
		relationship_type?: string;
		description?: string;
		is_active?: boolean;
		strength?: number;
	};
}
