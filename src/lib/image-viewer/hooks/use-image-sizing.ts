import * as React from "react";
import type { DialogSize, ImageDimensions, ImageViewerConfig } from "../types";
import { calculateDisplayDimensions } from "../utils/calculations";
import { DEFAULT_CONFIG, DIALOG_PADDING } from "../utils/constants";

interface UseImageSizingOptions {
	imageDimensions: ImageDimensions | null;
	zoom: number;
	config?: Partial<ImageViewerConfig>;
}

export function useImageSizing({
	imageDimensions,
	zoom,
	config = {},
}: UseImageSizingOptions): DialogSize {
	const { maxDisplayWidth, maxDisplayHeight } = { ...DEFAULT_CONFIG, ...config };

	return React.useMemo(() => {
		if (!imageDimensions) {
			// Fallback while image is loading
			return {
				width: "fit-content",
				height: "fit-content",
				maxWidth: "95vw",
				maxHeight: "95vh",
			};
		}

		// Calculate how the image would actually display (not its natural size)
		const displayDimensions = calculateDisplayDimensions(
			imageDimensions.width,
			imageDimensions.height,
			maxDisplayWidth,
			maxDisplayHeight,
		);

		// Calculate the desired image size with zoom
		const targetImageWidth = displayDimensions.width * zoom;
		const targetImageHeight = displayDimensions.height * zoom;

		// Calculate dialog size by adding padding
		const padding = zoom > 1 ? DIALOG_PADDING.zoom : DIALOG_PADDING.fit;
		const dialogWidth = targetImageWidth + padding;
		const dialogHeight = targetImageHeight + padding;

		// Get viewport dimensions for max constraints
		const maxViewportWidth = window.innerWidth * 0.95;
		const maxViewportHeight = window.innerHeight * 0.95;

		// Determine if we need to constrain to viewport
		const needsWidthConstraint = dialogWidth > maxViewportWidth;
		const needsHeightConstraint = dialogHeight > maxViewportHeight;

		if (needsWidthConstraint || needsHeightConstraint) {
			// Use viewport limits when image + padding exceeds viewport
			return {
				width: "95vw",
				height: "95vh",
				maxWidth: "95vw",
				maxHeight: "95vh",
			};
		}

		// Use exact dimensions when image fits comfortably
		return {
			width: `${dialogWidth}px`,
			height: `${dialogHeight}px`,
			maxWidth: "95vw",
			maxHeight: "95vh",
		};
	}, [imageDimensions, zoom, maxDisplayWidth, maxDisplayHeight]);
}
