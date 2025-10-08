import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { EntityTable, SortableHeader } from "~/components/ui/entity-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { Monster } from "~/types/monster";
import {
	getMonsterType,
	getMonsterSize,
	getMonsterAC,
	getMonsterCR,
	getMonsterHP,
	getMonsterSpeed,
	matchesSearchQuery,
	matchesTypeFilter,
} from "~/utils/monster-utils";
import { MonsterDetailSheet } from "./monster-detail-sheet";

interface MonsterTableProps {
	data: Monster[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	typeFilter: string;
	onTypeFilterChange: (type: string) => void;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
}

function createMonsterColumns(): ColumnDef<Monster>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			minSize: 200,
			cell: ({ row }) => {
				const monster = row.original;
				return (
					<MonsterDetailSheet monster={monster}>
						<Button
							variant="link"
							className="p-0 h-auto font-medium text-left justify-start whitespace-pre-wrap"
						>
							{row.getValue("name")}
						</Button>
					</MonsterDetailSheet>
				);
			},
		},
		{
			accessorKey: "type",
			header: "Type",
			maxSize: 100,
			cell: ({ row }) => {
				const monster = row.original;
				const type = getMonsterType(monster);
				return (
					<Badge variant="secondary" className="capitalize">
						{type}
					</Badge>
				);
			},
		},
		{
			accessorKey: "size",
			header: "Size",
			maxSize: 80,
			cell: ({ row }) => {
				const monster = row.original;
				const size = getMonsterSize(monster);
				return <Badge variant="outline">{size}</Badge>;
			},
		},
		{
			accessorKey: "cr",
			header: ({ column }) => <SortableHeader column={column}>CR</SortableHeader>,
			maxSize: 60,
			cell: ({ row }) => {
				const monster = row.original;
				const cr = getMonsterCR(monster);
				return <div className="text-center font-mono">{cr}</div>;
			},
		},
		{
			accessorKey: "ac",
			header: "AC",
			maxSize: 60,
			cell: ({ row }) => {
				const monster = row.original;
				const ac = getMonsterAC(monster);
				return <div className="text-center font-mono">{ac}</div>;
			},
		},
		{
			accessorKey: "hp",
			header: "HP",
			maxSize: 80,
			cell: ({ row }) => {
				const monster = row.original;
				const hp = getMonsterHP(monster);
				return <div className="text-center font-mono">{hp}</div>;
			},
		},
		{
			accessorKey: "speed",
			header: "Speed",
			cell: ({ row }) => {
				const monster = row.original;
				const speed = getMonsterSpeed(monster);
				return <div className="text-sm">{speed}</div>;
			},
		},
		{
			accessorKey: "source",
			header: "Source",
			maxSize: 80,
			cell: ({ row }) => (
				<Badge variant="outline" className="text-xs">
					{row.getValue("source")}
				</Badge>
			),
		},
	];
}

export function MonsterTable({
	data,
	searchQuery,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	paginationSize = 25,
	onPaginationSizeChange,
}: MonsterTableProps) {
	const columns = createMonsterColumns();

	// Filter data based on search and type filter
	const filteredData = React.useMemo(() => {
		let filtered = data;

		if (searchQuery) {
			filtered = filtered.filter((monster) =>
				matchesSearchQuery(monster, searchQuery),
			);
		}

		if (typeFilter) {
			filtered = filtered.filter((monster) =>
				matchesTypeFilter(monster, typeFilter),
			);
		}

		return filtered;
	}, [data, searchQuery, typeFilter]);

	return (
		<EntityTable
			columns={columns}
			data={filteredData}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={typeFilter}
			onTagFilterChange={onTypeFilterChange}
			entityName="monster"
			searchPlaceholder="Search monsters..."
			tagPlaceholder="Filter by type..."
			paginationSize={paginationSize}
			onPaginationSizeChange={onPaginationSizeChange}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 2,
				type: 1,
				size: 0.8,
				cr: 0.6,
				ac: 0.6,
				hp: 0.8,
				speed: 1.5,
				source: 0.8,
			}}
		/>
	);
}
