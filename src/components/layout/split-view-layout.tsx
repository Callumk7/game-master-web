import { PlusCircle, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { SplitViewProvider, useSplitView } from "~/state/split-view-context";
import type { EntityPath } from "~/types/split-view";
import { EntityPaneView } from "./entity-pane-view";
import { EntitySelectorModal } from "./entity-selector-modal";

interface SplitViewLayoutProps {
	gameId: string;
	leftPane?: string;
	rightPane?: string;
}

export function SplitViewLayout({ gameId, leftPane, rightPane }: SplitViewLayoutProps) {
	return (
		<SplitViewProvider
			gameId={gameId}
			initialLeftPane={leftPane}
			initialRightPane={rightPane}
		>
			<SplitViewLayoutContent gameId={gameId} />
		</SplitViewProvider>
	);
}

function SplitViewLayoutContent({ gameId }: { gameId: string }) {
	const {
		state,
		updatePanes,
		openLeftSelector,
		openRightSelector,
		closeSelectors,
		closeSplitView,
	} = useSplitView();

	const handleLeftPaneSelect = (entityPath: EntityPath) => {
		updatePanes(entityPath, state.rightPane);
		closeSelectors();
	};

	const handleRightPaneSelect = (entityPath: EntityPath) => {
		updatePanes(state.leftPane, entityPath);
		closeSelectors();
	};

	const clearLeftPane = () => {
		updatePanes(undefined, state.rightPane);
	};

	const clearRightPane = () => {
		updatePanes(state.leftPane, undefined);
	};

	return (
		<div className="h-full flex flex-col">
			{/* Split View Header */}
			<div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<h2 className="text-lg font-semibold">Split View</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={closeSplitView}
					className="h-8 w-8"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{/* Resizable Panes */}
			<div className="flex-1 overflow-hidden">
				<ResizablePanelGroup direction="horizontal" className="h-full">
					{/* Left Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<SplitPane
							title="Left Pane"
							entityPath={state.leftPane}
							gameId={gameId}
							onAddEntity={openLeftSelector}
							onClearEntity={clearLeftPane}
						/>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Right Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<SplitPane
							title="Right Pane"
							entityPath={state.rightPane}
							gameId={gameId}
							onAddEntity={openRightSelector}
							onClearEntity={clearRightPane}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			{/* Entity Selectors */}
			<EntitySelectorModal
				isOpen={state.leftSelectorOpen}
				onOpenChange={(open) => !open && closeSelectors()}
				gameId={gameId}
				onSelect={handleLeftPaneSelect}
				title="Select Entity for Left Pane"
			/>

			<EntitySelectorModal
				isOpen={state.rightSelectorOpen}
				onOpenChange={(open) => !open && closeSelectors()}
				gameId={gameId}
				onSelect={handleRightPaneSelect}
				title="Select Entity for Right Pane"
			/>
		</div>
	);
}

interface SplitPaneProps {
	title: string;
	entityPath?: EntityPath;
	gameId: string;
	onAddEntity: () => void;
	onClearEntity: () => void;
}

function SplitPane({
	title,
	entityPath,
	gameId,
	onAddEntity,
	onClearEntity,
}: SplitPaneProps) {
	return (
		<div className="h-full flex flex-col">
			<div className="flex items-center justify-between p-3 border-b bg-muted/50">
				<span className="text-sm font-medium">{title}</span>
				<div className="flex gap-2">
					{entityPath && (
						<Button variant="ghost" size="sm" onClick={onClearEntity}>
							<X className="h-3 w-3" />
						</Button>
					)}
					<Button variant="ghost" size="sm" onClick={onAddEntity}>
						<PlusCircle className="h-3 w-3" />
					</Button>
				</div>
			</div>
			<div className="flex-1 overflow-hidden">
				{entityPath ? (
					<EntityPaneView gameId={gameId} entityPath={entityPath} />
				) : (
					<EmptyPaneContent onAddEntity={onAddEntity} />
				)}
			</div>
		</div>
	);
}

function EmptyPaneContent({ onAddEntity }: { onAddEntity: () => void }) {
	return (
		<div className="flex items-center justify-center h-full text-muted-foreground">
			<div className="text-center">
				<PlusCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
				<p>Select an entity to view</p>
				<Button variant="outline" className="mt-2" onClick={onAddEntity}>
					Choose Entity
				</Button>
			</div>
		</div>
	);
}
