import { toast } from "sonner";
import { getErrorMessage } from "~/utils/api-errors";

/**
 * Show a toast with a user-friendly error message extracted from any error.
 *
 * Handles API errors (`{ error: "..." }` or `{ errors: { field: [...] } }`),
 * JS `Error` instances, plain strings, and unknown values.
 *
 * @param error - The thrown/caught error value
 * @param fallback - Fallback message if the error can't be parsed
 *
 * @example
 * ```ts
 * // In a mutation's onError callback:
 * onError: (error) => showErrorToast(error)
 *
 * // With a custom fallback:
 * onError: (error) => showErrorToast(error, "Failed to delete character")
 * ```
 */
export function showErrorToast(error: unknown, fallback?: string): void {
	const message = getErrorMessage(error, fallback);
	toast.error(message);
}
