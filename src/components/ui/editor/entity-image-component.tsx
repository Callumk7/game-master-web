import { useQuery } from "@tanstack/react-query";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type * as React from "react";
import { getEntityImageOptions } from "~/api/@tanstack/react-query.gen";
import { SERVER_URL } from "~/routes/__root";
import type { EntityType } from "~/types";
import { cn } from "~/utils/cn";

interface EntityImageAttributes {
	imageId: string;
	entityId: string;
	entityType: EntityType;
	gameId: string;
	alt?: string;
	width?: number;
	height?: number;
}

export const EntityImageComponent: React.FC<ReactNodeViewProps> = ({ node }) => {
	const { imageId, entityId, entityType, gameId, alt, width, height } =
		node.attrs as EntityImageAttributes;

	const {
		data: imageData,
		isLoading,
		isError,
	} = useQuery({
		...getEntityImageOptions({
			path: {
				game_id: gameId,
				entity_type: entityType,
				entity_id: entityId,
				id: imageId,
			},
		}),
		enabled: !!imageId && !!entityId && !!entityType && !!gameId,
	});

	if (isLoading) {
		return (
			<NodeViewWrapper className="my-4">
				<div className="flex items-center justify-center p-8 bg-muted rounded-lg">
					<div className="flex flex-col items-center gap-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						<p className="text-sm text-muted-foreground">Loading image...</p>
					</div>
				</div>
			</NodeViewWrapper>
		);
	}

	if (isError || !imageData?.data) {
		return (
			<NodeViewWrapper className="my-4">
				<div className="flex items-center justify-center p-8 bg-destructive/10 rounded-lg border border-destructive/20">
					<div className="flex flex-col items-center gap-2 text-center">
						<svg
							className="h-12 w-12 text-destructive/50"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<title>Image not found</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6"
							/>
						</svg>
						<div>
							<p className="font-medium text-destructive">
								Image not found
							</p>
							<p className="text-sm text-muted-foreground">
								This image may have been deleted
							</p>
						</div>
					</div>
				</div>
			</NodeViewWrapper>
		);
	}

	const imageUrl = `${SERVER_URL}/${imageData.data.file_url}`;
	const imageAlt = alt || imageData.data.alt_text || imageData.data.filename;

	return (
		<NodeViewWrapper className="my-4">
			<img
				src={imageUrl}
				alt={imageAlt}
				className={cn(
					"editor-image rounded-lg max-w-full h-auto",
					"border border-border shadow-sm",
				)}
				style={{
					width: width ? `${width}px` : undefined,
					height: height ? `${height}px` : undefined,
				}}
			/>
		</NodeViewWrapper>
	);
};
