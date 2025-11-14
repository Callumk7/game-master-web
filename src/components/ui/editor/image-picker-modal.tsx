import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import type { Image } from "~/api";
import { listGameImagesOptions } from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { SERVER_URL } from "~/routes/__root";
import { cn } from "~/utils/cn";

interface ImagePickerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	gameId: string;
	onInsert: (image: Image) => void;
}

export function ImagePickerModal({
	open,
	onOpenChange,
	gameId,
	onInsert,
}: ImagePickerModalProps) {
	const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);

	const { data: imagesData, isLoading } = useQuery({
		...listGameImagesOptions({
			path: { game_id: gameId },
		}),
		enabled: open,
	});

	const handleInsert = () => {
		if (selectedImage) {
			onInsert(selectedImage);
			setSelectedImage(null);
		}
	};

	const handleCancel = () => {
		setSelectedImage(null);
		onOpenChange(false);
	};

	// Reset selection when modal closes
	React.useEffect(() => {
		if (!open) {
			setSelectedImage(null);
		}
	}, [open]);

	const images = imagesData?.data || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Insert Image</DialogTitle>
					<DialogDescription>
						Select an image from your game to insert into the editor
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto py-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="flex flex-col items-center gap-3">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
								<p className="text-sm text-muted-foreground">
									Loading images...
								</p>
							</div>
						</div>
					) : images.length === 0 ? (
						<div className="flex items-center justify-center py-12">
							<div className="flex flex-col items-center gap-3 text-center">
								<div className="rounded-full bg-muted p-3">
									<svg
										className="h-8 w-8 text-muted-foreground"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<title>No images</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div>
									<p className="font-medium">No images yet</p>
									<p className="text-sm text-muted-foreground">
										Upload some images first to insert them here
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-3 gap-4">
							{images.map((image) => (
								<button
									type="button"
									key={image.id}
									onClick={() => setSelectedImage(image)}
									className={cn(
										"relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group",
										"hover:border-primary/50 hover:shadow-lg",
										selectedImage?.id === image.id
											? "border-primary shadow-lg ring-2 ring-primary/20"
											: "border-border",
									)}
								>
									<img
										src={`${SERVER_URL}/${image.file_url}`}
										alt={image.alt_text || image.filename}
										className="w-full h-full object-cover"
									/>
									<div
										className={cn(
											"absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
											selectedImage?.id === image.id
												? "opacity-100"
												: "opacity-0 group-hover:opacity-100",
										)}
									>
										{selectedImage?.id === image.id && (
											<svg
												className="h-8 w-8 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>Selected</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</div>
									{image.is_primary && (
										<div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
											Primary
										</div>
									)}
								</button>
							))}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleInsert} disabled={!selectedImage}>
						Insert Image
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
