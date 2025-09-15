import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Quest } from "~/api/types.gen";
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

export const createColumns = (gameId: string): ColumnDef<Quest>[] => [
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
			const quest = row.original;
			return (
				<Link
					to="/games/$gameId/quests/$id"
					params={{
						gameId: gameId,
						id: quest.id.toString(),
					}}
				>
					{row.getValue("name")}
				</Link>
			);
		},
	},
	{
		accessorKey: "content",
		header: "Content",
		cell: ({ row }) => {
			const content = row.getValue("content") as string;
			return (
				<div className="max-w-[300px] truncate">
					{content || (
						<span className="text-muted-foreground italic">No content</span>
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
			const quest = row.original;

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
										navigator.clipboard.writeText(quest.id.toString())
									}
								>
									Copy quest ID
								</DropdownMenuItem>
								<DropdownMenuItem>View quest</DropdownMenuItem>
								<DropdownMenuItem>Edit quest</DropdownMenuItem>
								<DropdownMenuItem variant="destructive">
									Delete quest
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
			);
		},
	},
];
