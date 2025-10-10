/** biome-ignore-all lint/correctness/noChildrenProp: Using React.createElement for performance during render function */
import * as React from "react";
import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";
import type { ImageDimensions, ImageViewerConfig, UseImageViewerReturn } from "../types";
import { LAYOUT } from "../utils/constants";
import { useImageSizing } from "./use-image-sizing";
import { useZoomPan } from "./use-zoom-pan";

interface UseImageViewerOptions {
	image: Image;
	config?: Partial<ImageViewerConfig>;
	onZoomChange?: (zoom: number) => void;
	onImageLoad?: (dimensions: ImageDimensions) => void;
}

export function useImageViewer({
	image,
	config = {},
	onZoomChange,
	onImageLoad,
}: UseImageViewerOptions): UseImageViewerReturn {
	const [imageDimensions, setImageDimensions] = React.useState<ImageDimensions | null>(
		null,
	);
	const [isLoaded, setIsLoaded] = React.useState(false);

	const zoomPan = useZoomPan({
		config,
		onZoomChange,
	});

	const dialogSize = useImageSizing({
		imageDimensions,
		zoom: zoomPan.zoom,
		config,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: imageRef properties are not stable dependencies
	const handleImageLoad = React.useCallback(() => {
		if (zoomPan.imageRef.current) {
			const dimensions = {
				width: zoomPan.imageRef.current.naturalWidth,
				height: zoomPan.imageRef.current.naturalHeight,
			};
			setImageDimensions(dimensions);
			setIsLoaded(true);
			onImageLoad?.(dimensions);
		}
	}, [onImageLoad]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: image.id is needed to reset on image change
	React.useEffect(() => {
		setImageDimensions(null);
		setIsLoaded(false);
		zoomPan.resetView();
	}, [image.id, zoomPan.resetView]);

	const containerProps = React.useMemo(() => {
		if (zoomPan.zoom === 1) {
			return {
				className: "flex-1 p-6 pt-4 overflow-hidden min-h-0",
			};
		}

		return {
			className: "absolute bottom-0 overflow-hidden",
			style: {
				top: `${LAYOUT.headerHeight}px`,
				left: `${LAYOUT.sidePadding}px`,
				right: `${LAYOUT.sidePadding}px`,
			},
		};
	}, [zoomPan.zoom]);

	const render = React.useCallback(() => {
		return React.createElement("div", {
			...containerProps,
			children: React.createElement("div", {
				className: "relative h-full flex flex-col",
				children: [
					// Image container
					React.createElement("div", {
						key: "image-container",
						ref: zoomPan.containerRef,
						className: "relative overflow-hidden rounded-lg flex-1",
						style: {
							cursor: zoomPan.cursorStyle,
							touchAction: "none",
						},
						onWheel: zoomPan.handlers.onWheel,
						children: React.createElement("img", {
							ref: zoomPan.imageRef,
							src: `${SERVER_URL}/${image.file_url}`,
							alt: image.alt_text || "Image",
							className:
								zoomPan.zoom === 1
									? "max-h-full max-w-full w-auto h-auto object-contain rounded-lg mx-auto block"
									: "w-full h-full object-contain rounded-lg",
							style: {
								transform: `scale(${zoomPan.zoom}) translate(${zoomPan.position.x / zoomPan.zoom}px, ${zoomPan.position.y / zoomPan.zoom}px)`,
								transformOrigin: "center center",
							},
							loading: "lazy",
							onLoad: handleImageLoad,
							onClick: zoomPan.handlers.onClick,
							onMouseDown: zoomPan.handlers.onMouseDown,
							draggable: false,
						}),
					}),
					// Controls overlay
					React.createElement("div", {
						key: "controls",
						className: "absolute bottom-2 right-2 flex gap-2",
						children: [
							// Zoom percentage
							zoomPan.zoom > 1 &&
								React.createElement("div", {
									key: "zoom-percent",
									className:
										"bg-black/70 text-white px-2 py-1 rounded text-xs",
									children: `${Math.round(zoomPan.zoom * 100)}%`,
								}),
							// Click instruction
							React.createElement("div", {
								key: "click-instruction",
								className:
									"bg-black/70 text-white px-2 py-1 rounded text-xs",
								children:
									zoomPan.zoom === 1
										? "Click to zoom"
										: zoomPan.zoom === 2
											? "Click for 300%"
											: "Click to reset",
							}),
							// Pan/zoom instructions
							zoomPan.zoom > 1 &&
								config.enableZoom !== false &&
								config.enablePan !== false &&
								React.createElement("div", {
									key: "pan-zoom-instruction",
									className:
										"bg-black/70 text-white px-2 py-1 rounded text-xs",
									children: "Ctrl+scroll: zoom | Scroll: pan",
								}),
						].filter(Boolean),
					}),
					// Alt text
					image.alt_text &&
						React.createElement("div", {
							key: "alt-text",
							className: "p-4 border-t bg-muted/30",
							children: React.createElement("p", {
								className: "text-sm text-muted-foreground",
								children: image.alt_text,
							}),
						}),
				].filter(Boolean),
			}),
		});
	}, [containerProps, image, zoomPan, handleImageLoad, config]);

	return {
		state: {
			zoom: zoomPan.zoom,
			position: zoomPan.position,
			imageDimensions,
			isLoaded,
			isDragging: zoomPan.dragDataRef.current?.isDragging || false,
		},
		actions: {
			setZoom: zoomPan.setZoom,
			setPosition: zoomPan.setPosition,
			resetView: zoomPan.resetView,
			zoomIn: () =>
				zoomPan.setZoom(Math.min(config.maxZoom || 3, zoomPan.zoom + 1)),
			zoomOut: () =>
				zoomPan.setZoom(Math.max(config.minZoom || 0.5, zoomPan.zoom - 1)),
			handleImageLoad,
		},
		dialogSize,
		containerProps,
		render,
	};
}
