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

const undoSchema = z.object({
	gameId: z.string(),
	entityType: entityTypeSchema,
	entityId: z.string(),
	expectedCurrentHash: z.string(),
	restore: z.object({
		// common
		name: z.string().nullable().optional(),
		tags: z.array(z.string()).nullable().optional(),
		content: z.string().nullable().optional(),
		content_plain_text: z.string().nullable().optional(),
		// character-specific
		alive: z.boolean().nullable().optional(),
		class: z.string().nullable().optional(),
		level: z.number().int().min(1).nullable().optional(),
		race: z.string().nullable().optional(),
		// quest/location specific
		status: z
			.enum(["preparing", "ready", "active", "paused", "completed", "cancelled"])
			.nullable()
			.optional(),
		parent_id: z.string().nullable().optional(),
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
			.nullable()
			.optional(),
	}),
});

export const Route = createFileRoute("/api/entity-updates/undo")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				const session = await getAppSession();
				if (!session.data.token) {
					return new Response("Unauthorized", { status: 401 });
				}
				updateApiAuth(session.data.token);

				const bodyJson = await request.json();
				const parsed = undoSchema.safeParse(bodyJson);
				if (!parsed.success) {
					return new Response(
						JSON.stringify({
							error: "Invalid request",
							details: parsed.error.flatten(),
						}),
						{ status: 400, headers: { "Content-Type": "application/json" } },
					);
				}

				const { gameId, entityType, entityId, expectedCurrentHash, restore } =
					parsed.data;

				// The API update types do not accept `null` for optional fields. For rollback,
				// we treat `null` as "do not set / leave unchanged".
				const restoreClean = Object.fromEntries(
					Object.entries(restore).filter(
						([, v]) => v !== null && v !== undefined,
					),
				);

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

				const currentHash = hashSnapshot(snapshotFromEntity(currentEntity));
				if (currentHash !== expectedCurrentHash) {
					return new Response(
						JSON.stringify({
							error: "Conflict: entity has changed since the applied update",
							currentHash,
						}),
						{ status: 409, headers: { "Content-Type": "application/json" } },
					);
				}

				const updatedEntity = await (async () => {
					switch (entityType as EntityType) {
						case "character": {
							const res = await updateCharacter({
								path: { game_id: gameId, id: entityId },
								body: { character: restoreClean },
							});
							return res.data?.data ?? null;
						}
						case "quest": {
							const res = await updateQuest({
								path: { game_id: gameId, id: entityId },
								body: { quest: restoreClean },
							});
							return res.data?.data ?? null;
						}
						case "location": {
							const res = await updateLocation({
								path: { game_id: gameId, id: entityId },
								body: { location: restoreClean },
							});
							return res.data?.data ?? null;
						}
						case "faction": {
							const res = await updateFaction({
								path: { game_id: gameId, id: entityId },
								body: { faction: restoreClean },
							});
							return res.data?.data ?? null;
						}
						case "note": {
							const res = await updateNote({
								path: { game_id: gameId, id: entityId },
								body: { note: restoreClean },
							});
							return res.data?.data ?? null;
						}
					}
				})();

				if (!updatedEntity) {
					return new Response(JSON.stringify({ error: "Undo failed" }), {
						status: 500,
						headers: { "Content-Type": "application/json" },
					});
				}

				const newHash = hashSnapshot(snapshotFromEntity(updatedEntity));

				return new Response(
					JSON.stringify({
						success: true,
						entityType,
						entityId,
						gameId,
						currentHash: newHash,
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			},
		},
	},
});
