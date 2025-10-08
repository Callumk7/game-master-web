import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { MonsterTable } from "~/components/monsters/monster-table";
import type { MonsterData } from "~/types/monster";
import mmData from "../../../../../../data/beastiary/mm.json";

export const Route = createFileRoute("/_auth/games/$gameId/beasts/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState("");
	const [paginationSize, setPaginationSize] = React.useState(25);

	// Type the imported data properly
	const monsterData = mmData as MonsterData;
	const monsters = monsterData.monster;

	return (
		<Container>
			<PageHeader
				title="Bestiary"
				description="Browse creatures and monsters for your game."
			/>
			<MonsterTable
				data={monsters}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				paginationSize={paginationSize}
				onPaginationSizeChange={setPaginationSize}
			/>
		</Container>
	);
}
