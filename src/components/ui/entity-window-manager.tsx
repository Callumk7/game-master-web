import { useParams } from "@tanstack/react-router";
import DraggableWindow from "~/components/draggable";
import { Badge } from "~/components/ui/badge";
import { TiptapViewer } from "~/components/ui/editor/viewer";
import { useEntityWindows, useUIActions } from "~/state/ui";

export function EntityWindowManager() {
	const params = useParams({ from: "/_auth/games/$gameId" });
	const entityWindows = useEntityWindows();
	const { closeEntityWindow, bringWindowToFront } = useUIActions();

	const openWindows = entityWindows.filter((window) => window.isOpen);

	if (openWindows.length === 0) {
		return null;
	}

	return (
		<>
			{openWindows.map((window) => (
				<DraggableWindow
					key={window.id}
					isOpen={window.isOpen}
					onOpenChange={(open) => {
						if (!open) {
							closeEntityWindow(window.id);
						}
					}}
					title={window.entity.name}
					defaultWidth={window.size?.width ?? 600}
					defaultHeight={window.size?.height ?? 400}
					minWidth={400}
					minHeight={300}
					initialOffset={window.position ?? { x: 0, y: 0 }}
					zIndex={window.zIndex}
					onBringToFront={() => bringWindowToFront(window.id)}
					entityId={window.entity.id}
					entityType={window.entity.type}
					gameId={params.gameId}
				>
					<div className="prose prose-sm max-w-none">
						<div className="mb-4">
							<Badge>{window.entity.type}</Badge>
						</div>
						{window.entity.content && (
							<TiptapViewer content={window.entity.content} />
						)}
						{!window.entity.content && window.entity.description_meta && (
							<div className="text-sm text-muted-foreground">
								{window.entity.description_meta}
							</div>
						)}
						{!window.entity.content && !window.entity.description_meta && (
							<div className="text-sm text-muted-foreground">
								No content available for this {window.entity.type}.
							</div>
						)}
					</div>
				</DraggableWindow>
			))}
		</>
	);
}
