import type { _Error, ErrorDetails } from "~/api";

export function isApiError(obj: unknown): obj is _Error {
	if (obj === null || typeof obj !== "object") {
		return false;
	}

	const candidate = obj as Record<string, unknown>;

	if ("errors" in candidate) {
		return candidate.errors === undefined || isErrorDetails(candidate.errors);
	}

	return true;
}

function isErrorDetails(obj: unknown): obj is ErrorDetails {
	return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}
