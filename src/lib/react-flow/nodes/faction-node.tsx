import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FactionNodeType } from "../types";

export function FactionNode({ data }: NodeProps<FactionNodeType>) {
	const { faction } = data;
	return (
		<div className="bg-secondary text-secondary-foreground p-4 rounded-lg flex flex-col gap-2 min-w-48">
			<Handle type="source" position={Position.Bottom} id="faction-source" />
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">{faction.name}</h3>
			</div>
		</div>
	);
}
