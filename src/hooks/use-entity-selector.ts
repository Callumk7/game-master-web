import { useState, useEffect } from "react";
import { useEntityList } from "./use-entity-list";
import type { EntitySelectorState } from "~/types/split-view";

interface UseEntitySelectorParams {
	gameId: string;
	isOpen: boolean;
}

export function useEntitySelector({
	gameId,
	isOpen,
}: UseEntitySelectorParams): EntitySelectorState {
	const [searchQuery, setSearchQuery] = useState("");

	const { filteredEntities } = useEntityList({
		gameId,
		searchQuery,
	});

	// Reset search when selector closes
	useEffect(() => {
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
