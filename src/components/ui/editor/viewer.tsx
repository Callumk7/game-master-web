import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";
import { cn } from "~/utils/cn";
import { parseContentForEditor } from "./utils";
import { SimpleMention, type MentionItem } from "./mention-extension-simple";
import { useListGameEntitiesQuery } from "~/api/@tanstack/react-query.gen";
import { useParams } from "@tanstack/react-router";
import "src/components/ui/editor/tiptap.css";

export interface TiptapViewerProps {
	content?: string;
	className?: string;
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
	const params = useParams({ from: "/_auth/games/$gameId" });
	const gameId = params?.gameId;

	// Fetch entities for mentions (same as editor)
	const { data: entitiesData } = useListGameEntitiesQuery(
		{ path: { game_id: gameId } },
		{ 
			enabled: !!gameId,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Transform entities into mention items (same logic as editor)
	const mentionItems = React.useMemo((): MentionItem[] => {
		if (!entitiesData?.data?.entities || !gameId) return [];

		const items: MentionItem[] = [];
		const entities = entitiesData.data.entities;

		// Add characters
		entities.characters?.forEach((character) => {
			items.push({
				id: character.id,
				label: character.name,
				type: "character",
				gameId,
			});
		});

		// Add factions
		entities.factions?.forEach((faction) => {
			items.push({
				id: faction.id,
				label: faction.name,
				type: "faction",
				gameId,
			});
		});

		// Add locations
		entities.locations?.forEach((location) => {
			items.push({
				id: location.id,
				label: location.name,
				type: "location",
				gameId,
			});
		});

		// Add notes
		entities.notes?.forEach((note) => {
			items.push({
				id: note.id,
				label: note.name,
				type: "note",
				gameId,
			});
		});

		// Add quests
		entities.quests?.forEach((quest) => {
			items.push({
				id: quest.id,
				label: quest.name,
				type: "quest",
				gameId,
			});
		});

		return items;
	}, [entitiesData, gameId]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					keepMarks: true,
					keepAttributes: false,
				},
				orderedList: {
					keepMarks: true,
					keepAttributes: false,
				},
			}),
			// Add mention extension for rendering saved mentions
			SimpleMention.configure({
				suggestion: {
					// Disable suggestion in viewer (read-only)
					items: () => [],
				},
			}),
		],
		content: parseContentForEditor(content),
		editable: false,
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
					className,
				),
			},
		},
		immediatelyRender: false,
	});

	if (!editor) {
		return null;
	}

	return <EditorContent editor={editor} />;
}
