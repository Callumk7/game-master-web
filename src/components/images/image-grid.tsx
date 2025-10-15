import * as React from "react";
import type { Image } from "~/api";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ImageModal } from "~/lib/image-viewer";
import type { EntityType } from "~/types";
import { ImagePreview } from "./image-preview";

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
							<ImagePreview
								key={image.id}
								gameId={gameId}
								image={image}
								ImageControls={ImageControls}
								setSelectedImage={setSelectedImage}
							/>
						))}
					</div>
				</CardContent>
			</Card>
			{selectedImage && (
				<ImageModal
					image={selectedImage}
					isOpen={isOpen}
					onOpenChange={(_isOpen: boolean) => setSelectedImage(null)}
				/>
			)}
		</>
	);
}
