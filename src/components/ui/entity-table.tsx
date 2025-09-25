import { Link as RouterLink } from "@tanstack/react-router";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Link } from "~/components/ui/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

// ============================================================================
// REUSABLE CELL COMPONENTS
// ============================================================================

interface SortableHeaderProps {
	column: any;
	children: React.ReactNode;
}

export function SortableHeader({ column, children }: SortableHeaderProps) {
	return (
		<Button
			variant="ghost"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{children}
			<ArrowUpDown className="ml-2 h-4 w-4" />
		</Button>
	);
}

interface EntityLinkProps {
	entityType: string;
	gameId: string;
	entityId: string | number;
	name: string;
	className?: string;
}

export function EntityLink({
	entityType,
	gameId,
	entityId,
	name,
	className = "font-medium hover:underline truncate block",
}: EntityLinkProps) {
	return (
		<Link
			to={`/games/${gameId}/${entityType}s/${entityId}` as string}
			className={className}
		>
			{name}
		</Link>
	);
}

interface TagsDisplayProps {
	tags?: string[];
	maxVisible?: number;
}

export function TagsDisplay({ tags, maxVisible = 3 }: TagsDisplayProps) {
	if (!tags || tags.length === 0) {
		return <div className="text-sm text-muted-foreground">-</div>;
	}

	const visibleTags = tags.slice(0, maxVisible);
	const remainingCount = tags.length - maxVisible;

	return (
		<div className="flex flex-wrap gap-1">
			{visibleTags.map((tag) => (
				<Badge key={tag} variant="outline" className="text-xs">
					{tag}
				</Badge>
			))}
			{remainingCount > 0 && (
				<Badge variant="outline" className="text-xs">
					+{remainingCount}
				</Badge>
			)}
		</div>
	);
}

interface DateDisplayProps {
	date?: string;
	className?: string;
}

export function DateDisplay({ date, className = "text-sm" }: DateDisplayProps) {
	if (!date) {
		return <span className="text-muted-foreground">-</span>;
	}

	return <div className={className}>{new Date(date).toLocaleDateString()}</div>;
}

interface ContentDisplayProps {
	content?: string;
	maxWidth?: string;
	placeholder?: string;
}

export function ContentDisplay({
	content,
	maxWidth = "max-w-[300px]",
	placeholder = "No content",
}: ContentDisplayProps) {
	return (
		<div className={`${maxWidth} truncate text-sm`}>
			{content || (
				<span className="text-muted-foreground italic">{placeholder}</span>
			)}
		</div>
	);
}

interface ActionsDropdownProps {
	entityType: string;
	entityName: string;
	entity: { id: string | number };
	gameId: string;
	onDelete?: () => void;
	showDelete?: boolean;
}

export function ActionsDropdown({
	entityType,
	entityName,
	entity,
	gameId,
	onDelete,
	showDelete = true,
}: ActionsDropdownProps) {
	const capitalizedType = entityType.charAt(0).toUpperCase() + entityType.slice(1);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuPositioner>
					<DropdownMenuContent>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(entity.id.toString());
								toast(`${capitalizedType} ID copied to clipboard!`);
							}}
						>
							Copy {entityName} ID
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<RouterLink
									to={
										`/games/${gameId}/${entityType}s/${entity.id}` as string
									}
								/>
							}
						>
							View {entityName}
						</DropdownMenuItem>
						<DropdownMenuItem
							render={
								<RouterLink
									to={
										`/games/${gameId}/${entityType}s/${entity.id}/edit` as string
									}
								/>
							}
						>
							Edit {entityName}
						</DropdownMenuItem>
						{showDelete && (
							<DropdownMenuItem variant="destructive" onClick={onDelete}>
								Delete {entityName}
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenuPositioner>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}

// ============================================================================
// ENTITY TABLE COMPONENT
// ============================================================================

interface EntityTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	entityName?: string; // e.g., "character", "faction", "quest"
	searchPlaceholder?: string;
	tagPlaceholder?: string;
	paginationSize?: number;
	enableColumnVisibility?: boolean;
}

export function EntityTable<TData, TValue>({
	columns,
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	entityName = "entity",
	searchPlaceholder = "Filter names...",
	tagPlaceholder = "Filter tags...",
	paginationSize = 10,
	enableColumnVisibility = true,
}: EntityTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
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
					return itemValue.some((item) =>
						item.toLowerCase().includes(value.toLowerCase()),
					);
				}
				return itemValue?.toLowerCase().includes(value.toLowerCase()) ?? false;
			},
		},
		initialState: {
			pagination: {
				pageSize: paginationSize,
			},
		},
	});

	React.useEffect(() => {
		table.getColumn("name")?.setFilterValue(searchQuery);
	}, [searchQuery, table]);

	React.useEffect(() => {
		const column = table.getColumn("tags");
		if (column) {
			column.setFilterValue(tagFilter);
		}
	}, [tagFilter, table]);

	return (
		<div className="w-full max-w-full">
			<div className="flex items-center gap-4 py-4">
				<Input
					placeholder={searchPlaceholder}
					value={searchQuery}
					onChange={(event) => onSearchChange(event.target.value)}
					className="max-w-sm"
				/>
				<Input
					placeholder={tagPlaceholder}
					value={tagFilter}
					onChange={(event) => onTagFilterChange(event.target.value)}
					className="max-w-sm"
				/>
				{enableColumnVisibility && (
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
				)}
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
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} of {data.length}{" "}
					{entityName}(s) total.
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
