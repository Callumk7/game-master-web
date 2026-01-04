import { createHash } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import {
	getCharacter,
	getFaction,
	getLocation,
	getNote,
	getQuest,
	updateCharacter,
	updateFaction,
	updateLocation,
	updateNote,
	updateQuest,
} from "~/api/sdk.gen";
import { updateApiAuth } from "~/utils/api-client";
import { getAppSession } from "~/utils/session";

type EntityType = "character" | "quest" | "location" | "faction" | "note";

function hashSnapshot(snapshot: Record<string, unknown>) {
	return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

function snapshotFromEntity(entity: unknown) {
	const e = entity as Record<string, unknown>;
	return {
		name: e?.name ?? null,
		tags: e?.tags ?? null,
		content: e?.content ?? null,
		content_plain_text: e?.content_plain_text ?? null,
		alive: e?.alive ?? null,
		class: e?.class ?? null,
		level: e?.level ?? null,
		race: e?.race ?? null,
		status: e?.status ?? null,
		parent_id: e?.parent_id ?? null,
		type: e?.type ?? null,
	};
}

const entityTypeSchema = z.enum(["character", "quest", "location", "faction", "note"]);

const commitSchema = z.object({
	gameId: z.string(),
	entityType: entityTypeSchema,
	entityId: z.string(),
	beforeHash: z.string(),
	after: z.object({
		// common
		name: z.string().optional(),
		tags: z.array(z.string()).optional(),
		content: z.string().optional(),
		content_plain_text: z.string().optional(),
		// character-specific
		alive: z.boolean().optional(),
		class: z.string().optional(),
		level: z.number().int().min(1).optional(),
		race: z.string().optional(),
		// quest-specific
		status: z
			.enum(["preparing", "ready", "active", "paused", "completed", "cancelled"])
			.optional(),
		parent_id: z.string().optional(),
		// location-specific
		type: z
			.enum([
				"continent",
				"nation",
				"region",
				"city",
				"settlement",
				"building",
				"complex",
			])
			.optional(),
	}),
});

export const Route = createFileRoute("/api/entity-updates/commit")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				const session = await getAppSession();
				if (!session.data.token) {
					return new Response("Unauthorized", { status: 401 });
				}
				updateApiAuth(session.data.token);

				const bodyJson = await request.json();
				const parsed = commitSchema.safeParse(bodyJson);
				if (!parsed.success) {
					return new Response(
						JSON.stringify({
							error: "Invalid request",
							details: parsed.error.flatten(),
						}),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				const { gameId, entityType, entityId, beforeHash, after } = parsed.data;

				// Ensure something is being changed
				if (Object.keys(after).length === 0) {
					return new Response(
						JSON.stringify({ error: "No updates provided" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const currentEntity = await (async () => {
					switch (entityType) {
						case "character": {
							const res = await getCharacter({
								path: { game_id: gameId, id: entityId },
							});
							return res.data?.data ?? null;
						}
						case "quest": {
							const res = await getQuest({
								path: { game_id: gameId, id: entityId },
							});
							return res.data?.data ?? null;
						}
						case "location": {
							const res = await getLocation({
								path: { game_id: gameId, id: entityId },
							});
							return res.data?.data ?? null;
						}
						case "faction": {
							const res = await getFaction({
								path: { game_id: gameId, id: entityId },
							});
							return res.data?.data ?? null;
						}
						case "note": {
							const res = await getNote({
								path: { game_id: gameId, id: entityId },
							});
							return res.data?.data ?? null;
						}
					}
				})();

				if (!currentEntity) {
					return new Response(JSON.stringify({ error: "Entity not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				const currentSnapshot = snapshotFromEntity(currentEntity);
				const currentHash = hashSnapshot(currentSnapshot);

				if (currentHash !== beforeHash) {
					return new Response(
						JSON.stringify({
							error: "Conflict: entity has changed since proposal was created",
							currentHash,
						}),
						{ status: 409, headers: { "Content-Type": "application/json" } },
					);
				}

				// Capture rollback snapshot from current state
				const rollback = currentSnapshot;

				const updatedEntity = await (async () => {
					switch (entityType as EntityType) {
						case "character": {
							const res = await updateCharacter({
								path: { game_id: gameId, id: entityId },
								body: { character: after },
							});
							return res.data?.data ?? null;
						}
						case "quest": {
							const res = await updateQuest({
								path: { game_id: gameId, id: entityId },
								body: { quest: after },
							});
							return res.data?.data ?? null;
						}
						case "location": {
							const res = await updateLocation({
								path: { game_id: gameId, id: entityId },
								body: { location: after },
							});
							return res.data?.data ?? null;
						}
						case "faction": {
							const res = await updateFaction({
								path: { game_id: gameId, id: entityId },
								body: { faction: after },
							});
							return res.data?.data ?? null;
						}
						case "note": {
							const res = await updateNote({
								path: { game_id: gameId, id: entityId },
								body: { note: after },
							});
							return res.data?.data ?? null;
						}
					}
				})();

				if (!updatedEntity) {
					return new Response(JSON.stringify({ error: "Update failed" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}

				const afterSnapshot = snapshotFromEntity(updatedEntity);
				const afterHash = hashSnapshot(afterSnapshot);

				return new Response(
					JSON.stringify({
						success: true,
						entityType,
						entityId,
						gameId,
						afterHash,
						undo: {
							expectedCurrentHash: afterHash,
							restore: rollback,
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			},
		},
	},
});
