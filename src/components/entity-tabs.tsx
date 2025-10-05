import { useNavigate } from "@tanstack/react-router";
import { SplitSquareHorizontal } from "lucide-react";
import * as React from "react";
import type { Optional } from "~/types";
import { Button } from "./ui/button";
import { Link } from "./ui/link";

export interface Tab {
	data: {
		id: string;
		name: string;
	};
	entityType: string; // e.g., 'characters', 'factions', 'notes'
	gameId: string;
}

// Define the shape of the context's value
interface EntityTabsContextType {
	tabList: Tab[];
	addTab: (tab: Tab) => void;
	removeTab: (tabId: string) => void;
	clearAllTabs: () => void;
}

const EntityTabsContext = React.createContext<EntityTabsContextType | undefined>(
	undefined,
);

export const EntityTabsProvider = ({ children }: { children: React.ReactNode }) => {
	const [tabList, setTabList] = React.useState<Tab[]>([]);

	const addTab = React.useCallback((newTab: Tab) => {
		setTabList((prevTabs) => {
			// Check if a tab with the same ID already exists
			if (prevTabs.some((tab) => tab.data.id === newTab.data.id)) {
				return prevTabs; // If so, return the existing list
			}
			return [...prevTabs, newTab]; // Otherwise, add the new tab
		});
	}, []);

	const removeTab = React.useCallback((tabId: string) => {
		setTabList((prevTabs) => prevTabs.filter((t) => t.data.id !== tabId));
	}, []);

	const clearAllTabs = React.useCallback(() => {
		setTabList([]);
	}, []);

	const value = { tabList, addTab, removeTab, clearAllTabs };

	return (
		<EntityTabsContext.Provider value={value}>{children}</EntityTabsContext.Provider>
	);
};

export const useEntityTabs = () => {
	const context = React.useContext(EntityTabsContext);
	if (context === undefined) {
		throw new Error("useEntityTabs must be used within an EntityTabsProvider");
	}
	return context;
};

export const useAddTab = (tab: Optional<Tab, "data">) => {
	const { addTab } = useEntityTabs();
	React.useEffect(() => {
		if (tab.data) {
			addTab(tab as Tab);
		}
	}, [tab, addTab]);
};

export function EntityTabs() {
	const { tabList, removeTab, clearAllTabs } = useEntityTabs();
	const navigate = useNavigate();

	const openTabsInSplitView = () => {
		if (tabList.length >= 2) {
			const firstTab = tabList[0];
			const secondTab = tabList[1];

			navigate({
				to: "/games/$gameId/split",
				params: { gameId: firstTab.gameId },
				search: {
					left: `${firstTab.entityType}/${firstTab.data.id}`,
					right: `${secondTab.entityType}/${secondTab.data.id}`,
				},
			});
		}
	};

	// TODO: Add pin button
	// TODO: Add drag to reorder
	return (
		<nav className="sticky top-[73px] flex gap-2 flex-wrap w-full border-b px-1 items-center backdrop-blur-md bg-background/80 z-10">
			{tabList.map((tab) => {
				// Construct the path dynamically to prevent staleness
				const path = `/games/${tab.gameId}/${tab.entityType}/${tab.data.id}/`;
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
		</nav>
	);
}
