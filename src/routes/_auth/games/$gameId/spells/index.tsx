import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { SpellTable } from "~/components/spells/spell-table";
import type { SpellFile } from "~/types/spell";
import spellData from "../../../../../../data/spells/phb.json";

export const Route = createFileRoute("/_auth/games/$gameId/spells/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [schoolFilter, setSchoolFilter] = React.useState("");
	const [levelFilter, setLevelFilter] = React.useState("");
	const [paginationSize, setPaginationSize] = React.useState(25);

	// Type the imported data properly
	const spellFile = spellData as SpellFile;
	const spells = spellFile.spell;

	return (
		<Container>
			<PageHeader
				title="Spellbook"
				description="Browse spells from the Player's Handbook."
			/>
			<SpellTable
				data={spells}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				schoolFilter={schoolFilter}
				onSchoolFilterChange={setSchoolFilter}
				levelFilter={levelFilter}
				onLevelFilterChange={setLevelFilter}
				paginationSize={paginationSize}
				onPaginationSizeChange={setPaginationSize}
			/>
		</Container>
	);
}
