import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { uploadEntityImageMutation } from "~/api/@tanstack/react-query.gen";
import type { EntityType } from "~/types";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone";

interface ImageUploadProps {
	gameId: string;
	entityId: string;
	entityType: EntityType;
	onUploadSuccess?: () => void;
	disabled?: boolean;
	className?: string;
}

export function ImageUpload({
	gameId,
	entityId,
	entityType,
	onUploadSuccess,
}: ImageUploadProps) {
	const queryClient = useQueryClient();
	const uploadImage = useMutation({
		...uploadEntityImageMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["listEntityImages", { gameId, entityType, entityId }],
			});
			toast.success("Image uploaded successfully");
			onUploadSuccess?.();
		},
		onError: (error) => {
			console.error("Upload error:", error);
			toast.error("Failed to upload image");
		},
	});

	const handleFileSelect = React.useCallback(
		(files: File[] | null) => {
			if (!files || files.length === 0) return;

			const file = files[0];

			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select an image file");
				return;
			}

			// Validate file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				toast.error("File size must be less than 10MB");
				return;
			}

			uploadImage.mutate({
				path: {
					game_id: gameId,
					entity_type: entityType,
					entity_id: entityId,
				},
				body: {
					"image[file]": file,
					"image[alt_text]": file.name,
				},
			});
		},
		[gameId, entityId, entityType, uploadImage],
	);

	return (
		<Dropzone maxFiles={1} onDrop={handleFileSelect}>
			<DropzoneEmptyState />
			<DropzoneContent />
		</Dropzone>
	);
}
