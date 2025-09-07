import { client } from "~/api/client.gen";

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
