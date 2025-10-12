import { useQuery } from "@tanstack/react-query";
import { getNoteOptions } from "~/api/@tanstack/react-query.gen";
import { useUpdateNoteMutation } from "~/queries/notes";
import { EntityContentRenderer } from "./entity-content-renderer";
import type { EntityMutationPayload } from "~/types/split-view";
import type { Note } from "~/api/types.gen";
import { useEntityNavigation } from "./hooks";

interface NotePaneViewProps {
	gameId: string;
	noteId: string;
	onClearEntity: () => void;
	onAddEntity: () => void;
}

export function NotePaneView({
	gameId,
	noteId,
	onClearEntity,
	onAddEntity,
}: NotePaneViewProps) {
	const {
		data: noteResponse,
		isLoading,
		isError,
	} = useQuery(
		getNoteOptions({
			path: { game_id: gameId, id: noteId },
		}),
	);

	const { mutateAsync, isPending } = useUpdateNoteMutation(gameId, noteId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { note: payload },
			path: { game_id: gameId, id: noteId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("notes", noteId);
	};

	const handleOpenFullView = () => {
		openFullView("notes", noteId);
	};

	// Transform API note to match our component's expected format
	const note: Note | undefined = noteResponse?.data;

	return (
		<EntityContentRenderer
			entity={note}
			entityType="notes"
			gameId={gameId}
			onSave={handleSave}
			isSaving={isPending}
			isLoading={isLoading}
			isError={isError}
			onClearEntity={onClearEntity}
			onAddEntity={onAddEntity}
			onRefresh={handleRefresh}
			onOpenFullView={handleOpenFullView}
		/>
	);
}

