import { MapPin } from "lucide-react";
import * as React from "react";
import type { Location } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import {
	useDeleteLocationMutation,
	useGetLocationLinks,
	useUpdateLocationMutation,
} from "~/queries/locations";
import { parseContentForEditor } from "~/utils/editorHelpers";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateLocationLink } from "./CreateLocationLink";

interface LocationDetailProps {
	location: Location;
	gameId: string;
}

export function LocationDetail({ location, gameId }: LocationDetailProps) {
	const formatType = (type: string) => {
		return type.charAt(0).toUpperCase() + type.slice(1);
	};

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetLocationLinks(gameId, location.id);

	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });
	const updateLocation = useUpdateLocationMutation(gameId, location.id);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const handleSave = () => {
		const payload = {
			location: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		};
		updateLocation.mutate({
			body: payload,
			path: { game_id: gameId, id: location.id },
		});
		setIsUpdated(false);
	};

	const deleteLocation = useDeleteLocationMutation(gameId);

	const onDelete = () => {
		deleteLocation.mutate({
			path: { game_id: gameId, id: location.id },
		});
	};

	const badges = <Badge variant="secondary">{formatType(location.type)}</Badge>;

	const descriptionTab = (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Content</h2>
			<MinimalTiptap
				content={parseContentForEditor(location.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateLocationLink gameId={gameId} locationId={location.id.toString()} />
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
					links={flattenLinksForTable(linksResponse as GenericLinksResponse)}
					gameId={gameId}
				/>
			)}
		</div>
	);

	return (
		<DetailTemplate
			title={location.name}
			icon={MapPin}
			iconColor="text-blue-600"
			badges={badges}
			editPath="/games/$gameId/locations/$id/edit"
			gameId={gameId}
			entityId={location.id.toString()}
			onDelete={onDelete}
			tabs={[
				{ id: "content", label: "Content", content: descriptionTab },
				{ id: "links", label: "Links", content: linksTab },
			]}
			defaultTab="description"
		/>
	);
}
