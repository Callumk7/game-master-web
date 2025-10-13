import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import type { EntityType } from "~/types";
import { DeleteLink } from "../links/delete-link";
import { TagsDisplay } from "../ui/composite/entity-table";
import { Link } from "../ui/link";
import { EntityLinkButton } from "./entity-link-button";
import type { EntityLink } from "./types";
import { UpdateLinkDialog } from "./update-link-dialog";

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
			accessorKey: "tags",
			header: "Tags",
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
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
		{
			id: "edit",
			enableHiding: false,
			cell: ({ row }) => {
				return (
					<UpdateLinkDialog
						link={row.original}
						gameId={gameId}
						sourceId={sourceId}
						sourceType={sourceType}
					/>
				);
			},
		},
		{
			id: "delete",
			enableHiding: false,
			cell: ({ row }) => {
				return (
					<DeleteLink
						gameId={gameId}
						sourceId={sourceId}
						sourceType={sourceType}
						targetId={row.original.id}
						targetType={row.getValue("type")}
					/>
				);
			},
		},
	];
}
