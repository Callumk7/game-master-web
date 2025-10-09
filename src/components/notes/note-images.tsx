import { useQueryClient } from "@tanstack/react-query";
import { listEntityImagesQueryKey } from "~/api/@tanstack/react-query.gen";
import { ImageUpload } from "~/components/ui/image-upload";
import { ImageGallery } from "../images/image-gallery";

interface NoteImagesProps {
	gameId: string;
	noteId: string;
}

export function NoteImages({ gameId, noteId }: NoteImagesProps) {
	const queryClient = useQueryClient();
	const onUploadSuccess = () => {
		queryClient.invalidateQueries({
			queryKey: listEntityImagesQueryKey({
				path: {
					game_id: gameId,
					entity_type: "note",
					entity_id: noteId,
				},
			}),
		});
	};

	return (
		<div className="space-y-4">
			<ImageUpload
				gameId={gameId}
				entityId={noteId}
				entityType="note"
				onUploadSuccess={onUploadSuccess}
			/>
			<ImageGallery gameId={gameId} entityId={noteId} entityType="note" />
		</div>
	);
}
