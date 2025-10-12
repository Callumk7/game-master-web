import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import type {
	EntityPath,
	SplitViewContextValue,
	SplitViewState,
} from "~/types/split-view";

const SplitViewContext = React.createContext<SplitViewContextValue | null>(null);

interface SplitViewProviderProps {
	children: React.ReactNode;
	gameId: string;
	initialLeftPane?: string;
	initialRightPane?: string;
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

export function SplitViewProvider({
	children,
	gameId,
	initialLeftPane,
	initialRightPane,
}: SplitViewProviderProps) {
	const navigate = useNavigate({ from: "/games/$gameId/split" });

	const [state, setState] = React.useState<SplitViewState>({
		leftPane: parseEntityPath(initialLeftPane),
		rightPane: parseEntityPath(initialRightPane),
		leftSelectorOpen: false,
		rightSelectorOpen: false,
	});

	const updatePanes = React.useCallback(
		(leftPane?: EntityPath, rightPane?: EntityPath) => {
			setState((prev) => ({
				...prev,
				leftPane,
				rightPane,
			}));

			navigate({
				search: {
					left: serializeEntityPath(leftPane),
					right: serializeEntityPath(rightPane),
				},
			});
		},
		[navigate],
	);

	const openLeftSelector = React.useCallback(() => {
		setState((prev) => ({ ...prev, leftSelectorOpen: true }));
	}, []);

	const openRightSelector = React.useCallback(() => {
		setState((prev) => ({ ...prev, rightSelectorOpen: true }));
	}, []);

	const closeSelectors = React.useCallback(() => {
		setState((prev) => ({
			...prev,
			leftSelectorOpen: false,
			rightSelectorOpen: false,
		}));
	}, []);

	const closeSplitView = React.useCallback(() => {
		navigate({ to: "/games/$gameId", params: { gameId } });
	}, [navigate, gameId]);

	const contextValue: SplitViewContextValue = {
		state,
		updatePanes,
		openLeftSelector,
		openRightSelector,
		closeSelectors,
		closeSplitView,
	};

	return (
		<SplitViewContext.Provider value={contextValue}>
			{children}
		</SplitViewContext.Provider>
	);
}

export function useSplitView() {
	const context = React.useContext(SplitViewContext);
	if (!context) {
		throw new Error("useSplitView must be used within a SplitViewProvider");
	}
	return context;
}
