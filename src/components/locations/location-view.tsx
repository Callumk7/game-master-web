import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Location } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetLocationLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { CreateLocationLink } from "~/components/locations/create-location-link";
import { LocationImages } from "~/components/locations/location-images";
import { LocationNoteView } from "~/components/locations/location-note-view";
import { NPCView } from "~/components/locations/npc-view";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityView } from "~/components/views/entity-view";
import {
	useDeleteLocationMutation,
	useUpdateLocationMutation,
} from "~/queries/locations";
import { useHandleEditLocation } from "~/state/ui";
import { capitalise } from "~/utils/capitalise";
import { createBadges } from "../utils";
import { SubLocationView } from "./sub-location-view";

interface LocationViewProps {
	gameId: string;
	location: Location;
}

export function LocationView({ gameId, location }: LocationViewProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate({ from: "/games/$gameId/locations/$id" });

	const updateLocation = useUpdateLocationMutation(gameId, location.id);
	const handleTogglePin = async () => {
		updateLocation.mutateAsync(
			{
				body: { location: { pinned: !location.pinned } },
				path: { game_id: gameId, id: location.id },
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const deleteLocation = useDeleteLocationMutation(gameId, location.id);
	const handleDelete = () => {
		deleteLocation.mutate({
			path: { game_id: gameId, id: location.id },
		});
		toast.success("Location deleted successfully!");
		navigate({ to: ".." });
	};

	const handleEdit = useHandleEditLocation(location.id);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: <ContentTab location={location} gameId={gameId} />,
		},
		{
			id: "links",
			label: "Links",
			content: <LinksTab location={location} gameId={gameId} />,
		},
		{
			id: "locations",
			label: "Sub Locations",
			content: <SubLocationView gameId={gameId} locationId={location.id} />,
		},
		{
			id: "notes",
			label: "Notes",
			content: <LocationNoteView gameId={gameId} locationId={location.id} />,
		},
		{
			id: "npcs",
			label: "NPCs",
			content: <NPCView gameId={gameId} locationId={location.id} />,
		},
		{
			id: "images",
			label: "Images",
			content: <LocationImages gameId={gameId} locationId={location.id} />,
		},
	];

	const badges = createBadges(capitalise(location.type), location.tags);

	return (
		<EntityView
			id={location.id}
			gameId={gameId}
			type="location"
			content={location.content}
			content_plain_text={location.content_plain_text}
			name={location.name}
			badges={badges}
			tabs={tabs}
			pinned={location.pinned}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onTogglePin={handleTogglePin}
		/>
	);
}

// =============================================================================
// CONTENT TAB COMPONENT
// =============================================================================
interface ContentTabProps {
	location: Location;
	gameId: string;
}
function ContentTab({ location, gameId }: ContentTabProps) {
	const updateLocation = useUpdateLocationMutation(gameId, location.id);

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateLocation.mutate({
			body: { location: payload },
			path: { game_id: gameId, id: location.id },
		});
	};

	return (
		<EntityEditor
			content={location.content}
			gameId={gameId}
			entityType="location"
			entityId={location.id}
			onSave={handleSave}
		/>
	);
}

// =============================================================================
// LINKS TAB COMPONENT
// =============================================================================
interface LinksTabProps {
	location: Location;
	gameId: string;
}
function LinksTab({ location, gameId }: LinksTabProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetLocationLinksQuery({
		path: { game_id: gameId, location_id: location.id },
	});

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, location.id, "location"),
		[gameId, location.id],
	);

	return (
		<div className="space-y-4">
			<CreateLocationLink gameId={gameId} locationId={location.id} />
			{linksLoading && (
				<div className="text-muted-foreground">Loading links...</div>
			)}
			{linksError && (
				<div className="text-destructive">
					Error loading links: {linksQueryError?.message}
				</div>
			)}
			{!linksLoading && !linksError && linksResponse && (
				<EntityLinksTable
					links={flattenLinksForTable(linksResponse as GenericLinksResponse)}
					columns={columns}
				/>
			)}
		</div>
	);
}
