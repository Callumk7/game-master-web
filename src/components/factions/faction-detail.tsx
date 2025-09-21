import { Shield } from "lucide-react";
import * as React from "react";
import type { Faction } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import {
	useDeleteFactionMutation,
	useGetFactionLinks,
	useUpdateFactionMutation,
} from "~/queries/factions";
import { parseContentForEditor } from "~/utils/editorHelpers";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateFactionLink } from "./CreateFactionLink";

interface FactionDetailProps {
	faction: Faction;
	gameId: string;
}

export function FactionDetail({ faction, gameId }: FactionDetailProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetFactionLinks(gameId, faction.id);

	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });

	const updateFaction = useUpdateFactionMutation(gameId, faction.id);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const handleSave = () => {
		const payload = {
			faction: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		};
		updateFaction.mutate({
			body: payload,
			path: { game_id: gameId, id: faction.id },
		});
		setIsUpdated(false);
	};

	const deleteFaction = useDeleteFactionMutation(gameId);

	const onDelete = () => {
		deleteFaction.mutate({
			path: { game_id: gameId, id: faction.id },
		});
	};

	const badges = faction.tags && faction.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{faction.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	const descriptionTab = (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Content</h2>
			<MinimalTiptap
				content={parseContentForEditor(faction.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Links</h2>
			<CreateFactionLink gameId={gameId} factionId={faction.id} />
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
			title={faction.name}
			icon={Shield}
			iconColor="text-red-600"
			badges={badges}
			editPath="/games/$gameId/factions/$id/edit"
			gameId={gameId}
			entityId={faction.id}
			onDelete={onDelete}
			tabs={[
				{ id: "content", label: "Content", content: descriptionTab },
				{ id: "links", label: "Links", content: linksTab },
			]}
			defaultTab="description"
		/>
	);
}
