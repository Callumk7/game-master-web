import { useQueryClient } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { Search } from "lucide-react";
import * as React from "react";
import { listGameEntitiesQueryKey } from "~/api/@tanstack/react-query.gen";
import type {
	EntitiesPlainText,
	EntitiesPlainTextData,
	EntityPlainTextCharacter,
	EntityPlainTextLocation,
	EntityPlainTextQuest,
} from "~/api/types.gen";
import { useGameEntities } from "~/components/links/hooks/useGameEntities";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useCanvasActions, useCanvasNodes } from "~/state/canvas";
import type { EntityType } from "~/types";
import { cn } from "~/utils/cn";
import type { CanvasNodeData, EntityCanvasNode } from "./types";

// ---------------------------------------------------------------------------
// Metadata extractors — pull type-specific fields from cached entity data
// ---------------------------------------------------------------------------

type AnyPlainTextEntity = {
	id: string;
	name: string;
	content_plain_text?: string;
};

function extractNodeData(
	entityType: EntityType,
	entityId: string,
	raw: AnyPlainTextEntity,
): CanvasNodeData {
	const base: CanvasNodeData = {
		entityId,
		entityType,
		name: raw.name,
		contentPlainText: raw.content_plain_text,
	};

	switch (entityType) {
		case "character": {
			const c = raw as EntityPlainTextCharacter;
			const m: Record<string, unknown> = {};
			if (c.class) m.class = c.class;
			if (c.level) m.level = c.level;
			if (Object.keys(m).length > 0) base.metadata = m;
			break;
		}
		case "quest": {
			const q = raw as EntityPlainTextQuest;
			if (q.status) base.metadata = { status: q.status };
			break;
		}
		case "location": {
			const l = raw as EntityPlainTextLocation;
			if (l.type) base.metadata = { type: l.type };
			break;
		}
		default:
			break;
	}

	return base;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EntityPickerItem = {
	label: string;
	value: string;
	type: EntityType;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AddEntityDialogProps {
	gameId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddEntityDialog({ gameId, open, onOpenChange }: AddEntityDialogProps) {
	const { flatEntities } = useGameEntities(gameId);
	const nodes = useCanvasNodes(gameId);
	const { addNode } = useCanvasActions();
	const reactFlow = useReactFlow();
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [highlightedIndex, setHighlightedIndex] = React.useState(0);
	const listRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	// Set of entity ids already on canvas for fast lookup
	const onCanvasIds = React.useMemo(
		() => new Set(nodes.map((n) => `${n.data.entityType}:${n.data.entityId}`)),
		[nodes],
	);

	// Filter entities not yet on canvas
	const availableEntities = React.useMemo(
		() => flatEntities.filter((item) => !onCanvasIds.has(item.value)),
		[flatEntities, onCanvasIds],
	);

	// Filter by search query
	const filteredEntities = React.useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return availableEntities;
		return availableEntities.filter(
			(item) =>
				item.label.toLowerCase().includes(query) ||
				item.type.toLowerCase().includes(query),
		);
	}, [availableEntities, search]);

	// Reset state when dialog opens/closes
	React.useEffect(() => {
		if (open) {
			setSearch("");
			setHighlightedIndex(0);
		}
	}, [open]);

	// Keep highlighted index in bounds when the filtered list changes
	React.useEffect(() => {
		setHighlightedIndex((prev) =>
			filteredEntities.length === 0
				? 0
				: Math.min(prev, filteredEntities.length - 1),
		);
	}, [filteredEntities]);

	// Scroll highlighted item into view
	React.useEffect(() => {
		const container = listRef.current;
		if (!container) return;
		const highlighted = container.querySelector("[data-highlighted='true']");
		if (highlighted) {
			highlighted.scrollIntoView({ block: "nearest" });
		}
	}, [highlightedIndex]);

	const handleSelect = React.useCallback(
		(selected: EntityPickerItem) => {
			const [entityType, entityId] = selected.value.split(":") as [
				EntityType,
				string,
			];

			// Resolve content_plain_text + metadata from the listGameEntities query cache.
			const cachedResponse = queryClient.getQueryData<{
				data?: EntitiesPlainTextData;
			}>(
				listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			);

			const entities = cachedResponse?.data?.entities;
			let nodeData: CanvasNodeData = {
				entityId,
				entityType,
				name: selected.label,
			};

			if (entities) {
				const pluralKey = `${entityType}s` as keyof EntitiesPlainText;
				const entityList = entities[pluralKey] as
					| AnyPlainTextEntity[]
					| undefined;
				const rawEntity = entityList?.find((e) => e.id === entityId);
				if (rawEntity) {
					nodeData = extractNodeData(entityType, entityId, rawEntity);
				}
			}

			// Calculate viewport center for node placement
			const container = document.querySelector(".react-flow");
			const width = container?.clientWidth ?? 800;
			const height = container?.clientHeight ?? 600;

			const centerPosition = reactFlow.screenToFlowPosition({
				x: width / 2,
				y: height / 2,
			});

			// Small random offset to avoid stacking when adding multiple nodes
			const offset = {
				x: (Math.random() - 0.5) * 60,
				y: (Math.random() - 0.5) * 60,
			};

			const node: EntityCanvasNode = {
				id: `${entityType}-${entityId}`,
				type: "entityNode",
				position: {
					x: centerPosition.x + offset.x,
					y: centerPosition.y + offset.y,
				},
				data: nodeData,
			};

			addNode(gameId, node);
			onOpenChange(false);
		},
		[gameId, addNode, onOpenChange, reactFlow, queryClient],
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (filteredEntities.length === 0) return;

			switch (e.key) {
				case "ArrowDown": {
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev < filteredEntities.length - 1 ? prev + 1 : 0,
					);
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev > 0 ? prev - 1 : filteredEntities.length - 1,
					);
					break;
				}
				case "Enter": {
					e.preventDefault();
					const item = filteredEntities[highlightedIndex];
					if (item) handleSelect(item);
					break;
				}
			}
		},
		[filteredEntities, highlightedIndex, handleSelect],
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Entity to Canvas</DialogTitle>
					<DialogDescription>
						Search for an entity to place on the canvas.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-2">
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							ref={inputRef}
							placeholder="Search entities…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyDown={handleKeyDown}
							className="pl-9"
							autoFocus
						/>
					</div>

					<ScrollArea className="h-[min(18rem,60vh)] rounded-md border">
						<div ref={listRef} role="listbox" className="py-1">
							{filteredEntities.length === 0 ? (
								<div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
									No entities available.
								</div>
							) : (
								filteredEntities.map((item, index) => (
									<button
										key={item.value}
										type="button"
										role="option"
										aria-selected={index === highlightedIndex}
										data-highlighted={index === highlightedIndex}
										className={cn(
											"flex w-full cursor-default items-center gap-3 px-3 py-2 text-left text-sm outline-none transition-colors",
											index === highlightedIndex &&
												"bg-accent text-accent-foreground",
										)}
										onClick={() => handleSelect(item)}
										onMouseEnter={() => setHighlightedIndex(index)}
									>
										<span className="flex flex-col gap-0.5">
											<span className="text-xs capitalize text-muted-foreground">
												{item.type}
											</span>
											<span className="text-sm">{item.label}</span>
										</span>
									</button>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			</DialogContent>
		</Dialog>
	);
}
