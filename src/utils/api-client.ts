import { client } from "~/api/client.gen";

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
