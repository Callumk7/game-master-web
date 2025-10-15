import { createFileRoute, Navigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Location } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetLocationLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { CreateLocationLink } from "~/components/locations/create-location-link";
import { LocationImages } from "~/components/locations/location-images";
import { LocationNoteView } from "~/components/locations/location-note-view";
import { NPCView } from "~/components/locations/npc-view";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import {
	useDeleteLocationMutation,
	useLocationSuspenseQuery,
	useUpdateLocationMutation,
} from "~/queries/locations";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useLocationSuspenseQuery(gameId, id);
	const location = data?.data;

	useAddTab({
		data: location,
		entityType: "locations",
		gameId,
	});

	if (!location) {
		return <Navigate to=".." />;
	}

	return <LocationView location={location} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface LocationViewProps {
	location: Location;
	gameId: string;
}

function LocationView({ location, gameId }: LocationViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetLocationLinksQuery({
		path: { game_id: gameId, location_id: location.id },
	});

	const context = Route.useRouteContext();
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

	const handleTogglePin = async () => {
		updateLocation.mutateAsync(
			{
				body: { location: { pinned: !location.pinned } },
				path: { game_id: gameId, id: location.id },
			},
			{
				onSuccess: () => {
					context.queryClient.invalidateQueries({
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
		navigate({ to: "." });
	};

	const badges = (
		<div className="flex flex-wrap gap-2">
			<Badge>{formatType(location.type)}</Badge>
			{location.tags && location.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{location.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</div>
			)}
		</div>
	);

	const contentTab = (
		<EntityEditor
			content={location.content}
			gameId={gameId}
			entityType="location"
			entityId={location.id}
			onSave={handleSave}
		/>
	);

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, location.id, "location"),
		[gameId, location.id],
	);

	const linksTab = (
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

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: contentTab,
		},
		{
			id: "links",
			label: "Links",
			content: linksTab,
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

	const navigate = Route.useNavigate();

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
			onEdit={() => navigate({ to: "edit" })}
			onDelete={handleDelete}
			onTogglePin={handleTogglePin}
		/>
	);
}

const formatType = (type: string) => {
	return type.charAt(0).toUpperCase() + type.slice(1);
};
