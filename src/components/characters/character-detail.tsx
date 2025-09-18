import * as React from "react";
import type { Character } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import {
	useDeleteCharacterMutation,
	useGetCharacterLinks,
	useUpdateCharacterMutation,
} from "~/queries/characters";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { Link } from "../ui/link";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
				description: JSON.stringify(updatedContent.json),
				description_plain_text: updatedContent.text,
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

	return (
		<div className="space-y-6 mt-12">
			<div className="flex gap-4">
				<Link
					variant={"outline"}
					to="/games/$gameId/characters/$id/edit"
					params={{ gameId, id: character.id }}
				>
					Edit
				</Link>
				<Button variant={"destructive"} onClick={onDelete}>
					Delete
				</Button>
			</div>
			<h2 className="font-bold text-3xl">{character.name}</h2>

			{/* Badges and Tags */}
			<div className="flex justify-between">
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
			</div>

			<Tabs defaultValue={"description"}>
				<TabsList>
					<TabsTrigger value="description">Description</TabsTrigger>
					<TabsTrigger value="links">Links</TabsTrigger>
				</TabsList>
				<TabsContent value="description">
					<MinimalTiptap
						content={parseDescriptionForEditor(character.description)}
						onChange={onChange}
					/>
					<Button
						variant={"secondary"}
						onClick={handleSave}
						disabled={!isUpdated}
					>
						Save
					</Button>
				</TabsContent>
				<TabsContent value="links">
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
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Utilities

const parseDescriptionForEditor = (description?: string) => {
	if (!description) return null;

	// Try to parse as JSON first (TipTap format)
	try {
		const parsed = JSON.parse(description);
		if (parsed && typeof parsed === "object" && parsed.type) {
			return parsed;
		}
	} catch {
		// Not JSON, continue to plain text handling
	}

	// Handle as plain text - convert to TipTap document structure
	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [
					{
						type: "text",
						text: description,
					},
				],
			},
		],
	};
};
