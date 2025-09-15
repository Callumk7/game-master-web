import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import {
	deleteLocationMutation,
	getLocationLinksOptions,
	listLocationsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { Location } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateLocationLink } from "./CreateLocationLink";

interface LocationDetailProps {
	location: Location;
	gameId: string;
}

export function LocationDetail({ location, gameId }: LocationDetailProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString();
	};

	const formatType = (type: string) => {
		return type.charAt(0).toUpperCase() + type.slice(1);
	};

	const context = useRouteContext({ from: "/_auth/games/$gameId/locations/$id/" });

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useQuery(
		getLocationLinksOptions({
			path: { game_id: gameId, location_id: location.id },
		}),
	);

	const badges = <Badge variant="secondary">{formatType(location.type)}</Badge>;

	const fields = [
		{ label: "Name", value: location.name },
		{ label: "Type", value: formatType(location.type) },
		{ label: "ID", value: <span className="font-mono">#{location.id}</span> },
		{ label: "Created", value: formatDate(location.created_at) },
		...(location.parent_id
			? [
					{
						label: "Parent Location",
						value: <span className="font-mono">#{location.parent_id}</span>,
					},
				]
			: []),
	];

	const navigate = useNavigate();

	const deleteLocation = useMutation({
		...deleteLocationMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	const onDelete = () => {
		deleteLocation.mutate({
			path: { game_id: gameId, id: location.id },
		});
	};

	return (
		<div className="space-y-6">
			<DetailTemplate
				title={location.name}
				icon={MapPin}
				iconColor="text-blue-600"
				badges={badges}
				editPath="/games/$gameId/locations/$id/edit"
				gameId={gameId}
				entityId={location.id.toString()}
				fields={fields}
				onDelete={onDelete}
				content={
					location.description
						? {
								title: "Description",
								value: location.description,
							}
						: undefined
				}
			/>
			<CreateLocationLink gameId={gameId} locationId={location.id.toString()} />
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Links</h2>
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
						links={flattenLinksForTable(
							linksResponse as GenericLinksResponse,
						)}
						gameId={gameId}
					/>
				)}
			</div>
		</div>
	);
}
