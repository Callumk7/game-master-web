import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { catalog } from "~/json-render/catalog";
import { getAppSession } from "~/utils/session";

export const Route = createFileRoute("/api/ui-demo/")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				const session = await getAppSession();
				if (!session.data.token) {
					return new Response("Unauthorized", { status: 401 });
				}

				const { prompt } = await request.json();

				const systemPrompt = catalog.prompt();

				const result = streamText({
					model: google("gemini-2.5-flash"),
					system: systemPrompt,
					prompt,
				});

				return result.toTextStreamResponse();
			},
		},
	},
});
