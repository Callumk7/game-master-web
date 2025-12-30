import { google } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { getGame } from "~/api/sdk.gen";
import { tools } from "~/ai/tools";
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
				const { messages }: { messages: UIMessage[] } = await request.json();

				// Fetch game details for context
				const gameResponse = await getGame({ path: { id: gameId } });
				const game = gameResponse.data?.data;

				const result = streamText({
					model: google("gemini-2.0-flash-exp"),
					system: `You are a helpful AI assistant for a tabletop RPG game master.

Current Game Context:
- Game: ${game?.name ?? "Unknown"}
- Setting: ${game?.setting ?? "Not specified"}
- Game ID: ${gameId}

You have access to tools that let you retrieve information about game entities (characters, quests, locations, factions, notes).
When calling tools, always pass the gameId: "${gameId}"

IMPORTANT: When you use tools to fetch information:
1. Call the appropriate tool(s) to get the data you need
2. Wait for the tool results
3. ALWAYS provide a response to the user based on the tool results
4. Summarize and present the information in a clear, helpful way

Your workflow should be: Tool Call → Receive Results → Respond to User

Be concise and helpful in your responses.`,
					tools,
					messages: await convertToModelMessages(messages),
					stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and final response
				});

				return result.toUIMessageStreamResponse();
			},
		},
	},
});
