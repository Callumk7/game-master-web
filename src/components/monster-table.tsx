import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { MonsterDetailSheet } from "~/components/monster-detail-sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Sheet, SheetTrigger } from "~/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { Monster } from "~/types/monsters";
import { tableFilterFns } from "~/utils/table-filters";

interface MonsterTableProps {
	monsters: Monster[];
}

// Parse CR value for sorting (handles fractions like "1/8", "1/4", etc.)
const parseCR = (cr: string | { cr: string }): number => {
	const crString = typeof cr === "string" ? cr : cr.cr;
	const fractionMatch = crString.match(/^(\d+)\/(\d+)$/);
	if (fractionMatch) {
		const [, numerator, denominator] = fractionMatch;
		return Number(numerator) / Number(denominator);
	}
	return Number(crString);
};

export function MonsterTable({ monsters }: MonsterTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [nameFilter, setNameFilter] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState("");

	// Get unique monster types for the filter dropdown
	const uniqueTypes = React.useMemo(() => {
		const types = new Set<string>();
		for (const monster of monsters) {
			const type =
				typeof monster.type === "string" ? monster.type : monster.type.type;
			types.add(type);
		}
		return Array.from(types).sort();
	}, [monsters]);

	// Column definitions
	const columns: ColumnDef<Monster>[] = [
		{
			accessorKey: "name",
			filterFn: "fuzzy",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
						className="h-auto p-0 font-semibold hover:bg-transparent"
					>
						Name
						{column.getIsSorted() === "asc" && (
							<ChevronUp className="ml-1 h-4 w-4" />
						)}
						{column.getIsSorted() === "desc" && (
							<ChevronDown className="ml-1 h-4 w-4" />
						)}
					</Button>
				);
			},
			cell: ({ row }) => {
				const monster = row.original;
				return (
					<Sheet>
						<SheetTrigger
							render={
								<Button
									variant="link"
									className="p-0 h-auto font-medium text-left justify-start"
								>
									{monster.name}
								</Button>
							}
						/>
						<MonsterDetailSheet monster={monster} />
					</Sheet>
				);
			},
		},
		{
			accessorKey: "size",
			header: "Size",
			cell: ({ row }) => {
				const monster = row.original;
				return (
					<div className="flex flex-wrap gap-1">
						{monster.size.map((size) => (
							<Badge key={size} variant="outline" className="text-xs">
								{size}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			accessorKey: "type",
			filterFn: "fuzzy",
			accessorFn: (row) =>
				typeof row.type === "string" ? row.type : row.type.type,
			header: "Type",
			cell: ({ row }) => {
				const monster = row.original;
				const typeValue =
					typeof monster.type === "string" ? monster.type : monster.type.type;
				return <span className="capitalize">{typeValue}</span>;
			},
		},
		{
			accessorKey: "alignment",
			header: "Alignment",
			cell: ({ row }) => {
				const monster = row.original;
				return (
					<div className="flex flex-wrap gap-1">
						{monster.alignment.map((alignment, index) => {
							const alignmentValue =
								typeof alignment === "string"
									? alignment
									: alignment.alignment;
							const key =
								typeof alignment === "string"
									? alignment
									: `${alignment.alignment}-${index}`;
							return (
								<Badge key={key} variant="outline" className="text-xs">
									{alignmentValue}
								</Badge>
							);
						})}
					</div>
				);
			},
		},
		{
			accessorKey: "ac",
			header: "AC",
			cell: ({ row }) => {
				const monster = row.original;
				return monster.ac
					.map((ac) => (typeof ac === "number" ? ac : ac.ac))
					.join(" or ");
			},
		},
		{
			accessorKey: "hp",
			header: "HP",
			cell: ({ row }) => row.original.hp.average,
		},
		{
			accessorKey: "cr",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
						className="h-auto p-0 font-semibold hover:bg-transparent"
					>
						CR
						{column.getIsSorted() === "asc" && (
							<ChevronUp className="ml-1 h-4 w-4" />
						)}
						{column.getIsSorted() === "desc" && (
							<ChevronDown className="ml-1 h-4 w-4" />
						)}
					</Button>
				);
			},
			sortingFn: (rowA, rowB) => {
				const a = parseCR(rowA.original.cr);
				const b = parseCR(rowB.original.cr);
				return a - b;
			},
			cell: ({ row }) => {
				const monster = row.original;
				return typeof monster.cr === "string" ? monster.cr : monster.cr.cr;
			},
		},
	];

	// Table configuration
	const table = useReactTable({
		data: monsters,
		columns,
		filterFns: tableFilterFns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
			columnFilters: [
				{
					id: "name",
					value: nameFilter,
				},
				{
					id: "type",
					value: typeFilter,
				},
			],
		},
	});

	return (
		<div className="w-full max-w-full">
			<div className="flex items-center gap-4 py-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="name-filter">Filter by Name</Label>
					<Input
						id="name-filter"
						placeholder="Search monsters..."
						value={nameFilter}
						onChange={(e) => setNameFilter(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="type-filter">Filter by Type</Label>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="max-w-sm">
							<SelectValue placeholder="All types" />
						</SelectTrigger>
						<SelectPositioner>
							<SelectContent>
								<SelectItem value="">All types</SelectItem>
								{uniqueTypes.map((type) => (
									<SelectItem key={type} value={type}>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</SelectPositioner>
					</Select>
				</div>
			</div>
			<div className="overflow-hidden rounded-md border">
				<div className="overflow-x-auto">
					<Table className="table-fixed w-full">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef
																.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} monster(s) total.
				</div>
			</div>
		</div>
	);
}
