import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useImageViewer } from "../hooks/use-image-viewer";
import type { ImageModalProps } from "../types";

export function ImageModal({
	image,
	isOpen,
	onOpenChange,
	config = {},
}: ImageModalProps) {
	const viewer = useImageViewer({ image, config });

	// biome-ignore lint/correctness/useExhaustiveDependencies: We need to reset the view when the image changes, not when the view is reset
	React.useEffect(() => {
		if (isOpen) {
			viewer.actions.resetView();
		}
	}, [image.id, isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} dismissible={true}>
			<DialogContent
				className="min-w-fit min-h-fit p-0 gap-4"
				style={{
					width: viewer.dialogSize.width,
					height: viewer.dialogSize.height,
					maxWidth: viewer.dialogSize.maxWidth,
					maxHeight: viewer.dialogSize.maxHeight,
				}}
			>
				<DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0 max-h-10">
					<DialogTitle>Image: {image.alt_text || "Untitled"}</DialogTitle>
				</DialogHeader>
				{viewer.render()}
			</DialogContent>
		</Dialog>
	);
}
