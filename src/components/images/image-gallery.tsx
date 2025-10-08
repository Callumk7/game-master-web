import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon, StarIcon, TrashIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { Image } from "~/api";
import {
	deleteEntityImageMutation,
	listEntityImagesQueryKey,
	setEntityImageAsPrimaryMutation,
	useListEntityImagesQuery,
} from "~/api/@tanstack/react-query.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogOverlay } from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/ui/spinner";
import { SERVER_URL } from "~/routes/__root";

type ImageGalleryType = "character" | "faction" | "location" | "quest";

interface ImageGalleryProps {
	gameId: string;
	entityId: string;
	entityType: ImageGalleryType;
}

interface ImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	image: Image;
}

// TODO: improve image modal
function ImageModal({ isOpen, onClose, image }: ImageModalProps) {
	return (
		<Dialog open={isOpen}>
			<DialogOverlay onClick={onClose} />
			<DialogContent
				className="max-w-[95vw] max-h-[95vh] p-0 border-0"
				showCloseButton={false}
			>
				<div className="relative">
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background rounded-full"
						onClick={onClose}
						aria-label="Close image modal"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</Button>
					<img
						src={`${SERVER_URL}/${image.file_url}`}
						alt={image.alt_text || "Image"}
						className="max-h-[90vh] w-full object-contain rounded-lg"
					/>
					{image.alt_text && (
						<div className="p-4 border-t bg-muted/30">
							<p className="text-sm text-muted-foreground">
								{image.alt_text}
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function ImageGallery({ gameId, entityId, entityType }: ImageGalleryProps) {
	const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);
	const queryClient = useQueryClient();

	const {
		data: imageData,
		isLoading,
		isError,
	} = useListEntityImagesQuery({
		path: { game_id: gameId, entity_type: entityType, entity_id: entityId },
	});

	const setPrimaryMutation = useMutation({
		...setEntityImageAsPrimaryMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: listEntityImagesQueryKey({
					path: {
						game_id: gameId,
						entity_type: entityType,
						entity_id: entityId,
					},
				}),
			});
			toast.success("Primary image updated");
		},
		onError: (error) => {
			console.error("Set primary error:", error);
			toast.error("Failed to set primary image");
		},
	});

	const handleSetPrimary = (imageId: string) => {
		setPrimaryMutation.mutate({
			path: {
				game_id: gameId,
				entity_type: entityType,
				entity_id: entityId,
				id: imageId,
			},
		});
	};

	const deleteMutation = useMutation({
		...deleteEntityImageMutation(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: listEntityImagesQueryKey({
					path: {
						game_id: gameId,
						entity_type: entityType,
						entity_id: entityId,
					},
				}),
			});
			toast.success("Image deleted");
		},
		onError: (error) => {
			console.error("Delete error:", error);
			toast.error("Failed to delete image");
		},
	});

	const handleDelete = (imageId: string) => {
		deleteMutation.mutate({
			path: {
				game_id: gameId,
				entity_type: entityType,
				entity_id: entityId,
				id: imageId,
			},
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-3">
						<Spinner size="lg" />
						<p className="text-sm text-muted-foreground">Loading images...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="rounded-full bg-destructive/10 p-3">
							<svg
								className="h-6 w-6 text-destructive"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<div>
							<p className="font-medium text-destructive">
								Failed to load images
							</p>
							<p className="text-sm text-muted-foreground">
								There was an error loading the image gallery
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	const images = imageData?.data || [];

	if (images.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-3 text-center">
						<div className="rounded-full bg-muted p-3">
							<svg
								className="h-6 w-6 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
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
								Upload some images to get started
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Images</CardTitle>
						<Badge variant="secondary">
							{images.length} {images.length === 1 ? "image" : "images"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
						{images.map((image) => (
							<div
								key={image.id}
								className="group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all hover:shadow-md"
							>
								{image.is_primary && (
									<div className="absolute top-2 left-2 z-10">
										<Badge
											variant="default"
											size="sm"
											className="bg-yellow-500 text-yellow-900"
										>
											<StarIcon className="h-3 w-3 mr-1" />
											Primary
										</Badge>
									</div>
								)}
								<button
									type="button"
									className="absolute inset-0 cursor-pointer"
									onClick={() => setSelectedImage(image)}
									aria-label={`View image: ${image.alt_text || "Untitled"}`}
								>
									<img
										src={`${SERVER_URL}/${image.file_url}`}
										alt={image.alt_text || "Image"}
										className="h-full w-full object-cover transition-transform group-hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
									<div className="absolute bottom-2 left-2 right-2 transform translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
										<div className="flex items-center justify-between">
											<Badge
												variant="secondary"
												size="sm"
												className="bg-background/80 text-xs"
											>
												<svg
													className="h-3 w-3 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
													/>
												</svg>
												View
											</Badge>
										</div>
									</div>
								</button>
								<div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
									<DropdownMenu>
										<DropdownMenuTrigger
											render={(props) => (
												<Button
													{...props}
													variant="ghost"
													size="icon"
													className="bg-background/80 hover:bg-background rounded-full h-8 w-8"
													onClick={(e) => {
														e.stopPropagation();
														props.onClick?.(e);
													}}
													aria-label="Image options"
												>
													<MoreHorizontalIcon className="h-4 w-4" />
												</Button>
											)}
										/>
										<DropdownMenuPositioner align="end">
											<DropdownMenuContent>
												{!image.is_primary && (
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															handleSetPrimary(image.id);
														}}
														disabled={
															setPrimaryMutation.isPending
														}
													>
														<StarIcon className="h-4 w-4 mr-2" />
														Set as Primary
													</DropdownMenuItem>
												)}
												{image.is_primary && (
													<DropdownMenuItem disabled>
														<StarIcon className="h-4 w-4 mr-2" />
														Primary Image
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(image.id);
													}}
													disabled={deleteMutation.isPending}
												>
													<TrashIcon className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenuPositioner>
									</DropdownMenu>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{selectedImage && (
				<ImageModal
					isOpen={!!selectedImage}
					onClose={() => setSelectedImage(null)}
					image={selectedImage}
				/>
			)}
		</>
	);
}
