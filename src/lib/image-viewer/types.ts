import type { Image } from "~/api";

export interface ImageDimensions {
	width: number;
	height: number;
}

export interface Position {
	x: number;
	y: number;
}

export interface ZoomPanState {
	zoom: number;
	position: Position;
}

export interface DialogSize {
	width: string;
	height: string;
	maxWidth: string;
	maxHeight: string;
}

export interface ImageViewerConfig {
	maxZoom?: number;
	minZoom?: number;
	enablePan?: boolean;
	enableZoom?: boolean;
	zoomSteps?: number[];
	maxDisplayWidth?: number;
	maxDisplayHeight?: number;
}

export interface ImageViewerState extends ZoomPanState {
	imageDimensions: ImageDimensions | null;
	isLoaded: boolean;
	isDragging: boolean;
}

export interface ImageViewerActions {
	setZoom: (zoom: number) => void;
	setPosition: (position: Position) => void;
	resetView: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	handleImageLoad: (dimensions: ImageDimensions) => void;
}

export interface UseImageViewerReturn {
	state: ImageViewerState;
	actions: ImageViewerActions;
	dialogSize: DialogSize;
	containerProps: {
		className: string;
		style?: React.CSSProperties;
	};
	render: () => React.ReactNode;
}

export interface ImageModalProps {
	image: Image;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	config?: ImageViewerConfig;
}

export interface ImageViewerProps {
	image: Image;
	config?: ImageViewerConfig;
	className?: string;
	onZoomChange?: (zoom: number) => void;
	onImageLoad?: (dimensions: ImageDimensions) => void;
}
