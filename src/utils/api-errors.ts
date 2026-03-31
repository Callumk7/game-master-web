import type { _Error, ValidationError } from "~/api";
import { zError, zValidationError } from "~/api/zod.gen";

// =============================================================================
// API ERROR TYPES
// =============================================================================

/**
 * Symbol used to brand objects that have been enriched by our error interceptor.
 * Allows us to attach HTTP status without colliding with API response fields.
 */
const API_ERROR_STATUS = Symbol.for("apiErrorStatus");

/**
 * An error object that has been enriched with the HTTP status code
 * by our client error interceptor.
 */
type WithStatus = {
	[API_ERROR_STATUS]?: number;
};

/**
 * A simple API error — returned for 400, 401, 403, 404 responses.
 * Shape: `{ error: "Resource not found" }`
 */
export type SimpleApiError = _Error &
	WithStatus & {
		readonly kind: "simple";
	};

/**
 * A validation API error — returned for 422 responses.
 * Shape: `{ errors: { field: ["message", ...], ... } }`
 */
export type ValidationApiError = ValidationError &
	WithStatus & {
		readonly kind: "validation";
	};

/**
 * A fallback for error responses we can't parse into a known shape.
 * Wraps the raw thrown value so callers always have something to work with.
 */
export type UnknownApiError = WithStatus & {
	readonly kind: "unknown";
	readonly raw: unknown;
};

/**
 * Discriminated union of all API error variants.
 * Use `error.kind` to narrow, or the type guard helpers below.
 */
export type ApiError = SimpleApiError | ValidationApiError | UnknownApiError;

// =============================================================================
// ENRICHMENT (used by the client error interceptor)
// =============================================================================

/**
 * Attach an HTTP status code to a thrown error object.
 * Called from the client error interceptor so downstream code can read the status.
 */
export function enrichWithStatus<T>(error: T, status: number): T & WithStatus {
	if (error !== null && typeof error === "object") {
		Object.defineProperty(error, API_ERROR_STATUS, {
			value: status,
			enumerable: false, // don't show up in JSON.stringify / for..in
			writable: false,
			configurable: false,
		});
	}
	return error as T & WithStatus;
}

/**
 * Read the HTTP status code from an enriched error, if present.
 */
export function getErrorStatus(error: unknown): number | undefined {
	if (error !== null && typeof error === "object") {
		return (error as WithStatus)[API_ERROR_STATUS];
	}
	return undefined;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a thrown value is a simple API error: `{ error: string }`.
 */
export function isSimpleApiError(error: unknown): error is SimpleApiError {
	if (error === null || typeof error !== "object") {
		return false;
	}
	return zError.safeParse(error).success;
}

/**
 * Check if a thrown value is a validation API error: `{ errors: Record<string, string[]> }`.
 */
export function isValidationApiError(error: unknown): error is ValidationApiError {
	if (error === null || typeof error !== "object") {
		return false;
	}
	return zValidationError.safeParse(error).success;
}

/**
 * Check if a thrown value matches any known API error shape.
 */
export function isApiError(error: unknown): error is SimpleApiError | ValidationApiError {
	return isSimpleApiError(error) || isValidationApiError(error);
}

// =============================================================================
// PARSING — normalize any thrown value into our ApiError union
// =============================================================================

/**
 * Parse any thrown value into a structured `ApiError`.
 *
 * Tries to match the known API shapes first (using the generated Zod schemas),
 * then falls back to `UnknownApiError` wrapping the raw value.
 */
export function parseError(error: unknown): ApiError {
	// Already branded? Return as-is.
	if (
		error !== null &&
		typeof error === "object" &&
		"kind" in error &&
		(error.kind === "simple" ||
			error.kind === "validation" ||
			error.kind === "unknown")
	) {
		return error as ApiError;
	}

	if (error !== null && typeof error === "object") {
		// Try validation error first (more specific: has `errors` key)
		if (zValidationError.safeParse(error).success) {
			return Object.assign(error as ValidationError & WithStatus, {
				kind: "validation" as const,
			});
		}

		// Try simple error (`{ error: string }`)
		if (zError.safeParse(error).success) {
			return Object.assign(error as _Error & WithStatus, {
				kind: "simple" as const,
			});
		}
	}

	// Fallback — wrap whatever was thrown
	return {
		kind: "unknown" as const,
		raw: error,
	};
}

// =============================================================================
// MESSAGE EXTRACTION
// =============================================================================

/**
 * Extract a single, human-readable error message from any thrown value.
 *
 * Handles:
 * - `SimpleApiError`  → the `error` string
 * - `ValidationApiError` → formatted "Field: message" lines
 * - `Error` instances → `.message`
 * - Strings → returned directly
 * - Anything else → generic fallback
 */
export function getErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
): string {
	// Handle our branded types
	if (error !== null && typeof error === "object" && "kind" in error) {
		const parsed = error as ApiError;
		switch (parsed.kind) {
			case "simple":
				return parsed.error;
			case "validation":
				return formatValidationErrors(parsed.errors);
			case "unknown":
				return getErrorMessage(parsed.raw, fallback);
		}
	}

	// Handle raw API shapes (before parseError has been called)
	if (isSimpleApiError(error)) {
		return error.error;
	}
	if (isValidationApiError(error)) {
		return formatValidationErrors(error.errors);
	}

	// Standard JS Error
	if (error instanceof Error) {
		return error.message;
	}

	// Plain string
	if (typeof error === "string" && error.length > 0) {
		return error;
	}

	return fallback;
}

/**
 * Extract field-level validation errors from a thrown value.
 * Returns `null` if the error is not a validation error.
 *
 * Useful for mapping server-side field errors onto form fields.
 */
export function getFieldErrors(error: unknown): Record<string, string[]> | null {
	if (isValidationApiError(error)) {
		return error.errors;
	}

	// Handle already-parsed ApiError
	if (
		error !== null &&
		typeof error === "object" &&
		"kind" in error &&
		(error as ApiError).kind === "validation"
	) {
		return (error as ValidationApiError).errors;
	}

	return null;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a validation errors map into a human-readable string.
 */
function formatValidationErrors(errors: Record<string, string[]>): string {
	const entries = Object.entries(errors);
	if (entries.length === 0) {
		return "Validation failed.";
	}

	return entries
		.map(([field, messages]) => {
			const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
			// Join multiple messages for the same field with ", "
			return `${formattedField}: ${messages.join(", ")}`;
		})
		.join("\n");
}
