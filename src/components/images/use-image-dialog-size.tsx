import * as React from "react";

interface ImageDimensions {
	width: number;
	height: number;
}

interface DialogSize {
	width: string;
	height: string;
	maxWidth: string;
	maxHeight: string;
}

interface UseImageDialogSizeOptions {
	imageDimensions: ImageDimensions | null;
	zoom: number;
	padding?: number;
	maxDisplayWidth?: number;
	maxDisplayHeight?: number;
}

function calculateDisplayDimensions(
	naturalWidth: number,
	naturalHeight: number,
	maxDisplayWidth: number,
	maxDisplayHeight: number,
): { width: number; height: number } {
	// Calculate how the image would actually display when constrained by max dimensions
	const aspectRatio = naturalWidth / naturalHeight;
	
	// Calculate dimensions constrained by max width
	let displayWidth = Math.min(naturalWidth, maxDisplayWidth);
	let displayHeight = displayWidth / aspectRatio;
	
	// If height exceeds max, constrain by height instead
	if (displayHeight > maxDisplayHeight) {
		displayHeight = Math.min(naturalHeight, maxDisplayHeight);
		displayWidth = displayHeight * aspectRatio;
	}
	
	return { width: displayWidth, height: displayHeight };
}

export function useImageDialogSize({
	imageDimensions,
	zoom,
	padding = 140, // Account for dialog padding, header, controls, and gap
	maxDisplayWidth = 1200, // Reasonable max display size for images
	maxDisplayHeight = 800,
}: UseImageDialogSizeOptions): DialogSize {
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
	}, [imageDimensions, zoom, padding, maxDisplayWidth, maxDisplayHeight]);
}