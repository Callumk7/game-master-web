/** biome-ignore-all lint/a11y/useSemanticElements: draggable element is not a semantic element */
import { Dialog } from "@base-ui-components/react/dialog";
import { XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "~/utils/cn";

interface DraggableWindowProps {
	children: React.ReactNode;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	defaultWidth?: number;
	defaultHeight?: number;
	minWidth?: number;
	minHeight?: number;
	className?: string;
	contentClassName?: string;
	initialOffset?: { x: number; y: number };
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
	children,
	isOpen,
	onOpenChange,
	title = "Window",
	defaultWidth = 400,
	defaultHeight = 300,
	minWidth = 250,
	minHeight = 150,
	className = "",
	contentClassName = "",
	initialOffset = { x: 0, y: 0 },
}) => {
	const popupRef = React.useRef<HTMLDivElement>(null);
	const dragDataRef = React.useRef({
		isDragging: false,
		isResizing: false,
		startMouseX: 0,
		startMouseY: 0,
		startX: 100,
		startY: 100,
		startWidth: defaultWidth,
		startHeight: defaultHeight,
		currentX: 100,
		currentY: 100,
		currentWidth: defaultWidth,
		currentHeight: defaultHeight,
	});

	const handleMouseMove = React.useCallback(
		(e: MouseEvent) => {
			const data = dragDataRef.current;
			const popup = popupRef.current;
			if (!popup) return;

			if (data.isDragging) {
				// Disable transitions for instant response
				popup.style.transition = "none";

				// Use transform for maximum performance - no layout recalculation
				const deltaX = e.clientX - data.startMouseX;
				const deltaY = e.clientY - data.startMouseY;

				data.currentX = data.startX + deltaX;
				data.currentY = data.startY + deltaY;

				popup.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
			} else if (data.isResizing) {
				// Disable transitions for instant response
				popup.style.transition = "none";

				// Direct width/height manipulation for resizing
				const deltaX = e.clientX - data.startMouseX;
				const deltaY = e.clientY - data.startMouseY;

				data.currentWidth = Math.max(minWidth, data.startWidth + deltaX);
				data.currentHeight = Math.max(minHeight, data.startHeight + deltaY);

				popup.style.width = `${data.currentWidth}px`;
				popup.style.height = `${data.currentHeight}px`;
			}
		},
		[minWidth, minHeight],
	);

	const handleMouseUp = React.useCallback(() => {
		const data = dragDataRef.current;

		if (data.isDragging || data.isResizing) {
			data.isDragging = false;
			data.isResizing = false;

			document.body.style.userSelect = "";
			document.body.style.cursor = "";

			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);

			// Re-enable transitions after drag/resize ends
			if (popupRef.current) {
				const popup = popupRef.current;
				popup.style.transition = "";

				// After drag ends, apply bounds checking and update position
				const maxX = window.innerWidth - data.currentWidth;
				const maxY = window.innerHeight - data.currentHeight;

				data.currentX = Math.max(0, Math.min(maxX, data.currentX));
				data.currentY = Math.max(0, Math.min(maxY, data.currentY));

				// Update both transform and left/top for consistency
				popup.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
				popup.style.left = "0px";
				popup.style.top = "0px";
			}
		}
	}, [handleMouseMove]);

	const handleDragStart = React.useCallback(
		(e: React.MouseEvent) => {
			if (
				(e.target as HTMLElement).closest(".resize-handle") ||
				(e.target as HTMLElement).closest("textarea") ||
				(e.target as HTMLElement).closest("input") ||
				(e.target as HTMLElement).closest(
					'button:not([aria-label="Drag to move window"])',
				)
			) {
				return;
			}

			e.preventDefault();
			const data = dragDataRef.current;

			data.isDragging = true;
			data.startMouseX = e.clientX;
			data.startMouseY = e.clientY;
			data.startX = data.currentX;
			data.startY = data.currentY;

			document.body.style.userSelect = "none";
			document.body.style.cursor = "grabbing";

			// Use passive listeners for better performance
			document.addEventListener("mousemove", handleMouseMove, { passive: true });
			document.addEventListener("mouseup", handleMouseUp);
		},
		[handleMouseMove, handleMouseUp],
	);

	const handleResizeStart = React.useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const data = dragDataRef.current;

			data.isResizing = true;
			data.startMouseX = e.clientX;
			data.startMouseY = e.clientY;
			data.startWidth = data.currentWidth;
			data.startHeight = data.currentHeight;

			document.body.style.userSelect = "none";
			document.body.style.cursor = "nw-resize";

			document.addEventListener("mousemove", handleMouseMove, { passive: true });
			document.addEventListener("mouseup", handleMouseUp);
		},
		[handleMouseMove, handleMouseUp],
	);

	const initializePosition = React.useCallback(() => {
		if (popupRef.current && isOpen) {
			const data = dragDataRef.current;
			const centerX = Math.max(0, (window.innerWidth - data.currentWidth) / 2);
			const centerY = Math.max(0, (window.innerHeight - data.currentHeight) / 2);

			// Apply initial offset for staggered positioning
			const finalX = Math.max(
				0,
				Math.min(
					window.innerWidth - data.currentWidth,
					centerX + initialOffset.x,
				),
			);
			const finalY = Math.max(
				0,
				Math.min(
					window.innerHeight - data.currentHeight,
					centerY + initialOffset.y,
				),
			);

			data.currentX = finalX;
			data.currentY = finalY;

			const popup = popupRef.current;
			popup.style.left = "0px";
			popup.style.top = "0px";
			popup.style.transform = `translate(${finalX}px, ${finalY}px)`;
			popup.style.width = `${data.currentWidth}px`;
			popup.style.height = `${data.currentHeight}px`;
		}
	}, [isOpen, initialOffset.x, initialOffset.y]);

	React.useEffect(() => {
		if (isOpen) {
			// Small delay to ensure the popup is mounted
			requestAnimationFrame(initializePosition);
		}
	}, [isOpen, initializePosition]);

	// Cleanup
	React.useEffect(() => {
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
			document.body.style.cursor = "";
		};
	}, [handleMouseMove, handleMouseUp]);

	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={onOpenChange}
			modal={false}
			dismissible={false}
		>
			<Dialog.Portal>
				<Dialog.Popup
					ref={popupRef}
					className={cn(
						"bg-background data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 fixed z-50 flex flex-col gap-4 rounded-lg border p-0 shadow-lg duration-200 overflow-hidden",
						className,
					)}
					style={{
						left: "0px",
						top: "0px",
						width: `${defaultWidth}px`,
						height: `${defaultHeight}px`,
						minWidth: `${minWidth}px`,
						minHeight: `${minHeight}px`,
						willChange: "transform",
						transform: `translate(${dragDataRef.current.currentX}px, ${dragDataRef.current.currentY}px)`,
						transition: "opacity 200ms, transform 200ms",
					}}
				>
					{/* Header */}
					<div
						className={cn(
							"flex cursor-grab select-none items-center justify-between border-b px-6 py-4 active:cursor-grabbing gap-2",
						)}
						onMouseDown={handleDragStart}
						role="button"
						aria-label="Drag to move window"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
							}
						}}
					>
						<Dialog.Title
							className={cn("text-lg leading-none font-semibold")}
						>
							{title}
						</Dialog.Title>
						<Dialog.Close
							className={cn(
								"ring-offset-background focus:ring-ring data-[open]:bg-accent data-[open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
							)}
						>
							<XIcon />
							<span className="sr-only">Close</span>
						</Dialog.Close>
					</div>

					{/* Content */}
					<main className={cn("flex-1 overflow-auto p-6", contentClassName)}>
						{children}
					</main>

					{/* Resize handle */}
					<button
						type="button"
						className="resize-handle absolute bottom-0 right-0 h-4 w-4 cursor-nw-resize opacity-60 hover:opacity-100 transition-opacity border-0 bg-transparent p-0"
						onMouseDown={handleResizeStart}
						aria-label="Resize window"
						title="Drag to resize"
						style={{
							background: `
                linear-gradient(135deg, 
                  transparent 0%, 
                  transparent 40%, 
                  #94a3b8 40%, 
                  #94a3b8 45%, 
                  transparent 45%, 
                  transparent 55%, 
                  #94a3b8 55%, 
                  #94a3b8 60%, 
                  transparent 60%, 
                  transparent 70%, 
                  #94a3b8 70%, 
                  #94a3b8 75%, 
                  transparent 75%
                )
              `,
						}}
					/>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default DraggableWindow;
