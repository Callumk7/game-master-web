import { Link as RouterLink } from "@tanstack/react-router";
import {
	type Column,
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
	Select,
	SelectContent,
	SelectItem,
	SelectPortal,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	calculateColumnWidths,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { Status } from "~/types";
import { tableFilterFns } from "~/utils/table-filters";

// ============================================================================
// FILTER CONFIGURATION TYPES
// ============================================================================

interface FilterOption {
	value: string;
	label: string;
}

export interface FilterConfig {
	type: "text" | "select" | "multiselect";
	columnId: string;
	placeholder?: string;
	options?: FilterOption[];
}

// ============================================================================
// REUSABLE CELL COMPONENTS
// ============================================================================

interface SortableHeaderProps<TData, TValue> {
	column: Column<TData, TValue>;
	children: React.ReactNode;
}

export function SortableHeader<TData, TValue>({
	column,
	children,
}: SortableHeaderProps<TData, TValue>) {
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

interface StatusDisplayProps {
	status: Status;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
	const variant =
		status === "cancelled"
			? "destructive"
			: status === "completed"
				? "success"
				: status === "ready"
					? "ready"
					: status === "active"
						? "warning"
						: "outline";

	return (
		<Badge variant={variant} className="text-xs">
			{status}
		</Badge>
	);
}

interface DateDisplayProps {
	date?: string;
	className?: string;
}

export function DateDisplay({ date, className = "text-xs" }: DateDisplayProps) {
	if (!date) {
		return <span className="text-muted-foreground text-xs">-</span>;
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
	onEdit?: () => void;
	showDelete?: boolean;
}

export function ActionsDropdown({
	entityType,
	entityName,
	entity,
	gameId,
	onDelete,
	onEdit,
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
						<DropdownMenuItem onClick={onEdit}>
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
	entityName?: string; // e.g., "character", "faction", "quest"
	searchPlaceholder?: string; // @deprecated: use filters config instead
	tagPlaceholder?: string; // @deprecated: use filters config instead
	filters?: FilterConfig[]; // New dynamic filter configuration
	enableColumnVisibility?: boolean;
	enablePaginationSizeSelector?: boolean;
	columnRelativeWidths?: Record<string, number>; // e.g., { "name": 2, "status": 1, "actions": 0.5 }
	defaultHidden?: string[];
}

export function EntityTable<TData, TValue>({
	columns,
	data,
	entityName = "entity",
	searchPlaceholder = "Filter names...",
	tagPlaceholder = "Filter tags...",
	filters,
	enableColumnVisibility = true,
	enablePaginationSizeSelector = true,
	columnRelativeWidths,
	defaultHidden,
}: EntityTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
		...defaultHidden?.reduce<Record<string, boolean>>((acc, key) => {
			acc[key] = false;
			return acc;
		}, {}),
	});

	// Dynamic filter state management
	const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});

	// Backward compatibility for legacy props
	const [searchQuery, setSearchQuery] = React.useState("");
	const [tagFilter, setTagFilter] = React.useState("");
	const [paginationSize, setPaginationSize] = React.useState(20);

	// Determine effective filters (new system or legacy)
	const effectiveFilters = React.useMemo(() => {
		if (filters && filters.length > 0) {
			return filters;
		}
		// Fallback to legacy system
		return [
			{ type: "text" as const, columnId: "name", placeholder: searchPlaceholder },
			{ type: "text" as const, columnId: "tags", placeholder: tagPlaceholder },
		];
	}, [filters, searchPlaceholder, tagPlaceholder]);

	// Calculate percentage widths from relative widths
	const columnWidths = React.useMemo(() => {
		if (!columnRelativeWidths) return {};
		const allColumnIds = columns.map((col) => {
			if (col.id) return col.id;
			if ("accessorKey" in col && typeof col.accessorKey === "string")
				return col.accessorKey;
			return "";
		});
		return calculateColumnWidths(columnRelativeWidths, allColumnIds);
	}, [columnRelativeWidths, columns]);

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
		filterFns: tableFilterFns,
		initialState: {
			pagination: {
				pageSize: paginationSize,
			},
		},
	});

	// Apply dynamic filters
	React.useEffect(() => {
		effectiveFilters.forEach((filter) => {
			const column = table.getColumn(filter.columnId);
			if (column) {
				const value = filters
					? filterValues[filter.columnId]
					: filter.columnId === "name"
						? searchQuery
						: filter.columnId === "tags"
							? tagFilter
							: "";
				column.setFilterValue(value || undefined);
			}
		});
	}, [effectiveFilters, filterValues, searchQuery, tagFilter, table, filters]);

	React.useEffect(() => {
		table.setPageSize(paginationSize);
	}, [paginationSize, table]);

	// Helper function to render different filter types
	const renderFilter = (filter: FilterConfig) => {
		const value = filters
			? filterValues[filter.columnId] || ""
			: filter.columnId === "name"
				? searchQuery
				: filter.columnId === "tags"
					? tagFilter
					: "";

		const handleChange = (newValue: string) => {
			if (filters) {
				setFilterValues((prev) => ({ ...prev, [filter.columnId]: newValue }));
			} else {
				// Legacy mode
				if (filter.columnId === "name") {
					setSearchQuery(newValue);
				} else if (filter.columnId === "tags") {
					setTagFilter(newValue);
				}
			}
		};

		switch (filter.type) {
			case "text":
				return (
					<Input
						key={filter.columnId}
						placeholder={filter.placeholder || `Filter ${filter.columnId}...`}
						value={value}
						onChange={(event) => handleChange(event.target.value)}
						className="max-w-sm"
					/>
				);

			case "select":
				return (
					<Select
						key={filter.columnId}
						value={value}
						onValueChange={handleChange}
					>
						<SelectTrigger className="max-w-sm">
							<SelectValue
								placeholder={
									filter.placeholder || `Select ${filter.columnId}...`
								}
							/>
						</SelectTrigger>
						<SelectPortal>
							<SelectPositioner>
								<SelectContent>
									<SelectItem value="">
										{filter.placeholder || `All ${filter.columnId}s`}
									</SelectItem>
									{filter.options?.map((option) => (
										<SelectItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</SelectPositioner>
						</SelectPortal>
					</Select>
				);

			case "multiselect":
				// For now, treat as text - can be enhanced later
				return (
					<Input
						key={filter.columnId}
						placeholder={filter.placeholder || `Filter ${filter.columnId}...`}
						value={value}
						onChange={(event) => handleChange(event.target.value)}
						className="max-w-sm"
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full max-w-full">
			<div className="flex items-center gap-4 py-4">
				{effectiveFilters.map(renderFilter)}
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
											<TableHead
												key={header.id}
												style={{
													width: columnWidths[header.id],
												}}
											>
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
					{table.getFilteredRowModel().rows.length} {entityName}(s) total.
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8">
					{enablePaginationSizeSelector && setPaginationSize && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								Rows per page:
							</span>
							<Select
								value={paginationSize}
								onValueChange={(value) =>
									setPaginationSize(value as number)
								}
							>
								<SelectTrigger size="sm" className="w-fit">
									<SelectValue />
								</SelectTrigger>
								<SelectPortal>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value={5}>5</SelectItem>
											<SelectItem value={10}>10</SelectItem>
											<SelectItem value={20}>20</SelectItem>
											<SelectItem value={50}>50</SelectItem>
											<SelectItem value={100}>100</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</SelectPortal>
							</Select>
						</div>
					)}
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>
							{"<<"}
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>
							{"<"}
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>
							{">"}
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>
							{">>"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
