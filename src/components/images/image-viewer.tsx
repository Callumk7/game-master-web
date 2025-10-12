import * as React from "react";
import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";

interface ImageViewerProps {
	image: Image;
	onZoomChange?: (zoom: number) => void;
	onImageDimensionsChange?: (dimensions: { width: number; height: number }) => void;
}

export function ImageViewer({
	image,
	onZoomChange,
	onImageDimensionsChange,
}: ImageViewerProps) {
	const [zoom, setZoom] = React.useState(1);
	const [position, setPosition] = React.useState({ x: 0, y: 0 });
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

	const handleImageLoad = React.useCallback(() => {
		if (imageRef.current) {
			const dimensions = {
				width: imageRef.current.naturalWidth,
				height: imageRef.current.naturalHeight,
			};
			onImageDimensionsChange?.(dimensions);
		}
	}, [onImageDimensionsChange]);

	const getConstrainedPosition = React.useCallback(
		(newPosition: { x: number; y: number }, currentZoom: number) => {
			if (!containerRef.current || !imageRef.current) return newPosition;

			const container = containerRef.current.getBoundingClientRect();
			const imgWidth = imageRef.current.offsetWidth * currentZoom;
			const imgHeight = imageRef.current.offsetHeight * currentZoom;

			const maxX = Math.max(0, (imgWidth - container.width) / 2);
			const maxY = Math.max(0, (imgHeight - container.height) / 2);

			return {
				x: Math.max(-maxX, Math.min(maxX, newPosition.x)),
				y: Math.max(-maxY, Math.min(maxY, newPosition.y)),
			};
		},
		[],
	);

	const handleImageClick = React.useCallback(() => {
		// Only handle click if we haven't dragged
		if (!dragDataRef.current.hasDragged) {
			let newZoom: number;
			if (zoom === 1) {
				newZoom = 2;
			} else if (zoom === 2) {
				newZoom = 3;
			} else {
				newZoom = 1;
				setPosition({ x: 0, y: 0 });
			}
			setZoom(newZoom);
			onZoomChange?.(newZoom);
		}
	}, [zoom, onZoomChange]);

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			const data = dragDataRef.current;

			if (data.isDragging && zoom > 1) {
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
		[zoom, getConstrainedPosition],
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
			}, 10);
		}
	}, [handleMouseMove]);

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent) => {
			if (zoom > 1) {
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

				// Use passive listeners for better performance
				document.addEventListener("mousemove", handleMouseMove, {
					passive: false,
				});
				document.addEventListener("mouseup", handleMouseUp);
			}
		},
		[zoom, position, handleMouseMove, handleMouseUp],
	);

	const handleWheel = React.useCallback(
		(e: React.WheelEvent) => {
			e.preventDefault();

			if (e.ctrlKey || e.metaKey) {
				// Zoom with Ctrl/Cmd + scroll
				const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
				const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta));

				if (newZoom === 1) {
					setZoom(1);
					setPosition({ x: 0, y: 0 });
				} else {
					setZoom(newZoom);
					// Adjust position to zoom towards mouse cursor
					if (containerRef.current) {
						const rect = containerRef.current.getBoundingClientRect();
						const mouseX = e.clientX - rect.left - rect.width / 2;
						const mouseY = e.clientY - rect.top - rect.height / 2;

						const zoomFactor = newZoom / zoom;
						const newPosition = {
							x: position.x - mouseX * (zoomFactor - 1),
							y: position.y - mouseY * (zoomFactor - 1),
						};

						setPosition(getConstrainedPosition(newPosition, newZoom));
					}
				}
				onZoomChange?.(newZoom);
			} else {
				// Pan with regular scroll when zoomed
				if (zoom > 1) {
					const newPosition = {
						x: position.x - e.deltaX * 0.5,
						y: position.y - e.deltaY * 0.5,
					};
					setPosition(getConstrainedPosition(newPosition, zoom));
				}
			}
		},
		[zoom, position, getConstrainedPosition, onZoomChange],
	);

	// Reset view when image changes
	React.useEffect(() => {
		setZoom(1);
		setPosition({ x: 0, y: 0 });
		onZoomChange?.(1);
	}, [onZoomChange]);

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
		if (zoom === 1) return "zoom-in";
		if (dragDataRef.current.isDragging) return "grabbing";
		return "grab";
	}, [zoom]);

	return (
		<div className="relative h-full flex flex-col">
			<div
				ref={containerRef}
				className="relative overflow-hidden rounded-lg flex-1"
				style={{
					cursor: cursorStyle,
					touchAction: "none",
				}}
				onWheel={handleWheel}
			>
				<img
					ref={imageRef}
					src={`${SERVER_URL}/${image.file_url}`}
					alt={image.alt_text || "Image"}
					className={
						zoom === 1
							? "max-h-full max-w-full w-auto h-auto object-contain rounded-lg mx-auto block"
							: "w-full h-full object-contain rounded-lg"
					}
					style={{
						transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
						transformOrigin: "center center",
					}}
					loading="lazy"
					onLoad={handleImageLoad}
					onClick={handleImageClick}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleImageClick();
						}
					}}
					onMouseDown={handleMouseDown}
					aria-label={`Zoom image: ${image.alt_text || "Image"}. Current zoom: ${Math.round(zoom * 100)}%`}
					draggable={false}
				/>
			</div>

			{/* Controls overlay */}
			<div className="absolute bottom-2 right-2 flex gap-2">
				{zoom > 1 && (
					<div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
						{Math.round(zoom * 100)}%
					</div>
				)}

				<div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
					{zoom === 1
						? "Click to zoom"
						: zoom === 2
							? "Click for 300%"
							: "Click to reset"}
				</div>

				{zoom > 1 && (
					<div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
						Ctrl+scroll: zoom | Scroll: pan
					</div>
				)}
			</div>

			{image.alt_text && (
				<div className="p-4 border-t bg-muted/30">
					<p className="text-sm text-muted-foreground">{image.alt_text}</p>
				</div>
			)}
		</div>
	);
}
