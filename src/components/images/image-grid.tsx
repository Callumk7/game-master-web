import { StarIcon } from "lucide-react";
import * as React from "react";
import type { Image } from "~/api";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { SERVER_URL } from "~/routes/__root";
import type { EntityType } from "~/types";
import { ImageViewer } from "./image-viewer";
import { useImageDialogSize } from "./use-image-dialog-size";

export interface ImageControlsProps {
	gameId: string;
	image: Image;
	entityType: EntityType;
	entityId: string;
}

interface ImageGridProps {
	gameId: string;
	images: Image[];
	ImageControls?: React.ComponentType<ImageControlsProps>;
}

export function ImageGrid({ gameId, images, ImageControls }: ImageGridProps) {
	const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
	const isOpen = selectedImage !== null;
	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Images</CardTitle>
						<Badge variant="secondary">
							{images.length} {images.length === 1 ? "image" : "images"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{images.map((image) => (
							<div
								key={image.id}
								className="group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-md"
							>
								{image.is_primary && (
									<div className="absolute top-2 left-2 z-10">
										<Badge
											variant="default"
											size="sm"
											className="bg-yellow-500 text-yellow-900"
										>
											<StarIcon className="h-3 w-3 mr-1" />
											Primary
										</Badge>
									</div>
								)}
								{ImageControls && (
									<ImageControls
										gameId={gameId}
										entityId={image.entity_id}
										entityType={image.entity_type}
										image={image}
									/>
								)}
								<button
									type="button"
									className="absolute inset-0 cursor-pointer"
									onClick={() => setSelectedImage(image)}
									aria-label={`View image: ${image.alt_text || "Untitled"}`}
								>
									<img
										src={`${SERVER_URL}/${image.file_url}`}
										alt={image.alt_text || "Image"}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
									<div className="absolute bottom-2 left-2 right-2 transform translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
										<div className="flex items-center justify-between">
											<Badge
												variant="secondary"
												size="sm"
												className="bg-background/80 text-xs"
											>
												<svg
													className="h-3 w-3 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
												View
											</Badge>
										</div>
									</div>
								</button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			{selectedImage && (
				<ImageModal
					isOpen={isOpen}
					onOpenChange={(_isOpen: boolean) => setSelectedImage(null)}
					image={selectedImage}
				/>
			)}
		</>
	);
}

interface ImageModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	image: Image;
}

function ImageModal({ isOpen, onOpenChange, image }: ImageModalProps) {
	const [zoom, setZoom] = React.useState(1);
	const [imageDimensions, setImageDimensions] = React.useState<{
		width: number;
		height: number;
	} | null>(null);

	const dialogSize = useImageDialogSize({
		imageDimensions,
		zoom,
		padding: 120, // Header + padding + controls
	});

	const handleZoomChange = React.useCallback((newZoom: number) => {
		setZoom(newZoom);
	}, []);

	const handleImageDimensionsChange = React.useCallback(
		(dimensions: { width: number; height: number }) => {
			setImageDimensions(dimensions);
		},
		[],
	);

	// Reset state when image changes
	React.useEffect(() => {
		setZoom(1);
		setImageDimensions(null);
	}, [image.id]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} dismissible={true}>
			<DialogContent
				className="min-w-fit min-h-fit p-0"
				style={{
					width: dialogSize.width,
					height: dialogSize.height,
					maxWidth: dialogSize.maxWidth,
					maxHeight: dialogSize.maxHeight,
				}}
			>
				<DialogHeader className="px-6 pt-6 pb-0">
					<DialogTitle>Image: {image.alt_text || "Untitled"}</DialogTitle>
				</DialogHeader>
				<div className="flex-1 p-6 pt-4 overflow-hidden min-h-0">
					<ImageViewer
						image={image}
						onZoomChange={handleZoomChange}
						onImageDimensionsChange={handleImageDimensionsChange}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
