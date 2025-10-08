import { useQueryClient } from "@tanstack/react-query";
import { listEntityImagesQueryKey } from "~/api/@tanstack/react-query.gen";
import { ImageGallery } from "../images/image-gallery";
import { ImageUpload } from "../ui/image-upload";

interface LocationImagesProps {
	gameId: string;
	locationId: string;
}

export function LocationImages({ gameId, locationId }: LocationImagesProps) {
	const queryClient = useQueryClient();
	const onUploadSuccess = () => {
		queryClient.invalidateQueries({
			queryKey: listEntityImagesQueryKey({
				path: {
					game_id: gameId,
					entity_type: "location",
					entity_id: locationId,
				},
			}),
		});
	};

	return (
		<div className="space-y-4">
			<ImageUpload
				gameId={gameId}
				entityId={locationId}
				entityType="location"
				onUploadSuccess={onUploadSuccess}
			/>
			<ImageGallery gameId={gameId} entityId={locationId} entityType="location" />
		</div>
	);
}
