import { Link as RouterLink } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
import { useDeleteCharacterMutation } from "~/queries/characters";
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
		accessorKey: "content_plain_text",
		header: "Content",
		cell: ({ row }) => {
			const content = row.getValue("content_plain_text") as string;
			return (
				<div className="max-w-xs truncate text-sm text-muted-foreground">
					{content || <span className="italic">No content</span>}
				</div>
			);
		},
	},
	{
		accessorKey: "tags",
		header: "Tags",
		filterFn: (row, columnId, value) => {
			if (!value) return true;
			const tags = row.getValue(columnId) as string[];
			return (
				tags?.some((tag) => tag.toLowerCase().includes(value.toLowerCase())) ??
				false
			);
		},
		cell: ({ row }) => {
			const tags = row.getValue("tags") as string[];
			return (
				<div className="flex flex-wrap gap-1">
					{tags && tags.length > 0 ? (
						tags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
							>
								{tag}
							</span>
						))
					) : (
						<span className="text-muted-foreground italic text-xs">
							No tags
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
			const deleteCharacter = useDeleteCharacterMutation(gameId);

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
										navigator.clipboard.writeText(
											character.id.toString(),
										);
										toast("Character ID copied to clipboard!");
									}}
								>
									Copy character ID
								</DropdownMenuItem>
								<DropdownMenuItem
									render={
										<RouterLink
											to="/games/$gameId/characters/$id"
											params={{
												gameId,
												id: character.id,
											}}
										/>
									}
								>
									View character
								</DropdownMenuItem>
								<DropdownMenuItem
									render={
										<RouterLink
											to="/games/$gameId/characters/$id/edit"
											params={{ gameId, id: character.id }}
										/>
									}
								>
									Edit character
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => {
										deleteCharacter.mutate({
											path: { id: character.id, game_id: gameId },
										});
									}}
								>
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
