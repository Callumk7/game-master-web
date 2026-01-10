import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { getSystemPrompt } from "~/ai/system-prompt";
import { tools } from "~/ai/tools";
import { getGame } from "~/api/sdk.gen";
import type { ChatUIMessage } from "~/types";
import { updateApiAuth } from "~/utils/api-client";
import { getAppSession } from "~/utils/session";

export const Route = createFileRoute("/api/chat/$gameId")({
	server: {
		handlers: {
			POST: async ({
				request,
				params,
			}: {
				request: Request;
				params: { gameId: string };
			}) => {
				// Get session and configure API client with auth token
				const session = await getAppSession();
				if (!session.data.token) {
					return new Response("Unauthorized", { status: 401 });
				}

				// Configure the API client with the user's auth token
				updateApiAuth(session.data.token);

				const { gameId } = params;
				const { messages }: { messages: ChatUIMessage[] } = await request.json();

				// Fetch game details for context
				const gameResponse = await getGame({ path: { id: gameId } });
				const game = gameResponse.data?.data;

				const result = streamText({
					model: google("gemini-2.5-pro"),
					system: getSystemPrompt(gameId, game?.name, game?.setting),
					tools,
					messages: await convertToModelMessages(messages),
					stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and final response
				});

				return result.toUIMessageStreamResponse({
					originalMessages: messages, // Enable type-safe metadata
					messageMetadata: ({ part }) => {
						if (part.type === "start") {
							return {
								createdAt: Date.now(),
								model: "gemini-2.5-pro",
							};
						}

						if (part.type === "finish") {
							return {
								totalTokens: part.totalUsage.totalTokens,
								inputTokens: part.totalUsage.inputTokens,
								outputTokens: part.totalUsage.outputTokens,
							};
						}
					},
				});
			},
		},
	},
});
