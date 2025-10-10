// Main components

export { ImageContainer } from "./components/image-container";
export { ImageModal } from "./components/image-modal";
export { ImageViewer } from "./components/image-viewer";
export { useImageSizing } from "./hooks/use-image-sizing";
// Hooks for advanced usage
export { useImageViewer } from "./hooks/use-image-viewer";
export { useZoomPan } from "./hooks/use-zoom-pan";
// Types
export type {
	DialogSize,
	ImageDimensions,
	ImageModalProps,
	ImageViewerActions,
	ImageViewerConfig,
	ImageViewerProps,
	ImageViewerState,
	Position,
	UseImageViewerReturn,
} from "./types";
// Utilities
export {
	calculateConstrainedPosition,
	calculateDisplayDimensions,
} from "./utils/calculations";
export { DEFAULT_CONFIG } from "./utils/constants";
