import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Character } from "~/api/types.gen";
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

export const createColumns = (gameId: string): ColumnDef<Character>[] => [
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
			const character = row.original;
			return (
				<Link
					to="/games/$gameId/characters/$id"
					params={{
						gameId: gameId,
						id: character.id.toString(),
					}}
				>
					{row.getValue("name")}
				</Link>
			);
		},
	},
	{
		accessorKey: "class",
		header: "Class",
		cell: ({ row }) => <div>{row.getValue("class")}</div>,
	},
	{
		accessorKey: "level",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Level
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => <div className="text-center">{row.getValue("level")}</div>,
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => {
			const description = row.getValue("description") as string;
			return (
				<div className="max-w-[200px] truncate">
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
			const character = row.original;

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
											character.id.toString(),
										)
									}
								>
									Copy character ID
								</DropdownMenuItem>
								<DropdownMenuItem>View character</DropdownMenuItem>
								<DropdownMenuItem>Edit character</DropdownMenuItem>
								<DropdownMenuItem variant="destructive">
									Delete character
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
			);
		},
	},
];
