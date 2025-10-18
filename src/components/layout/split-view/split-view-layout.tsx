import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
	useSplitViewLeftPane,
	useSplitViewLeftSelectorOpen,
	useSplitViewRightPane,
	useSplitViewRightSelectorOpen,
	useUIActions,
} from "~/state/ui";
import type { EntityPath } from "~/types/split-view";
import { CharacterPaneView } from "./character-pane-view";
import { EntitySelectorModal } from "./entity-selector-modal";
import { FactionPaneView } from "./faction-pane-view";
import { LocationPaneView } from "./location-pane-view";
import { NotePaneView } from "./note-pane-view";
import { QuestPaneView } from "./quest-pane-view";

interface SplitViewLayoutProps {
	gameId: string;
}

export function SplitViewLayout({ gameId }: SplitViewLayoutProps) {
	return <SplitViewLayoutContent gameId={gameId} />;
}

function SplitViewLayoutContent({ gameId }: { gameId: string }) {
	const leftPane = useSplitViewLeftPane();
	const rightPane = useSplitViewRightPane();
	const leftSelectorOpen = useSplitViewLeftSelectorOpen();
	const rightSelectorOpen = useSplitViewRightSelectorOpen();
	const {
		updateSplitViewPanes,
		openSplitViewLeftSelector,
		openSplitViewRightSelector,
		closeSplitViewSelectors,
	} = useUIActions();

	const handleLeftPaneSelect = (entityPath: EntityPath) => {
		updateSplitViewPanes(entityPath, rightPane);
		closeSplitViewSelectors();
	};

	const handleRightPaneSelect = (entityPath: EntityPath) => {
		updateSplitViewPanes(leftPane, entityPath);
		closeSplitViewSelectors();
	};

	const clearLeftPane = () => {
		updateSplitViewPanes(undefined, rightPane);
	};

	const clearRightPane = () => {
		updateSplitViewPanes(leftPane, undefined);
	};

	return (
		<div className="h-full flex flex-col">
			{/* Resizable Panes */}
			<div className="flex-1 overflow-hidden">
				<ResizablePanelGroup direction="horizontal" className="h-full">
					{/* Left Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<SplitPane
							entityPath={leftPane}
							gameId={gameId}
							onAddEntity={openSplitViewLeftSelector}
							onClearEntity={clearLeftPane}
						/>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Right Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<SplitPane
							entityPath={rightPane}
							gameId={gameId}
							onAddEntity={openSplitViewRightSelector}
							onClearEntity={clearRightPane}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			{/* Entity Selectors */}
			<EntitySelectorModal
				isOpen={leftSelectorOpen}
				onOpenChange={(open) => !open && closeSplitViewSelectors()}
				gameId={gameId}
				onSelect={handleLeftPaneSelect}
				title="Select Entity for Left Pane"
			/>

			<EntitySelectorModal
				isOpen={rightSelectorOpen}
				onOpenChange={(open) => !open && closeSplitViewSelectors()}
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
			case "character":
				return <CharacterPaneView {...commonProps} characterId={entityPath.id} />;
			case "faction":
				return <FactionPaneView {...commonProps} factionId={entityPath.id} />;
			case "location":
				return <LocationPaneView {...commonProps} locationId={entityPath.id} />;
			case "note":
				return <NotePaneView {...commonProps} noteId={entityPath.id} />;
			case "quest":
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
