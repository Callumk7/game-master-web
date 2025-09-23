const EntityTypes = ["character", "faction", "location", "note", "quest"] as const;
export type EntityType = (typeof EntityTypes)[number];

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
