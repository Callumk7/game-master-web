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
import { ChevronDown } from "lucide-react";
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
import { EntityLinkButton } from "~/components/ui/EntityLinkButton";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { EntityLink } from "~/utils/linkHelpers";
import { Link } from "./link";

interface EntityLinksTableProps {
	links: EntityLink[];
	gameId: string;
}

export function EntityLinksTable({ links, gameId }: EntityLinksTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [searchQuery, setSearchQuery] = React.useState("");
	const [typeFilter, setTypeFilter] = React.useState<string>("all");

	const columns: ColumnDef<EntityLink>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				const type = row.original.type;
				const id = row.original.id;
				return (
					<Link
						to={`/games/${gameId}/${type}s/${id}` as string}
						className="font-medium hover:underline"
					>
						{row.getValue("name")}
					</Link>
				);
			},
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{row.getValue("type")}
				</Badge>
			),
		},
		{
			accessorKey: "description_meta",
			header: "Description",
			cell: ({ row }) => {
				return <div className="text-sm">{row.getValue("description_meta")}</div>;
			},
		},
		{
			accessorKey: "relationship_type",
			header: "Relationship",
			cell: ({ row }) => {
				return <div className="text-sm">{row.getValue("relationship_type")}</div>;
			},
		},
		{
			accessorKey: "is_active",
			header: "Active",
			cell: ({ row }) => {
				return (
					<div className="text-sm">
						{row.getValue("is_active") ? "Yes" : "No"}
					</div>
				);
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				return <EntityLinkButton entity={row.original} />;
			},
		},
	];

	const table = useReactTable({
		data: links,
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
		initialState: {
			pagination: {
				pageSize: 5,
			},
		},
	});

	const uniqueTypes = React.useMemo(() => {
		const types = [...new Set(links.map((link) => link.type))];
		return types.sort();
	}, [links]);

	React.useEffect(() => {
		table.getColumn("name")?.setFilterValue(searchQuery);
	}, [searchQuery, table]);

	React.useEffect(() => {
		table.getColumn("type")?.setFilterValue(typeFilter === "all" ? "" : typeFilter);
	}, [typeFilter, table]);

	return (
		<div className="w-full">
			<div className="flex items-center gap-4 py-4">
				<Input
					placeholder="Filter links..."
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
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
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
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
									No links found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} link(s) total.
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
