import { createFileRoute } from "@tanstack/react-router";
import { AllEntitiesTable, type AllEntity } from "~/components/all-entities-table";
import { PageHeader } from "~/components/page-header";
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import type { EntityType } from "~/types";

export const Route = createFileRoute("/_auth/games/$gameId/all")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useGetGameLinksSuspenseQuery({ id: gameId });

	// Transform the API response into our AllEntity format
	const allEntities: AllEntity[] = [];

	if (data.data?.entities) {
		const { entities } = data.data;

		// Add characters
		if (entities.characters) {
			for (const character of entities.characters) {
				allEntities.push({
					...character,
					type: "character" as EntityType,
				});
			}
		}

		// Add factions
		if (entities.factions) {
			for (const faction of entities.factions) {
				allEntities.push({
					...faction,
					type: "faction" as EntityType,
				});
			}
		}

		// Add locations
		if (entities.locations) {
			for (const location of entities.locations) {
				allEntities.push({
					...location,
					type: "location" as EntityType,
				});
			}
		}

		// Add notes
		if (entities.notes) {
			for (const note of entities.notes) {
				allEntities.push({
					...note,
					type: "note" as EntityType,
				});
			}
		}

		// Add quests
		if (entities.quests) {
			for (const quest of entities.quests) {
				allEntities.push({
					...quest,
					type: "quest" as EntityType,
				});
			}
		}
	}

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title="All Entities"
				description="Browse all characters, factions, locations, notes, and quests in your game."
			/>
			<AllEntitiesTable entities={allEntities} gameId={gameId} />
		</div>
	);
}
