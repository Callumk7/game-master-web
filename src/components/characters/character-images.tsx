import { useQueryClient } from "@tanstack/react-query";
import { listEntityImagesQueryKey } from "~/api/@tanstack/react-query.gen";
import { ImageUpload } from "~/components/ui/image-upload";
import { ImageGallery } from "../images/image-gallery";

interface CharacterImagesProps {
	gameId: string;
	characterId: string;
}

export function CharacterImages({ gameId, characterId }: CharacterImagesProps) {
	const queryClient = useQueryClient();
	const onUploadSuccess = () => {
		queryClient.invalidateQueries({
			queryKey: listEntityImagesQueryKey({
				path: {
					game_id: gameId,
					entity_type: "character",
					entity_id: characterId,
				},
			}),
		});
	};

	return (
		<div className="space-y-4">
			<ImageUpload
				gameId={gameId}
				entityId={characterId}
				entityType="character"
				onUploadSuccess={onUploadSuccess}
			/>
			<ImageGallery gameId={gameId} entityId={characterId} entityType="character" />
		</div>
	);
}
