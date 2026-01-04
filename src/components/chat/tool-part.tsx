import { Wrench } from "lucide-react";
import { EntityCreationLink } from "./entity-creation-link";
import { ProposedEntityUpdateApprovalCard } from "./entity-update-approval-card";
import { creationToolLinkConfig } from "./tool-links";
import type { ProposedEntityUpdateToolOutput, ToolUIPart } from "./types";
import { isCreationToolSuccessOutput, isProposedEntityUpdateToolOutput } from "./types";

export function ToolPart({
	part,
	routeGameId,
}: {
	part: ToolUIPart;
	routeGameId: string;
}) {
	if (part.type === "text" || part.type === "reasoning") return null;

	const toolName = part.type.startsWith("tool-")
		? part.type.replace("tool-", "")
		: part.type;

	const creationConfig =
		toolName in creationToolLinkConfig
			? creationToolLinkConfig[toolName as keyof typeof creationToolLinkConfig]
			: null;

	const creationOutput =
		creationConfig && isCreationToolSuccessOutput(part.output) ? part.output : null;

	return (
		<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
			<div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
				<Wrench className="size-3" />
				<span>{toolName}</span>
			</div>

			{part.state === "input-streaming" && (
				<div className="text-xs text-muted-foreground">Preparing input...</div>
			)}
			{part.state === "input-available" && (
				<div className="text-xs text-muted-foreground">Executing...</div>
			)}

			{part.state === "output-available" && part.output != null && (
				<div className="mt-2">
					{toolName === "proposeEntityUpdate" &&
					isProposedEntityUpdateToolOutput(part.output) ? (
						<ProposedEntityUpdateToolOutputPart
							output={part.output}
							routeGameId={routeGameId}
						/>
					) : creationConfig && creationOutput ? (
						<EntityCreationLink
							gameId={routeGameId}
							entityId={creationOutput.id}
							label={creationConfig.label}
							message={creationOutput.message}
							to={creationConfig.to}
						/>
					) : (
						<pre className="text-xs overflow-auto bg-muted/50 rounded p-2">
							{JSON.stringify(part.output, null, 2)}
						</pre>
					)}
				</div>
			)}

			{part.state === "output-error" && part.errorText && (
				<div className="text-xs text-red-600 dark:text-red-400 mt-1">
					Error: {part.errorText}
				</div>
			)}
		</div>
	);
}

function ProposedEntityUpdateToolOutputPart({
	output,
	routeGameId,
}: {
	output: ProposedEntityUpdateToolOutput;
	routeGameId: string;
}) {
	if (!output.success) {
		return (
			<div className="text-xs text-red-600 dark:text-red-400">
				Error: {output.error}
			</div>
		);
	}

	return <ProposedEntityUpdateApprovalCard output={output} routeGameId={routeGameId} />;
}
