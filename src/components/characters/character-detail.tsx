import * as React from "react";
import { Users } from "lucide-react";
import type { Character } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import {
	useDeleteCharacterMutation,
	useGetCharacterLinks,
	useUpdateCharacterMutation,
} from "~/queries/characters";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { parseContentForEditor } from "~/utils/editorHelpers";
import { CreateCharacterLink } from "./CreateCharacterLink";

interface CharacterDetailProps {
	character: Character;
	gameId: string;
}

export function CharacterDetail({ character, gameId }: CharacterDetailProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinks(gameId, character.id);

	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });
	const updateCharacter = useUpdateCharacterMutation(gameId, character.id);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const handleSave = () => {
		const payload = {
			character: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		};
		updateCharacter.mutate({
			body: payload,
			path: { game_id: gameId, id: character.id },
		});
		setIsUpdated(false);
	};

	const deleteCharacter = useDeleteCharacterMutation(gameId);

	const onDelete = () => {
		deleteCharacter.mutate({
			path: { game_id: gameId, id: character.id },
		});
	};

	const badges = (
		<>
			<div className="flex flex-wrap gap-2">
				<Badge>{character.class}</Badge>
				<Badge>Level: {character.level}</Badge>
			</div>

			{character.tags && character.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{character.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</div>
			)}
		</>
	);

	const descriptionTab = (
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(character.content)}
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
			<CreateCharacterLink gameId={gameId} characterId={character.id} />
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
			title={character.name}
			icon={Users}
			iconColor="text-green-600"
			badges={badges}
			editPath="/games/$gameId/characters/$id/edit"
			gameId={gameId}
			entityId={character.id}
			onDelete={onDelete}
			tabs={[
				{ id: "content", label: "Content", content: descriptionTab },
				{ id: "links", label: "Links", content: linksTab },
			]}
			defaultTab="description"
		/>
	);
}
