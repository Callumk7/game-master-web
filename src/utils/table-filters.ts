import type { FilterFn } from "@tanstack/react-table";

/**
 * Fuzzy filter function that performs case-insensitive substring matching.
 * Works with both string values and string arrays (like tags).
 */
export const fuzzyFilter: FilterFn<unknown> = (row, columnId, value) => {
	const itemValue = row.getValue(columnId) as string | string[];

	if (Array.isArray(itemValue)) {
		return itemValue.some((item) => item.toLowerCase().includes(value.toLowerCase()));
	}

	return itemValue?.toLowerCase().includes(value.toLowerCase()) ?? false;
};

/**
 * Collection of custom filter functions for TanStack Table
 */
export const tableFilterFns = {
	fuzzy: fuzzyFilter,
};

/**
 * Type-safe filter function names
 */
export type TableFilterFn = keyof typeof tableFilterFns;

// Extend TanStack Table types to include our custom filter functions
declare module "@tanstack/react-table" {
	interface FilterFns {
		fuzzy: FilterFn<unknown>;
	}
}
