import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { EntityPane } from "./entity-pane";
import { Button } from "~/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { EntitySelector } from "./entity-selector";

interface SplitViewLayoutProps {
	gameId: string;
	leftPane?: string;
	rightPane?: string;
}

export function SplitViewLayout({ gameId, leftPane, rightPane }: SplitViewLayoutProps) {
	const navigate = useNavigate();
	const [leftSelectorOpen, setLeftSelectorOpen] = React.useState(false);
	const [rightSelectorOpen, setRightSelectorOpen] = React.useState(false);

	const updatePanes = React.useCallback((newLeft?: string, newRight?: string) => {
		navigate({
			search: {
				left: newLeft,
				right: newRight,
			},
		});
	}, [navigate]);

	const closeSplitView = React.useCallback(() => {
		navigate({ to: "/games/$gameId", params: { gameId } });
	}, [navigate, gameId]);

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
			<div className="flex-1">
				<ResizablePanelGroup direction="horizontal">
					{/* Left Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<div className="h-full flex flex-col">
							<div className="flex items-center justify-between p-3 border-b bg-muted/50">
								<span className="text-sm font-medium">Left Pane</span>
								<div className="flex gap-2">
									{leftPane && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updatePanes(undefined, rightPane)}
										>
											<X className="h-3 w-3" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setLeftSelectorOpen(true)}
									>
										<PlusCircle className="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div className="flex-1 overflow-hidden">
								{leftPane ? (
									<EntityPane
										gameId={gameId}
										entityPath={leftPane}
										onEntityChange={(newPath) => updatePanes(newPath, rightPane)}
									/>
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<div className="text-center">
											<PlusCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
											<p>Select an entity to view</p>
											<Button
												variant="outline"
												className="mt-2"
												onClick={() => setLeftSelectorOpen(true)}
											>
												Choose Entity
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Right Pane */}
					<ResizablePanel defaultSize={50} minSize={30}>
						<div className="h-full flex flex-col">
							<div className="flex items-center justify-between p-3 border-b bg-muted/50">
								<span className="text-sm font-medium">Right Pane</span>
								<div className="flex gap-2">
									{rightPane && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => updatePanes(leftPane, undefined)}
										>
											<X className="h-3 w-3" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setRightSelectorOpen(true)}
									>
										<PlusCircle className="h-3 w-3" />
									</Button>
								</div>
							</div>
							<div className="flex-1 overflow-hidden">
								{rightPane ? (
									<EntityPane
										gameId={gameId}
										entityPath={rightPane}
										onEntityChange={(newPath) => updatePanes(leftPane, newPath)}
									/>
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<div className="text-center">
											<PlusCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
											<p>Select an entity to view</p>
											<Button
												variant="outline"
												className="mt-2"
												onClick={() => setRightSelectorOpen(true)}
											>
												Choose Entity
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>

			{/* Entity Selectors */}
			<EntitySelector
				isOpen={leftSelectorOpen}
				onOpenChange={setLeftSelectorOpen}
				gameId={gameId}
				onSelect={(entityPath) => {
					updatePanes(entityPath, rightPane);
					setLeftSelectorOpen(false);
				}}
				title="Select Entity for Left Pane"
			/>

			<EntitySelector
				isOpen={rightSelectorOpen}
				onOpenChange={setRightSelectorOpen}
				gameId={gameId}
				onSelect={(entityPath) => {
					updatePanes(leftPane, entityPath);
					setRightSelectorOpen(false);
				}}
				title="Select Entity for Right Pane"
			/>
		</div>
	);
}