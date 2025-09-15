import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Location } from "~/api/types.gen";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "../ui/link";

export const createColumns = (gameId: string): ColumnDef<Location>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const location = row.original;
			return (
				<Link
					to="/games/$gameId/locations/$id"
					params={{
						gameId: gameId,
						id: location.id.toString(),
					}}
				>
					{row.getValue("name")}
				</Link>
			);
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return <div className="capitalize">{type}</div>;
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => {
			const description = row.getValue("description") as string;
			return (
				<div className="max-w-[250px] truncate">
					{description || (
						<span className="text-muted-foreground italic">
							No description
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Created
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const date = row.getValue("created_at") as string;
			return date ? (
				<div className="text-sm">{new Date(date).toLocaleDateString()}</div>
			) : (
				<span className="text-muted-foreground">-</span>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const location = row.original;

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
									onClick={() =>
										navigator.clipboard.writeText(
											location.id.toString(),
										)
									}
								>
									Copy location ID
								</DropdownMenuItem>
								<DropdownMenuItem>View location</DropdownMenuItem>
								<DropdownMenuItem>Edit location</DropdownMenuItem>
								<DropdownMenuItem variant="destructive">
									Delete location
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
			);
		},
	},
];
