import * as React from "react";
import type { EntitySelectorState } from "~/types/split-view";
import { useEntityList } from "./use-entity-list";

interface UseEntitySelectorParams {
	gameId: string;
	isOpen: boolean;
}

export function useEntitySelector({
	gameId,
	isOpen,
}: UseEntitySelectorParams): EntitySelectorState {
	const [searchQuery, setSearchQuery] = React.useState("");

	const { filteredEntities } = useEntityList({
		gameId,
		searchQuery,
	});

	// Reset search when selector closes
	React.useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	return {
		searchQuery,
		setSearchQuery,
		filteredEntities,
	};
}
