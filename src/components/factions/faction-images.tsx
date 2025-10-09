import { useQueryClient } from "@tanstack/react-query";
import { listEntityImagesQueryKey } from "~/api/@tanstack/react-query.gen";
import { ImageUpload } from "~/components/ui/image-upload";
import { ImageGallery } from "../images/image-gallery";

interface FactionImagesProps {
	gameId: string;
	factionId: string;
}

export function FactionImages({ gameId, factionId }: FactionImagesProps) {
	const queryClient = useQueryClient();
	const onUploadSuccess = () => {
		queryClient.invalidateQueries({
			queryKey: listEntityImagesQueryKey({
				path: {
					game_id: gameId,
					entity_type: "faction",
					entity_id: factionId,
				},
			}),
		});
	};

	return (
		<div className="space-y-4">
			<ImageUpload
				gameId={gameId}
				entityId={factionId}
				entityType="faction"
				onUploadSuccess={onUploadSuccess}
			/>
			<ImageGallery gameId={gameId} entityId={factionId} entityType="faction" />
		</div>
	);
}
