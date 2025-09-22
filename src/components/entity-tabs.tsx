import * as React from "react";
import { Link } from "./ui/link";
import { Button } from "./ui/button";

export interface Tab {
	id: string; // A unique identifier, e.g., 'character-456'
	label: string; // The text to display, e.g., 'Character 456'
	path: string; // The URL path, e.g., '/games/123/characters/456'
	params: {
		gameId: string;
		id: string;
	};
}

// Define the shape of the context's value
interface EntityTabsContextType {
	tabList: Tab[];
	addTab: (tab: Tab) => void;
	removeTab: (tabId: string) => void;
}

const EntityTabsContext = React.createContext<EntityTabsContextType | undefined>(
	undefined,
);

export const EntityTabsProvider = ({ children }: { children: React.ReactNode }) => {
	const [tabList, setTabList] = React.useState<Tab[]>([]);

	const addTab = React.useCallback((newTab: Tab) => {
		setTabList((prevTabs) => {
			// Check if a tab with the same ID already exists
			if (prevTabs.some((tab) => tab.id === newTab.id)) {
				return prevTabs; // If so, return the existing list
			}
			return [...prevTabs, newTab]; // Otherwise, add the new tab
		});
	}, []);

	const removeTab = React.useCallback((tabId: string) => {
		setTabList((prevTabs) => prevTabs.filter((t) => t.id !== tabId));
	}, []);

	const value = { tabList, addTab, removeTab };

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

export const useAddTab = (tab: Tab) => {
	const { addTab } = useEntityTabs();
	React.useEffect(() => {
		if (tab.id) {
			addTab(tab);
		}
	}, [tab, addTab]);
};

export function EntityTabs() {
	const { tabList, removeTab } = useEntityTabs();
	// TODO: Add pin button
	// TODO: Add drag to reorder
	return (
		<nav className="flex gap-2">
			{tabList.map((tab) => (
				<Link
					key={tab.id}
					to={tab.path}
					params={tab.params}
					variant={"outline"}
					size={"sm"}
					className="mr-0 pr-0"
				>
					{tab.label}
					<Button
						variant={"ghost"}
						size={"icon"}
						className="ml-auto mr-0"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeTab(tab.id);
						}}
					>
						&times;
					</Button>
				</Link>
			))}
		</nav>
	);
}
