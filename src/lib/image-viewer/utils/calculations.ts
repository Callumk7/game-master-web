import type { ImageDimensions, Position } from "../types";

export function calculateDisplayDimensions(
	naturalWidth: number,
	naturalHeight: number,
	maxDisplayWidth: number,
	maxDisplayHeight: number,
): ImageDimensions {
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

export function calculateConstrainedPosition(
	newPosition: Position,
	zoom: number,
	containerRect: DOMRect,
	imageRect: DOMRect,
): Position {
	const imgWidth = imageRect.width * zoom;
	const imgHeight = imageRect.height * zoom;

	const maxX = Math.max(0, (imgWidth - containerRect.width) / 2);
	const maxY = Math.max(0, (imgHeight - containerRect.height) / 2);

	return {
		x: Math.max(-maxX, Math.min(maxX, newPosition.x)),
		y: Math.max(-maxY, Math.min(maxY, newPosition.y)),
	};
}

export function calculateZoomTowardsCursor(
	currentZoom: number,
	newZoom: number,
	cursorPosition: Position,
	currentPosition: Position,
): Position {
	const zoomFactor = newZoom / currentZoom;

	return {
		x: currentPosition.x - cursorPosition.x * (zoomFactor - 1),
		y: currentPosition.y - cursorPosition.y * (zoomFactor - 1),
	};
}

export function getNextZoomLevel(currentZoom: number, zoomSteps: number[]): number {
	const currentIndex = zoomSteps.findIndex(
		(step) => Math.abs(step - currentZoom) < 0.01,
	);

	if (currentIndex === -1) {
		// If not exactly on a step, find the next higher step
		const nextStep = zoomSteps.find((step) => step > currentZoom);
		return nextStep || zoomSteps[0]; // Loop back to first step
	}

	// Move to next step, or loop back to first
	return zoomSteps[(currentIndex + 1) % zoomSteps.length];
}
