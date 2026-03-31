import { client } from "~/api/client.gen";
import { enrichWithStatus } from "~/utils/api-errors";

// =============================================================================
// ERROR INTERCEPTOR (auto-registered on module load)
// =============================================================================

/**
 * Global error interceptor — runs for every non-OK API response.
 *
 * Enriches the thrown/returned error with the HTTP status code so downstream
 * code can inspect it via `getErrorStatus(error)` without needing access to
 * the Response object.
 */
client.interceptors.error.use((error, response) => {
	const enriched = enrichWithStatus(error, response.status);

	if (import.meta.env.DEV) {
		console.warn(`[API ${response.status}] ${response.url}`, enriched);
	}

	return enriched;
});

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

export function initializeApiClient() {
	client.setConfig({
		baseUrl: "http://localhost:4000",
	});
}

export function updateApiAuth(token: string) {
	client.setConfig({
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

export function clearApiAuth() {
	client.setConfig({
		headers: {},
	});
}
