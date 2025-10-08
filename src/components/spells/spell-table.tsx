import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityTable, SortableHeader } from "~/components/ui/entity-table";
import type { Spell } from "~/types/spell";
import {
	getSpellCastingTime,
	getSpellComponents,
	getSpellDuration,
	getSpellLevel,
	getSpellRange,
	getSpellSchool,
	getUniqueSchools,
	getUniqueLevels,
	isRitual,
	matchesLevelFilter,
	matchesSchoolFilter,
	matchesSearchQuery,
} from "~/utils/spell-utils";
import { SpellDetailSheet } from "./spell-detail-sheet";

interface SpellTableProps {
	data: Spell[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	schoolFilter: string;
	onSchoolFilterChange: (school: string) => void;
	levelFilter: string;
	onLevelFilterChange: (level: string) => void;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
}

function createSpellColumns(): ColumnDef<Spell>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			minSize: 200,
			cell: ({ row }) => {
				const spell = row.original;
				return (
					<SpellDetailSheet spell={spell}>
						<Button
							variant="link"
							className="p-0 h-auto font-medium text-left justify-start whitespace-pre-wrap"
						>
							{row.getValue("name")}
							{isRitual(spell) && (
								<Badge variant="outline" className="ml-2 text-xs">
									Ritual
								</Badge>
							)}
						</Button>
					</SpellDetailSheet>
				);
			},
		},
		{
			accessorKey: "level",
			header: ({ column }) => (
				<SortableHeader column={column}>Level</SortableHeader>
			),
			maxSize: 100,
			cell: ({ row }) => {
				const spell = row.original;
				const level = getSpellLevel(spell);
				return (
					<Badge variant="secondary" className="text-xs">
						{level}
					</Badge>
				);
			},
		},
		{
			accessorKey: "school",
			header: "School",
			maxSize: 120,
			cell: ({ row }) => {
				const spell = row.original;
				const school = getSpellSchool(spell);
				return (
					<Badge variant="outline" className="text-xs">
						{school}
					</Badge>
				);
			},
		},
		{
			accessorKey: "time",
			header: "Casting Time",
			maxSize: 120,
			cell: ({ row }) => {
				const spell = row.original;
				const castingTime = getSpellCastingTime(spell);
				return <div className="text-sm">{castingTime}</div>;
			},
		},
		{
			accessorKey: "range",
			header: "Range",
			maxSize: 100,
			cell: ({ row }) => {
				const spell = row.original;
				const range = getSpellRange(spell);
				return <div className="text-sm">{range}</div>;
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

export function SpellTable({
	data,
	searchQuery,
	onSearchChange,
	schoolFilter,
	onSchoolFilterChange,
	levelFilter,
	onLevelFilterChange,
	paginationSize = 25,
	onPaginationSizeChange,
}: SpellTableProps) {
	const columns = createSpellColumns();

	// Filter data based on search, school, and level filters
	const filteredData = React.useMemo(() => {
		let filtered = data;

		if (searchQuery) {
			filtered = filtered.filter((spell) => matchesSearchQuery(spell, searchQuery));
		}

		if (schoolFilter) {
			filtered = filtered.filter((spell) =>
				matchesSchoolFilter(spell, schoolFilter),
			);
		}

		if (levelFilter) {
			filtered = filtered.filter((spell) => matchesLevelFilter(spell, levelFilter));
		}

		return filtered;
	}, [data, searchQuery, schoolFilter, levelFilter]);

	// Get unique options for filters
	const uniqueSchools = React.useMemo(() => getUniqueSchools(data), [data]);
	const uniqueLevels = React.useMemo(() => getUniqueLevels(data), [data]);

	return (
		<div className="space-y-4">
			{/* Custom filters for spells */}
			<div className="flex gap-4">
				<div className="flex-1">
					<input
						type="text"
						placeholder="Search spells..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
					/>
				</div>
				<select
					value={schoolFilter}
					onChange={(e) => onSchoolFilterChange(e.target.value)}
					className="px-3 py-2 border border-gray-300 rounded-md text-sm"
				>
					<option value="">All Schools</option>
					{uniqueSchools.map((school) => (
						<option key={school} value={school}>
							{school}
						</option>
					))}
				</select>
				<select
					value={levelFilter}
					onChange={(e) => onLevelFilterChange(e.target.value)}
					className="px-3 py-2 border border-gray-300 rounded-md text-sm"
				>
					<option value="">All Levels</option>
					{uniqueLevels.map((level) => (
						<option key={level} value={level}>
							{level}
						</option>
					))}
				</select>
			</div>

			<EntityTable
				columns={columns}
				data={filteredData}
				searchQuery=""
				onSearchChange={() => {}}
				tagFilter=""
				onTagFilterChange={() => {}}
				entityName="spell"
				searchPlaceholder=""
				tagPlaceholder=""
				paginationSize={paginationSize}
				onPaginationSizeChange={onPaginationSizeChange}
				enableColumnVisibility={true}
				enablePaginationSizeSelector={true}
				columnRelativeWidths={{
					name: 2.5,
					level: 0.8,
					school: 1,
					time: 1,
					range: 0.8,
					components: 1.2,
					duration: 1.2,
					source: 0.6,
				}}
			/>
		</div>
	);
}
