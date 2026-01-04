export type ProposedEntityUpdateToolOutput =
	| {
			success: true;
			changeId: string;
			gameId: string;
			entityType: "character" | "quest" | "location" | "faction" | "note";
			entityId: string;
			beforeHash: string;
			before: {
				name: string | null;
				tags: Array<string> | null;
				content: string | null;
				content_plain_text: string | null;
				content_json?: object | null;
			};
			proposed: {
				name?: string;
				tags?: Array<string>;
				content_json?: object | null;
				content_plain_text?: string;
				// other optional update fields, passed through to commit route:
				[key: string]: unknown;
			};
			approvalRequired: true;
			message?: string;
	  }
	| {
			success: false;
			error: string;
	  };

export function isProposedEntityUpdateToolOutput(
	output: unknown,
): output is ProposedEntityUpdateToolOutput {
	if (!output || typeof output !== "object") return false;
	return "success" in output;
}

export function isCreationToolSuccessOutput(
	output: unknown,
): output is { success: true; id: string; message?: string } {
	if (!output || typeof output !== "object") return false;
	if (!("success" in output) || !("id" in output)) return false;
	return (
		Boolean((output as { success: boolean; id?: unknown }).success) &&
		typeof (output as { id?: unknown }).id === "string"
	);
}

export type CommitResponse =
	| {
			success: true;
			undo: { expectedCurrentHash: string; restore: Record<string, unknown> };
	  }
	| { success?: false; error?: string };

export type UndoResponse = { success: true } | { success?: false; error?: string };

export function isCommitResponse(v: unknown): v is CommitResponse {
	return !!v && typeof v === "object" && "success" in v;
}

export function isUndoResponse(v: unknown): v is UndoResponse {
	return !!v && typeof v === "object" && "success" in v;
}

export type ToolUIPart = {
	type: string;
	state?: string;
	output?: unknown;
	errorText?: string;
};
