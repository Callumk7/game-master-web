import { useNavigate } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import * as React from "react";
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
	leftPane?: string;
	rightPane?: string;
}

function parseEntityPath(entityPath?: string): EntityPath | undefined {
	if (!entityPath) return undefined;
	const [type, id] = entityPath.split("/");
	return {
		type: type as EntityPath["type"],
		id,
	};
}

function serializeEntityPath(entityPath?: EntityPath): string | undefined {
	if (!entityPath) return undefined;
	return `${entityPath.type}/${entityPath.id}`;
}

export function SplitViewLayout({ gameId, leftPane, rightPane }: SplitViewLayoutProps) {
	return (
		<SplitViewLayoutContent
			gameId={gameId}
			initialLeftPane={leftPane}
			initialRightPane={rightPane}
		/>
	);
}

function SplitViewLayoutContent({
	gameId,
	initialLeftPane,
	initialRightPane,
}: {
	gameId: string;
	initialLeftPane?: string;
	initialRightPane?: string;
}) {
	const navigate = useNavigate({ from: "/games/$gameId/split" });
	const leftPane = useSplitViewLeftPane();
	const rightPane = useSplitViewRightPane();
	const leftSelectorOpen = useSplitViewLeftSelectorOpen();
	const rightSelectorOpen = useSplitViewRightSelectorOpen();
	const {
		updateSplitViewPanes,
		openSplitViewLeftSelector,
		openSplitViewRightSelector,
		closeSplitViewSelectors,
		clearSplitView,
	} = useUIActions();

	// Initialize from URL on mount
	React.useEffect(() => {
		const parsedLeft = parseEntityPath(initialLeftPane);
		const parsedRight = parseEntityPath(initialRightPane);
		updateSplitViewPanes(parsedLeft, parsedRight);

		// Cleanup on unmount
		return () => {
			clearSplitView();
		};
	}, [initialLeftPane, initialRightPane, updateSplitViewPanes, clearSplitView]);

	// Sync zustand state to URL when panes change
	React.useEffect(() => {
		navigate({
			search: {
				left: serializeEntityPath(leftPane),
				right: serializeEntityPath(rightPane),
			},
		});
	}, [leftPane, rightPane, navigate]);

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
