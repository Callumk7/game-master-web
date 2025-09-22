import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import { Button } from "./ui/button";
import { Link } from "./ui/link";

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
	reorderTabs: (activeId: string, overId: string) => void;
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

	const reorderTabs = React.useCallback((activeId: string, overId: string) => {
		setTabList((prevTabs) => {
			const oldIndex = prevTabs.findIndex((tab) => tab.id === activeId);
			const newIndex = prevTabs.findIndex((tab) => tab.id === overId);

			if (oldIndex === -1 || newIndex === -1) {
				return prevTabs;
			}

			return arrayMove(prevTabs, oldIndex, newIndex);
		});
	}, []);

	const value = { tabList, addTab, removeTab, reorderTabs };

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

interface SortableTabProps {
	tab: Tab;
	onRemove: (id: string) => void;
	isDragActive: boolean;
}

function SortableTab({ tab, onRemove, isDragActive }: SortableTabProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: tab.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.7 : 1,
	};

	const handleClick = (e: React.MouseEvent) => {
		if (isDragActive) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<Link
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			to={tab.path}
			params={tab.params}
			variant={"outline"}
			size={"sm"}
			className="mr-0 pr-0 cursor-grab active:cursor-grabbing"
			onClick={handleClick}
		>
			{tab.label}
			<Button
				variant={"ghost"}
				size={"icon"}
				className="ml-auto mr-0"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onRemove(tab.id);
				}}
			>
				&times;
			</Button>
		</Link>
	);
}

export function EntityTabs() {
	const { tabList, removeTab, reorderTabs } = useEntityTabs();
	const [isDragActive, setIsDragActive] = React.useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragStart() {
		setIsDragActive(true);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		// Only reorder if we have a valid drop target that is actually a tab
		if (over?.id && active.id !== over.id) {
			const isValidTab = tabList.some((tab) => tab.id === over.id);
			if (isValidTab) {
				reorderTabs(String(active.id), String(over.id));
			}
			// If over.id exists but is not a valid tab (dropped outside), do nothing
		}
		// If over is null (dropped outside valid area), do nothing
		// The drag library will automatically return the item to its original position

		// Delay clearing the drag state to prevent the click from firing
		setTimeout(() => setIsDragActive(false), 100);
	}

	// TODO: Add pin button
	return (
		<nav className="flex gap-2 flex-wrap">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={tabList.map((tab) => tab.id)}
					strategy={horizontalListSortingStrategy}
				>
					{tabList.map((tab) => (
						<SortableTab
							key={tab.id}
							tab={tab}
							onRemove={removeTab}
							isDragActive={isDragActive}
						/>
					))}
				</SortableContext>
			</DndContext>
		</nav>
	);
}
