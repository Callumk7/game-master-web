import { StarIcon } from "lucide-react";
import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";
import { Badge } from "../ui/badge";
import type { ImageControlsProps } from "./image-grid";

interface ImagePreviewProps {
	gameId: string;
	image: Image;
	ImageControls?: React.ComponentType<ImageControlsProps>;
	setSelectedImage?: (image: Image | null) => void;
}

export function ImagePreview({
	gameId,
	image,
	ImageControls,
	setSelectedImage,
}: ImagePreviewProps) {
	return (
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
				onClick={setSelectedImage ? () => setSelectedImage(image) : undefined}
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
	);
}
