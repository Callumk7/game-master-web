import type { Character, Faction, Location, Note, Quest } from "~/api/types.gen";

const EntityTypes = ["character", "faction", "location", "note", "quest"] as const;
export type EntityType = (typeof EntityTypes)[number];

export type Entity = Character | Faction | Location | Note | Quest;
type EntityCollectionKeys = "characters" | "factions" | "locations" | "notes" | "quests";
export type EntityCollection = Record<EntityCollectionKeys, Entity[]>;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export const _Statuses = [
	"preparing",
	"ready",
	"active",
	"paused",
	"completed",
	"cancelled",
] as const;
export type Status = (typeof _Statuses)[number];
