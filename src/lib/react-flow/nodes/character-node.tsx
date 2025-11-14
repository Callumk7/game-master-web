import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { CharacterNodeType } from "../types";

export function CharacterNode({ data }: NodeProps<CharacterNodeType>) {
	const { character } = data;
	return (
		<div className="bg-secondary text-secondary-foreground p-4 rounded-lg flex flex-col gap-2 min-w-48">
			<Handle type="target" position={Position.Top} id="character-target" />
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">{character.name}</h3>
				{!character.alive && (
					<span className="text-xs text-muted-foreground">†</span>
				)}
			</div>
			<div className="text-sm space-y-1">
				<div className="flex gap-2">
					<span className="text-muted-foreground">Lvl {character.level}</span>
					<span>{character.race}</span>
					<span>{character.class}</span>
				</div>
			</div>
		</div>
	);
}
