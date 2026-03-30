import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Gem, MapPin, MoreHorizontal, Scroll, Shield, Users } from "lucide-react";
import type * as React from "react";
import type { EntityType } from "~/types";
import { cn } from "~/utils/cn";
import type { EntityCanvasNode } from "./types";

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
// Entity Node
// ---------------------------------------------------------------------------

function EntityNode({ data, selected }: NodeProps<EntityCanvasNode>) {
	const config = entityVisualConfig[data.entityType];
	const Icon = config.icon;

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
				<Icon className={cn("size-4 shrink-0", config.iconColor)} />
				<span className="min-w-0 flex-1 truncate text-sm font-medium">
					{data.name}
				</span>
				<button
					type="button"
					className="nodrag nopan shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
					data-action-trigger
					aria-label="Node actions"
				>
					<MoreHorizontal className="size-4" />
				</button>
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
				<div className="nodrag nopan max-h-60 overflow-y-auto px-3 py-2">
					<p className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
						{data.contentPlainText}
					</p>
				</div>
			)}
		</div>
	);
}

export default EntityNode;
