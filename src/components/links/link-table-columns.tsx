import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { EntityType } from "~/types";
import { TagsDisplay } from "../ui/composite/entity-table";
import { Link } from "../ui/link";
import { EntityLinkButton } from "./entity-link-button";
import { EntityLinkControls } from "./entity-link-controls";
import type { EntityLink } from "./types";

// This is the base set of columns used for quests, locations, and notes
export function createBaseLinkTableColumns<T extends EntityLink>(
	gameId: string,
	sourceId: string,
	sourceType: EntityType,
): ColumnDef<T>[] {
	return [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				const type = row.original.type;
				const id = row.original.id;
				return (
					<div>
						<EntityLinkButton entity={row.original} />
						<Link
							to={`/games/${gameId}/${type}s/${id}` as string}
							className="font-medium hover:underline"
						>
							{row.getValue("name")}
						</Link>
					</div>
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
			accessorKey: "tags",
			header: "Tags",
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
		},
		{
			accessorKey: "relationship_type",
			header: "Relationship",
			cell: ({ row }) => {
				return <div className="text-sm">{row.getValue("relationship_type")}</div>;
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				return (
					<EntityLinkControls
						gameId={gameId}
						sourceId={sourceId}
						sourceType={sourceType}
						link={row.original}
					/>
				);
			},
		},
	];
}
