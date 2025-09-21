import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "~/components/StatCard";
import { Button } from "~/components/ui/button";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useGetGameLinksQuery, useGetGameQuery } from "~/queries/games";

export const Route = createFileRoute("/_auth/games/$gameId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const [editorContent, setEditorContent] = useState(null);
	const [editorText, setEditorText] = useState("");

	const { data: gameData, error } = useGetGameQuery({ id: gameId });
	const game = gameData.data;

	const { data: links, isLoading: linksLoading } = useGetGameLinksQuery({ id: gameId });
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<MinimalTiptap 
					content={editorContent}
					onChange={(content) => {
						setEditorContent(content.json);
						setEditorText(content.text);
					}}
					placeholder="Start writing your campaign notes..."
				/>
				<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
					<div>
						<h3 className="text-sm font-semibold mb-2">Debug: Editor JSON</h3>
						<pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
							{JSON.stringify(editorContent, null, 2)}
						</pre>
					</div>
					<div>
						<h3 className="text-sm font-semibold mb-2">Debug: Plain Text</h3>
						<pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
							{editorText}
						</pre>
					</div>
				</div>
			</div>
			{!error && (
				<>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font bold">Campaign Dashboard</h1>
							<p>
								{game?.name} - {game?.content || "A TTRPG campaign"}
							</p>
						</div>
						<Button>View Graph</Button>
					</div>
					{linksLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{Array(5).fill(0).map((_, i) => (
								<div key={i} className="p-6 border rounded-lg">
									<div className="animate-pulse space-y-2">
										<div className="h-4 bg-gray-200 rounded w-3/4"></div>
										<div className="h-8 bg-gray-200 rounded w-1/2"></div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatCard
								title="Characters"
								value={characters?.length.toString() || "0"}
								href="/games/$gameId/characters"
							/>
							<StatCard
								title="Notes"
								value={notes?.length.toString() || "0"}
								href="/games/$gameId/notes"
							/>
							<StatCard
								title="Factions"
								value={factions?.length.toString() || "0"}
								href="/games/$gameId/factions"
							/>
							<StatCard
								title="Locations"
								value={locations?.length.toString() || "0"}
								href="/games/$gameId/locations"
							/>
							<StatCard
								title="Quests"
								value={quests?.length.toString() || "0"}
								href="/games/$gameId/quests"
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
