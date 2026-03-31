import { useReactFlow } from "@xyflow/react";
import { Maximize, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useCanvasActions } from "~/state/canvas";
import { AddEntityDialog } from "./add-entity-dialog";

// ---------------------------------------------------------------------------
// Canvas Toolbar
// ---------------------------------------------------------------------------

interface CanvasToolbarProps {
	gameId: string;
}

export function CanvasToolbar({ gameId }: CanvasToolbarProps) {
	const [addDialogOpen, setAddDialogOpen] = React.useState(false);
	const { clearCanvas } = useCanvasActions();
	const reactFlow = useReactFlow();

	const handleFitView = React.useCallback(() => {
		reactFlow.fitView({ padding: 0.2, duration: 300 });
	}, [reactFlow]);

	const handleClear = React.useCallback(() => {
		toast("Clear canvas?", {
			description: "This will remove all nodes and edges from the canvas.",
			action: {
				label: "Clear",
				onClick: () => {
					clearCanvas(gameId);
					toast.success("Canvas cleared");
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
		});
	}, [clearCanvas, gameId]);

	return (
		<>
			<div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-card/80 p-1 shadow-md backdrop-blur-sm">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setAddDialogOpen(true)}
					aria-label="Add entity"
				>
					<Plus className="size-4" />
					<span className="sr-only sm:not-sr-only sm:ml-1">Add</span>
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleFitView}
					aria-label="Fit view"
				>
					<Maximize className="size-4" />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					aria-label="Clear canvas"
				>
					<Trash2 className="size-4" />
				</Button>
			</div>

			<AddEntityDialog
				gameId={gameId}
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
			/>
		</>
	);
}
