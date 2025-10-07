import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Location } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetLocationLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateLocationLink } from "~/components/locations/create-location-link";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { useLocationSuspenseQuery, useUpdateLocationMutation } from "~/queries/locations";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

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
			isSaving={updateLocation.isPending}
		/>
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
					gameId={gameId}
					sourceId={location.id}
					sourceType="location"
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
			content: <div>Notes tabs tbc</div>,
		},
		{
			id: "npcs",
			label: "NPCs",
			content: <div>NPCs tabs tbc</div>,
		},
	];

	const navigate = Route.useNavigate();

	return (
		<EntityView
			id={location.id}
			type="location"
			content={location.content}
			content_plain_text={location.content_plain_text}
			name={location.name}
			badges={badges}
			tabs={tabs}
			onEdit={() => navigate({ to: "edit" })}
			onTogglePin={handleTogglePin}
		/>
	);
}

const formatType = (type: string) => {
	return type.charAt(0).toUpperCase() + type.slice(1);
};
