import * as React from "react";
import type { ImageViewerConfig, Position } from "../types";
import {
	calculateConstrainedPosition,
	calculateZoomTowardsCursor,
	getNextZoomLevel,
} from "../utils/calculations";
import { DEFAULT_CONFIG, DRAG_SETTINGS } from "../utils/constants";

interface UseZoomPanOptions {
	config?: Partial<ImageViewerConfig>;
	onZoomChange?: (zoom: number) => void;
}

export function useZoomPan({ config = {}, onZoomChange }: UseZoomPanOptions) {
	const fullConfig = { ...DEFAULT_CONFIG, ...config };
	const [zoom, setZoom] = React.useState(1);
	const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });

	const containerRef = React.useRef<HTMLDivElement>(null);
	const imageRef = React.useRef<HTMLImageElement>(null);
	const dragDataRef = React.useRef({
		isDragging: false,
		hasDragged: false,
		startMouseX: 0,
		startMouseY: 0,
		startPositionX: 0,
		startPositionY: 0,
	});

	const resetView = React.useCallback(() => {
		setZoom(1);
		setPosition({ x: 0, y: 0 });
		onZoomChange?.(1);
	}, [onZoomChange]);

	const getConstrainedPosition = React.useCallback(
		(newPosition: Position, currentZoom: number) => {
			if (!containerRef.current || !imageRef.current) return newPosition;

			const container = containerRef.current.getBoundingClientRect();
			const image = imageRef.current.getBoundingClientRect();

			return calculateConstrainedPosition(
				newPosition,
				currentZoom,
				container,
				image,
			);
		},
		[],
	);

	const handleZoomChange = React.useCallback(
		(newZoom: number, centerPoint?: Position) => {
			if (newZoom === 1) {
				setZoom(1);
				setPosition({ x: 0, y: 0 });
				onZoomChange?.(1);
				return;
			}

			setZoom(newZoom);
			onZoomChange?.(newZoom);

			// Adjust position if zooming towards a specific point
			if (centerPoint && containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				const mouseX = centerPoint.x - rect.left - rect.width / 2;
				const mouseY = centerPoint.y - rect.top - rect.height / 2;

				const newPosition = calculateZoomTowardsCursor(
					zoom,
					newZoom,
					{ x: mouseX, y: mouseY },
					position,
				);
				setPosition(getConstrainedPosition(newPosition, newZoom));
			}
		},
		[zoom, position, getConstrainedPosition, onZoomChange],
	);

	const handleImageClick = React.useCallback(() => {
		// Only handle click if we haven't dragged
		if (!dragDataRef.current.hasDragged) {
			const nextZoom = getNextZoomLevel(zoom, [...fullConfig.zoomSteps]);
			handleZoomChange(nextZoom);
		}
	}, [zoom, fullConfig.zoomSteps, handleZoomChange]);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			const data = dragDataRef.current;

			if (data.isDragging && zoom > 1 && fullConfig.enablePan) {
				e.preventDefault();

				// Mark that we've dragged (prevents click from firing)
				data.hasDragged = true;

				const deltaX = e.clientX - data.startMouseX;
				const deltaY = e.clientY - data.startMouseY;

				const newPosition = {
					x: data.startPositionX + deltaX,
					y: data.startPositionY + deltaY,
				};

				setPosition(getConstrainedPosition(newPosition, zoom));
			}
		},
		[zoom, getConstrainedPosition, fullConfig.enablePan],
	);

	const handleMouseUp = React.useCallback(() => {
		const data = dragDataRef.current;

		if (data.isDragging) {
			data.isDragging = false;

			document.body.style.userSelect = "";
			document.body.style.cursor = "";

			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);

			// Reset hasDragged after a short delay to allow click prevention
			setTimeout(() => {
				data.hasDragged = false;
			}, DRAG_SETTINGS.preventClickDelay);
		}
	}, [handleMouseMove]);

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent) => {
			if (zoom > 1 && fullConfig.enablePan) {
				e.preventDefault();

				const data = dragDataRef.current;
				data.isDragging = true;
				data.hasDragged = false;
				data.startMouseX = e.clientX;
				data.startMouseY = e.clientY;
				data.startPositionX = position.x;
				data.startPositionY = position.y;

				document.body.style.userSelect = "none";
				document.body.style.cursor = "grabbing";

				document.addEventListener("mousemove", handleMouseMove, {
					passive: false,
				});
				document.addEventListener("mouseup", handleMouseUp);
			}
		},
		[zoom, position, handleMouseMove, handleMouseUp, fullConfig.enablePan],
	);

	const handleWheel = React.useCallback(
		(e: React.WheelEvent) => {
			if (!fullConfig.enableZoom) return;

			e.preventDefault();

			if (e.ctrlKey || e.metaKey) {
				// Zoom with Ctrl/Cmd + scroll
				const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
				const newZoom = Math.max(
					fullConfig.minZoom,
					Math.min(fullConfig.maxZoom, zoom * zoomDelta),
				);

				handleZoomChange(newZoom, { x: e.clientX, y: e.clientY });
			} else {
				// Pan with regular scroll when zoomed
				if (zoom > 1 && fullConfig.enablePan) {
					const newPosition = {
						x: position.x - e.deltaX * DRAG_SETTINGS.panSensitivity,
						y: position.y - e.deltaY * DRAG_SETTINGS.panSensitivity,
					};
					setPosition(getConstrainedPosition(newPosition, zoom));
				}
			}
		},
		// biome-ignore lint/correctness/useExhaustiveDependencies: fullConfig is derived from stable DEFAULT_CONFIG and props
		[zoom, position, getConstrainedPosition, handleZoomChange, fullConfig],
	);

	// Cleanup on unmount
	React.useEffect(() => {
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		};
	}, [handleMouseMove, handleMouseUp]);

	const cursorStyle = React.useMemo(() => {
		if (!fullConfig.enableZoom) return "default";
		if (zoom === 1) return "zoom-in";
		if (dragDataRef.current.isDragging) return "grabbing";
		return fullConfig.enablePan ? "grab" : "default";
	}, [zoom, fullConfig.enableZoom, fullConfig.enablePan]);

	return {
		zoom,
		position,
		setZoom: handleZoomChange,
		setPosition,
		resetView,
		containerRef,
		imageRef,
		dragDataRef,
		cursorStyle,
		handlers: {
			onMouseDown: handleMouseDown,
			onWheel: handleWheel,
			onClick: handleImageClick,
		},
	};
}
