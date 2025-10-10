import { cn } from "~/utils/cn";
import { useImageViewer } from "../hooks/use-image-viewer";
import type { ImageViewerProps } from "../types";

export function ImageViewer({
	image,
	config = {},
	className,
	onZoomChange,
	onImageLoad,
}: ImageViewerProps) {
	const viewer = useImageViewer({
		image,
		config,
		onZoomChange,
		onImageLoad,
	});

	return <div className={cn("relative h-full", className)}>{viewer.render()}</div>;
}
