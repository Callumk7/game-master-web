import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Gem, Loader2, MapPin, Scroll, Shield, Users } from "lucide-react";
import * as React from "react";
import type { EntityType } from "~/types";
import { cn } from "~/utils/cn";
import { NodeContextMenu } from "./node-context-menu";
import type { EntityCanvasNode } from "./types";

// ---------------------------------------------------------------------------
// Context — shared canvas state provided by the parent CanvasInner component
// ---------------------------------------------------------------------------

export type CanvasContextValue = {
	gameId: string;
	loadLinks: (nodeId: string) => Promise<void>;
	loadingNodeId: string | null;
};

export const CanvasContext = React.createContext<CanvasContextValue>({
	gameId: "",
	loadLinks: async () => {},
	loadingNodeId: null,
});

// ---------------------------------------------------------------------------
// Entity type → visual config mapping
// ---------------------------------------------------------------------------

type EntityVisualConfig = {
	icon: React.ElementType;
	borderColor: string;
	iconColor: string;
	label: string;
};

const entityVisualConfig: Record<EntityType, EntityVisualConfig> = {
	character: {
		icon: Users,
		borderColor: "border-l-blue-500",
		iconColor: "text-blue-400",
		label: "Character",
	},
	faction: {
		icon: Shield,
		borderColor: "border-l-purple-500",
		iconColor: "text-purple-400",
		label: "Faction",
	},
	location: {
		icon: MapPin,
		borderColor: "border-l-green-500",
		iconColor: "text-green-400",
		label: "Location",
	},
	note: {
		icon: Scroll,
		borderColor: "border-l-amber-500",
		iconColor: "text-amber-400",
		label: "Note",
	},
	quest: {
		icon: Gem,
		borderColor: "border-l-red-500",
		iconColor: "text-red-400",
		label: "Quest",
	},
};

// ---------------------------------------------------------------------------
// Metadata subtitle — type-specific fields
// ---------------------------------------------------------------------------

function MetadataSubtitle({
	entityType,
	metadata,
}: {
	entityType: EntityType;
	metadata?: Record<string, unknown>;
}) {
	if (!metadata) return null;

	const parts: string[] = [];

	switch (entityType) {
		case "character": {
			if (metadata.race) parts.push(String(metadata.race));
			if (metadata.class) parts.push(String(metadata.class));
			if (metadata.level) parts.push(`Lv. ${metadata.level}`);
			break;
		}
		case "quest": {
			if (metadata.status) parts.push(String(metadata.status));
			break;
		}
		case "location": {
			if (metadata.type) parts.push(String(metadata.type));
			break;
		}
		case "faction": {
			if (metadata.memberCount != null)
				parts.push(`${metadata.memberCount} members`);
			break;
		}
		case "note":
			// Notes don't have notable metadata fields beyond tags
			break;
	}

	if (parts.length === 0) return null;

	return <p className="text-muted-foreground text-xs truncate">{parts.join(" · ")}</p>;
}

// ---------------------------------------------------------------------------
// Scrollable node content — captures wheel events at the DOM level so they
// scroll the content instead of zooming the canvas via React Flow.
// ---------------------------------------------------------------------------

function NodeScrollArea({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const handleWheel = (e: WheelEvent) => {
			e.stopPropagation();
		};

		el.addEventListener("wheel", handleWheel, { passive: true });
		return () => el.removeEventListener("wheel", handleWheel);
	}, []);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Entity Node
// ---------------------------------------------------------------------------

function EntityNode({ id, data, selected }: NodeProps<EntityCanvasNode>) {
	const { gameId, loadingNodeId } = React.useContext(CanvasContext);
	const config = entityVisualConfig[data.entityType];
	const Icon = config.icon;

	const isLoading = loadingNodeId === id;

	return (
		<div
			className={cn(
				"w-[280px] rounded-md border border-l-4 bg-card text-card-foreground shadow-md transition-shadow",
				config.borderColor,
				selected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
			)}
		>
			{/* ---- Handles (all 4 sides) ---- */}
			<Handle
				type="source"
				position={Position.Top}
				id="top-source"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="target"
				position={Position.Top}
				id="top-target"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="bottom-source"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="target"
				position={Position.Bottom}
				id="bottom-target"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="source"
				position={Position.Left}
				id="left-source"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="target"
				position={Position.Left}
				id="left-target"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="source"
				position={Position.Right}
				id="right-source"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>
			<Handle
				type="target"
				position={Position.Right}
				id="right-target"
				className="!bg-muted-foreground !w-2 !h-2 !border-background"
			/>

			{/* ---- Header ---- */}
			<div className="flex items-center gap-2 border-b border-border px-3 py-2">
				{isLoading ? (
					<Loader2
						className={cn("size-4 shrink-0 animate-spin", config.iconColor)}
					/>
				) : (
					<Icon className={cn("size-4 shrink-0", config.iconColor)} />
				)}
				<span className="min-w-0 flex-1 truncate text-sm font-medium">
					{data.name}
				</span>
				<NodeContextMenu
					gameId={gameId}
					nodeId={id}
					entityType={data.entityType}
					entityId={data.entityId}
				/>
			</div>

			{/* ---- Metadata subtitle ---- */}
			{data.metadata && Object.keys(data.metadata).length > 0 && (
				<div className="border-b border-border px-3 py-1.5">
					<MetadataSubtitle
						entityType={data.entityType}
						metadata={data.metadata}
					/>
				</div>
			)}

			{/* ---- Scrollable content body ---- */}
			{data.contentPlainText && (
				<NodeScrollArea className="nodrag nopan max-h-60 overflow-y-auto px-3 py-2">
					<p className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
						{data.contentPlainText}
					</p>
				</NodeScrollArea>
			)}
		</div>
	);
}

export default EntityNode;
