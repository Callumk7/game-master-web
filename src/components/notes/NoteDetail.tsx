import * as React from "react";
import { StickyNote } from "lucide-react";
import type { Note } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import {
	useDeleteNoteMutation,
	useGetNoteLinks,
	useUpdateNoteMutation,
} from "~/queries/notes";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { parseContentForEditor } from "~/utils/editorHelpers";
import { CreateNoteLink } from "./CreateNoteLink";

interface NoteDetailProps {
	note: Note;
	gameId: string;
}

export function NoteDetail({ note, gameId }: NoteDetailProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetNoteLinks(gameId, note.id);

	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });
	const updateNote = useUpdateNoteMutation(gameId, note.id);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const handleSave = () => {
		const payload = {
			note: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		};
		updateNote.mutate({
			body: payload,
			path: { game_id: gameId, id: note.id },
		});
		setIsUpdated(false);
	};

	const deleteNote = useDeleteNoteMutation(gameId);

	const onDelete = () => {
		deleteNote.mutate({
			path: { game_id: gameId, id: note.id },
		});
	};

	const badges = note.tags && note.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{note.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	const contentTab = (
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(note.content)}
				onChange={onChange}
			/>
			<Button
				variant={"secondary"}
				onClick={handleSave}
				disabled={!isUpdated}
			>
				Save
			</Button>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateNoteLink gameId={gameId} noteId={note.id.toString()} />
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
	);

	return (
		<DetailTemplate
			title={note.name}
			icon={StickyNote}
			iconColor="text-yellow-600"
			badges={badges}
			editPath="/games/$gameId/notes/$id/edit"
			gameId={gameId}
			entityId={note.id.toString()}
			onDelete={onDelete}
			tabs={[
				{ id: "content", label: "Content", content: contentTab },
				{ id: "links", label: "Links", content: linksTab },
			]}
			defaultTab="content"
		/>
	);
}
