import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { EntityType } from "~/types";
import { Link } from "./ui/link";

// Combined entity type that includes all possible entity properties
export type AllEntity = {
	id: string;
	name: string;
	type: EntityType;
	content?: string;
	content_plain_text?: string;
	tags?: string[];
	created_at?: string;
	updated_at?: string;
	// Character specific
	class?: string;
	level?: number;
	faction_role?: string;
	// Quest specific
	parent_id?: string;
};

interface AllEntitiesTableProps {
	entities: AllEntity[];
	gameId: string;
}

export function AllEntitiesTable({ entities, gameId }: AllEntitiesTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [searchQuery, setSearchQuery] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState<string>("all");
	const [tagFilter, setTagFilter] = React.useState("");

	const PAGINATION_SIZE = 15;

	const columns: ColumnDef<AllEntity>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Name
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const type = row.original.type;
				const id = row.original.id;
				return (
					<Link
						to={`/games/${gameId}/${type}s/${id}` as string}
						className="font-medium hover:underline truncate block"
					>
						{row.getValue("name")}
					</Link>
				);
			},
			size: 200,
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{row.getValue("type")}
				</Badge>
			),
			size: 100,
		},
		{
			accessorKey: "content_plain_text",
			header: "Description",
			cell: ({ row }) => {
				const description = row.getValue("content_plain_text") as string;
				return (
					<div className="text-sm max-w-md truncate">
						{description || "No description"}
					</div>
				);
			},
			size: 300,
		},
		{
			accessorKey: "tags",
			header: "Tags",
			filterFn: (row, columnId, value) => {
				const itemValue = row.getValue(columnId) as string | string[];
				if (Array.isArray(itemValue)) {
					return itemValue.some((tag) =>
						tag.toLowerCase().includes(value.toLowerCase()),
					);
				}
				return itemValue?.toLowerCase().includes(value.toLowerCase()) ?? false;
			},
			cell: ({ row }) => {
				const tags = row.getValue("tags") as string[] | undefined;
				if (!tags || tags.length === 0) {
					return <div className="text-sm text-muted-foreground">-</div>;
				}
				return (
					<div className="flex flex-wrap gap-1">
						{tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))}
						{tags.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{tags.length - 3}
							</Badge>
						)}
					</div>
				);
			},
			size: 150,
		},
		{
			accessorKey: "updated_at",
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
					>
						Last Updated
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const date = row.getValue("updated_at") as string | undefined;
				if (!date) return <div className="text-sm text-muted-foreground">-</div>;
				return (
					<div className="text-sm">{new Date(date).toLocaleDateString()}</div>
				);
			},
			size: 120,
		},
	];

	const table = useReactTable({
		data: entities,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
		filterFns: {
			fuzzy: (row, columnId, value) => {
				const itemValue = row.getValue(columnId) as string | string[];
				if (Array.isArray(itemValue)) {
					return itemValue.some((tag) =>
						tag.toLowerCase().includes(value.toLowerCase()),
					);
				}
				return itemValue?.toLowerCase().includes(value.toLowerCase()) ?? false;
			},
		},
		initialState: {
			pagination: {
				pageSize: PAGINATION_SIZE,
			},
		},
	});

	const uniqueTypes = React.useMemo(() => {
		const types = [...new Set(entities.map((entity) => entity.type))];
		return types.sort();
	}, [entities]);

	React.useEffect(() => {
		table.getColumn("name")?.setFilterValue(searchQuery);
	}, [searchQuery, table]);

	React.useEffect(() => {
		table.getColumn("type")?.setFilterValue(typeFilter === "all" ? "" : typeFilter);
	}, [typeFilter, table]);

	React.useEffect(() => {
		table.getColumn("tags")?.setFilterValue(tagFilter);
	}, [tagFilter, table]);

	return (
		<div className="w-full max-w-full">
			<div className="flex items-center gap-4 py-4">
				<Input
					placeholder="Search entities..."
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					className="max-w-sm"
				/>
				<Input
					placeholder="Filter tags..."
					value={tagFilter}
					onChange={(event) => setTagFilter(event.target.value)}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline">
								Type: {typeFilter === "all" ? "All" : typeFilter}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						}
					></DropdownMenuTrigger>
					<DropdownMenuPortal>
						<DropdownMenuPositioner>
							<DropdownMenuContent>
								<DropdownMenuCheckboxItem
									checked={typeFilter === "all"}
									onCheckedChange={() => setTypeFilter("all")}
								>
									All Types
								</DropdownMenuCheckboxItem>
								{uniqueTypes.map((type) => (
									<DropdownMenuCheckboxItem
										key={type}
										checked={typeFilter === type}
										onCheckedChange={() => setTypeFilter(type)}
										className="capitalize"
									>
										{type}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" className="ml-auto">
								Columns <ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						}
					></DropdownMenuTrigger>
					<DropdownMenuPortal>
						<DropdownMenuPositioner>
							<DropdownMenuContent>
								{table
									.getAllColumns()
									.filter((column) => column.getCanHide())
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) =>
													column.toggleVisibility(!!value)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
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
										No entities found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} of {entities.length}{" "}
					entity(s) total.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
