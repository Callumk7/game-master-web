import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Tiptap } from "~/components/ui/editor";
import { TiptapViewer } from "~/components/ui/editor/viewer";
import type { ProposedEntityUpdateToolOutput } from "./types";
import { isCommitResponse, isUndoResponse } from "./types";

export function ProposedEntityUpdateApprovalCard({
	output,
	routeGameId,
}: {
	output: Extract<ProposedEntityUpdateToolOutput, { success: true }>;
	routeGameId: string;
}) {
	const initialJson =
		(output.proposed.content_json as object | null | undefined) ??
		output.before.content_json ??
		null;

	const [showCurrent, setShowCurrent] = useState(false);
	const [draft, setDraft] = useState<{ json: object | null; text: string }>({
		json: initialJson,
		text:
			output.proposed.content_plain_text ?? output.before.content_plain_text ?? "",
	});
	const [status, setStatus] = useState<
		"idle" | "committing" | "committed" | "undoing" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);
	const [undo, setUndo] = useState<{
		expectedCurrentHash: string;
		restore: Record<string, unknown>;
	} | null>(null);

	const effectiveJson = draft.json ?? initialJson;

	const commit = async () => {
		setStatus("committing");
		setError(null);

		try {
			const { content_json: _contentJson, ...other } = output.proposed;
			const after: Record<string, unknown> = {
				...other,
			};

			if (effectiveJson) {
				after.content = JSON.stringify(effectiveJson);
				after.content_plain_text = draft.text ?? "";
			}

			const res = await fetch("/api/entity-updates/commit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: output.gameId ?? routeGameId,
					entityType: output.entityType,
					entityId: output.entityId,
					beforeHash: output.beforeHash,
					after,
				}),
			});

			const json: unknown = await res.json();
			const parsed = isCommitResponse(json) ? json : null;
			if (!res.ok || !parsed?.success) {
				throw new Error(
					(parsed && "error" in parsed && parsed.error) ||
						"Failed to apply update",
				);
			}

			setUndo(parsed.undo ?? null);
			setStatus("committed");
		} catch (e) {
			setStatus("error");
			setError(e instanceof Error ? e.message : "Failed to apply update");
		}
	};

	const undoUpdate = async () => {
		if (!undo) return;
		setStatus("undoing");
		setError(null);

		try {
			const res = await fetch("/api/entity-updates/undo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: output.gameId ?? routeGameId,
					entityType: output.entityType,
					entityId: output.entityId,
					expectedCurrentHash: undo.expectedCurrentHash,
					restore: undo.restore,
				}),
			});

			const json: unknown = await res.json();
			const parsed = isUndoResponse(json) ? json : null;
			if (!res.ok || !parsed?.success) {
				throw new Error(
					(parsed && "error" in parsed && parsed.error) ||
						"Failed to undo update",
				);
			}

			setUndo(null);
			setStatus("idle");
		} catch (e) {
			setStatus("error");
			setError(e instanceof Error ? e.message : "Failed to undo update");
		}
	};

	const disabled = status === "committing" || status === "undoing";

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">
					Proposed update:{" "}
					<span className="font-medium">{output.entityType}</span>{" "}
					<span className="font-mono">{output.entityId}</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowCurrent((v) => !v)}
						disabled={disabled}
					>
						{showCurrent ? "Hide current" : "Show current"}
					</Button>
				</div>
			</div>

			{showCurrent && (
				<div className="rounded border bg-muted/30 p-3">
					<div className="text-xs font-medium text-muted-foreground mb-2">
						Current content
					</div>
					<TiptapViewer
						content={output.before.content ?? ""}
						className="prose-sm"
					/>
				</div>
			)}

			<div className="rounded border bg-card p-3">
				<div className="text-xs font-medium text-muted-foreground mb-2">
					Proposed content (editable before approval)
				</div>
				<Tiptap
					key={output.changeId}
					content={effectiveJson}
					onChange={({ json, text }) => setDraft({ json, text })}
					entityId={output.entityId}
					entityType={output.entityType}
				/>
			</div>

			<div className="flex items-center justify-between gap-3">
				<div className="text-xs text-muted-foreground">
					{status === "committing"
						? "Applying…"
						: status === "committed"
							? "Applied."
							: status === "undoing"
								? "Undoing…"
								: status === "error"
									? "Error."
									: "Review, edit, then approve to apply."}
				</div>
				<div className="flex items-center gap-2">
					{undo ? (
						<Button
							variant="outline"
							size="sm"
							onClick={undoUpdate}
							disabled={disabled}
						>
							Undo
						</Button>
					) : null}
					<Button
						size="sm"
						onClick={commit}
						disabled={disabled || status === "committed"}
					>
						Approve & Apply
					</Button>
				</div>
			</div>

			{error ? (
				<div className="text-xs text-red-600 dark:text-red-400">{error}</div>
			) : null}
		</div>
	);
}
