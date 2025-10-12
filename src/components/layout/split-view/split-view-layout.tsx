import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import { SplitViewProvider, useSplitView } from "~/state/split-view-context";
import type { EntityPath } from "~/types/split-view";
import { CharacterPaneView } from "./character-pane-view";
import { EntitySelectorModal } from "./entity-selector-modal";
import { FactionPaneView } from "./faction-pane-view";
import { LocationPaneView } from "./location-pane-view";
import { NotePaneView } from "./note-pane-view";
import { QuestPaneView } from "./quest-pane-view";

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
	const { state, updatePanes, openLeftSelector, openRightSelector, closeSelectors } =
		useSplitView();

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
			{/* Resizable Panes */}
			<div className="flex-1 overflow-hidden">
				<ResizablePanelGroup direction="horizontal" className="h-full">
					{/* Left Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<SplitPane
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
	entityPath?: EntityPath;
	gameId: string;
	onAddEntity: () => void;
	onClearEntity: () => void;
}

function SplitPane({ entityPath, gameId, onAddEntity, onClearEntity }: SplitPaneProps) {
	const renderEntityPane = () => {
		if (!entityPath) {
			return <EmptyPaneContent onAddEntity={onAddEntity} />;
		}

		const commonProps = {
			gameId,
			onClearEntity,
			onAddEntity,
		};

		switch (entityPath.type) {
			case "characters":
				return <CharacterPaneView {...commonProps} characterId={entityPath.id} />;
			case "factions":
				return <FactionPaneView {...commonProps} factionId={entityPath.id} />;
			case "locations":
				return <LocationPaneView {...commonProps} locationId={entityPath.id} />;
			case "notes":
				return <NotePaneView {...commonProps} noteId={entityPath.id} />;
			case "quests":
				return <QuestPaneView {...commonProps} questId={entityPath.id} />;
			default:
				return <EmptyPaneContent onAddEntity={onAddEntity} />;
		}
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 overflow-hidden">{renderEntityPane()}</div>
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
