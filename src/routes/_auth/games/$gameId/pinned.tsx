import { createFileRoute } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { AllEntitiesTable, type AllEntity } from "~/components/all-entities-table";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { useListPinnedEntitiesSuspenseQuery } from "~/queries/quests";
import type { EntityType } from "~/types";

export const Route = createFileRoute("/_auth/games/$gameId/pinned")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListPinnedEntitiesSuspenseQuery(gameId);

	const pinnedEntities = data.data?.pinned_entities;
	const allEntities: AllEntity[] = [];

	if (pinnedEntities) {
		for (const character of pinnedEntities.characters ?? []) {
			allEntities.push({
				...character,
				type: "character" as EntityType,
			});
		}

		for (const faction of pinnedEntities.factions ?? []) {
			allEntities.push({
				...faction,
				type: "faction" as EntityType,
			});
		}

		for (const location of pinnedEntities.locations ?? []) {
			allEntities.push({
				...location,
				type: "location" as EntityType,
				locationType: location.type,
			});
		}

		for (const note of pinnedEntities.notes ?? []) {
			allEntities.push({
				...note,
				type: "note" as EntityType,
			});
		}

		for (const quest of pinnedEntities.quests ?? []) {
			allEntities.push({
				...quest,
				type: "quest" as EntityType,
			});
		}
	}

	return (
		<Container>
			<PageHeader
				title="Pinned Entities"
				description="Table view of all currently pinned entities across your game."
				Icon={Pin}
			/>
			<AllEntitiesTable entities={allEntities} gameId={gameId} />
		</Container>
	);
}
