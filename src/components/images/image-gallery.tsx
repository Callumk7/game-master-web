import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon, StarIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
	deleteEntityImageMutation,
	getEntityPrimaryImageOptions,
	listEntityImagesQueryKey,
	setEntityImageAsPrimaryMutation,
	useListEntityImagesQuery,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Spinner } from "~/components/ui/spinner";
import type { EntityType } from "~/types";
import { type ImageControlsProps, ImageGrid } from "./image-grid";

interface ImageGalleryProps {
	gameId: string;
	entityId: string;
	entityType: EntityType;
}

export function ImageGallery({ gameId, entityId, entityType }: ImageGalleryProps) {
	const {
		data: imageData,
		isLoading,
		isError,
	} = useListEntityImagesQuery({
		path: { game_id: gameId, entity_type: entityType, entity_id: entityId },
	});

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

	return <ImageGrid gameId={gameId} images={images} ImageControls={ImageControls} />;
}

function ImageControls({ gameId, image, entityId, entityType }: ImageControlsProps) {
	const queryClient = useQueryClient();
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
		setPrimaryMutation.mutate(
			{
				path: {
					game_id: gameId,
					entity_type: entityType,
					entity_id: entityId,
					id: imageId,
				},
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries(
						getEntityPrimaryImageOptions({
							path: {
								game_id: gameId,
								entity_type: entityType,
								entity_id: entityId,
							},
						}),
					);
				},
			},
		);
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
	return (
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
								disabled={setPrimaryMutation.isPending}
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
	);
}
