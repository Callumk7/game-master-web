import type * as React from "react";
import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";
import { cn } from "~/utils/cn";
import type { ImageViewerConfig } from "../types";

interface ImageContainerProps {
	image: Image;
	config?: Partial<ImageViewerConfig>;
	className?: string;
	children?: React.ReactNode;
}

/**
 * A minimal container for images that provides basic responsive sizing
 * without zoom/pan functionality. Useful for thumbnails, previews, etc.
 */
export function ImageContainer({ image, className, children }: ImageContainerProps) {
	return (
		<div className={cn("relative overflow-hidden", className)}>
			<img
				src={`${SERVER_URL}/${image.file_url}`}
				alt={image.alt_text || "Image"}
				className="w-full h-full object-contain"
				loading="lazy"
			/>
			{children}
		</div>
	);
}
