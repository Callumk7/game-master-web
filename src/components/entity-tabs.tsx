import { useNavigate } from "@tanstack/react-router";
import { SplitSquareHorizontal } from "lucide-react";
import * as React from "react";
import { type Tab, useTabList, useUIActions } from "~/state/ui";
import type { Optional } from "~/types";
import { pluralise } from "~/utils/pluralise";
import { Button } from "./ui/button";
import { Link } from "./ui/link";
import { ScrollArea } from "./ui/scroll-area";

export const useAddTab = (tab: Optional<Tab, "data">) => {
	const { addTab } = useUIActions();
	React.useEffect(() => {
		if (tab.data) {
			addTab(tab as Tab);
		}
	}, [tab, addTab]);
};

export function EntityTabs({ gameId }: { gameId: string }) {
	const tabList = useTabList();
	const { removeTab, clearAllTabs } = useUIActions();
	const navigate = useNavigate();

	const openTabsInSplitView = () => {
		if (tabList.length >= 2) {
			navigate({
				to: "/games/$gameId/split",
				params: { gameId },
			});
		}
	};

	// TODO: Add pin button
	// TODO: Add drag to reorder
	return (
		<nav className="sticky top-[73px] left-0 right-0 gap-2 border-b backdrop-blur-md bg-background/80 z-10">
			<ScrollArea className="px-1">
				<div className="flex items-center gap-2 py-1">
					{tabList.length >= 2 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
							onClick={openTabsInSplitView}
							title="Open first two tabs in split view"
						>
							<SplitSquareHorizontal className="h-3 w-3 mr-1" />
							Split View
						</Button>
					)}
					{tabList.map((tab) => {
						// Construct the path dynamically to prevent staleness
						const path = `/games/${tab.gameId}/${pluralise(tab.entityType)}/${tab.data.id}/`;
						const params = { gameId: tab.gameId, id: tab.data.id };

						return (
							<Link
								key={tab.data.id}
								to={path}
								params={params}
								variant={"ghost"}
								size={"sm"}
								className="mr-0 pr-0"
								activeProps={{
									variant: "outline",
								}}
							>
								{tab.data.name}
								<Button
									variant={"ghost"}
									size={"icon"}
									className="ml-auto mr-0"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										removeTab(tab.data.id);
									}}
								>
									&times;
								</Button>
							</Link>
						);
					})}
					{tabList.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="ml-auto text-muted-foreground hover:text-foreground"
							onClick={clearAllTabs}
							title="Clear all tabs"
						>
							Clear All
						</Button>
					)}
				</div>
			</ScrollArea>
		</nav>
	);
}
