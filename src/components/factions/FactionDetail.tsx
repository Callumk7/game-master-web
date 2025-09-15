import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import {
	deleteFactionMutation,
	getFactionLinksOptions,
	listFactionsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { Faction } from "~/api/types.gen";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { FactionLinkForm } from "../links/usage-examples";

interface FactionDetailProps {
	faction: Faction;
	gameId: string;
}

export function FactionDetail({ faction, gameId }: FactionDetailProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString();
	};

	const context = useRouteContext({ from: "/_auth/games/$gameId/factions/$id" });

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useQuery(
		getFactionLinksOptions({
			path: { game_id: gameId, faction_id: faction.id },
		}),
	);

	const fields = [
		{ label: "Name", value: faction.name },
		{ label: "ID", value: <span className="font-mono">#{faction.id}</span> },
		{ label: "Created", value: formatDate(faction.created_at) },
		{ label: "Last Updated", value: formatDate(faction.updated_at) },
	];

	const navigate = useNavigate();

	const deleteFaction = useMutation({
		...deleteFactionMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	const onDelete = () => {
		deleteFaction.mutate({
			path: { game_id: gameId, id: faction.id },
		});
	};

	return (
		<div className="space-y-6">
			<DetailTemplate
				title={faction.name}
				icon={Shield}
				iconColor="text-red-600"
				editPath="/games/$gameId/factions/$id/edit"
				gameId={gameId}
				entityId={faction.id.toString()}
				fields={fields}
				onDelete={onDelete}
				content={
					faction.description
						? {
								title: "Description",
								value: faction.description,
							}
						: undefined
				}
			/>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Links</h2>
				<FactionLinkForm factionId={faction.id.toString()} gameId={gameId} />
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
