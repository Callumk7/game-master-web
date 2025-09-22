import { Link as RouterLink } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Faction } from "~/api/types.gen";
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
import { useDeleteFactionMutation } from "~/queries/factions";

export const createColumns = (gameId: string): ColumnDef<Faction>[] => [
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
			const faction = row.original;
			return (
				<Link
					to="/games/$gameId/factions/$id"
					params={{
						gameId: gameId,
						id: faction.id.toString(),
					}}
				>
					{row.getValue("name")}
				</Link>
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
			const faction = row.original;
			const deleteFaction = useDeleteFactionMutation(gameId);

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
											faction.id.toString(),
										);
										toast("Faction ID copied to clipboard!");
									}}
								>
									Copy faction ID
								</DropdownMenuItem>
								<DropdownMenuItem
									render={
										<RouterLink
											to="/games/$gameId/factions/$id"
											params={{
												gameId,
												id: faction.id,
											}}
										/>
									}
								>
									View faction
								</DropdownMenuItem>
								<DropdownMenuItem
									render={
										<RouterLink
											to="/games/$gameId/factions/$id/edit"
											params={{ gameId, id: faction.id }}
										/>
									}
								>
									Edit faction
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={() => {
										deleteFaction.mutate({
											path: { game_id: gameId, id: faction.id },
										});
									}}
								>
									Delete faction
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
			);
		},
	},
];
