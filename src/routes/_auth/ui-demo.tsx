import {
	ActionProvider,
	Renderer,
	StateProvider,
	useUIStream,
	VisibilityProvider,
} from "@json-render/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { registry } from "~/json-render/registry";

export const Route = createFileRoute("/_auth/ui-demo")({
	component: JsonRenderDemo,
});

function JsonRenderDemo() {
	return (
		<Container className="mt-0 mb-0 py-8 h-full min-h-0">
			<div className="flex flex-col h-full min-h-0 max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight">
						Generative UI Demo
					</h1>
					<p className="text-muted-foreground mt-1">
						Describe what UI you want to see and the AI will generate it using
						json-render components.
					</p>
				</div>
				<StateProvider initialState={{}}>
					<VisibilityProvider>
						<ActionProvider handlers={{}}>
							<GenerativeUI />
						</ActionProvider>
					</VisibilityProvider>
				</StateProvider>
			</div>
		</Container>
	);
}

function GenerativeUI() {
	const { spec, isStreaming, error, send } = useUIStream({
		api: "/api/ui-demo",
	});

	const [prompt, setPrompt] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim() || isStreaming) return;
		send(prompt);
	};

	const examplePrompts = [
		"Create a game dashboard with a heading 'Campaign Overview', a row of 4 metrics (Players: 5, Sessions: 23, Days: 147, Gold: 12,450), and a row of 3 CharacterCards forthe main party members",
		"Build a quest tracking page with a QuestCard for 'The Lost Artifact' with status 'active' and 4 objectives (2 completed), followed by a QuestCard for 'Dragon Hunt' with status 'preparing'",
		"Show a character profile using CharacterCard and InfoGrid: Strength 18 (+4), Dexterity 14 (+2), Constitution 16 (+3), Intelligence 12 (+1), Wisdom 10, Charisma 8 (-1)",
		"Create a TTRPG stat block with heading 'Ancient Dragon' and Stats: AC 22, HP 546, Speed 80ft, STR 30, DEX 10, CON 29, INT 18, WIS 15, CHA 23",
		"Build an EntityList showing 5 characters: Thorin Ironforge (Dwarf Fighter Lvl 8), Elara Moonshadow (Elf Wizard Lvl 7), Grimjaw (Half-Orc Barbarian Lvl 9), Lyra Swiftfoot (Halfling Rogue Lvl 6), Brother Marcus (Human Cleric Lvl 7)",
	];

	return (
		<div className="flex flex-col gap-6 flex-1 min-h-0">
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<Textarea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Describe the UI you want to generate..."
					className="min-h-[100px] resize-none"
					disabled={isStreaming}
				/>
				<div className="flex items-center gap-4">
					<Button type="submit" disabled={isStreaming || !prompt.trim()}>
						{isStreaming ? "Generating..." : "Generate UI"}
					</Button>
					<span className="text-sm text-muted-foreground">
						Example prompts:
					</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{examplePrompts.map((example) => (
						<button
							key={example.slice(0, 30)}
							type="button"
							className="text-xs px-2 py-1 rounded-md border bg-muted/50 hover:bg-muted transition-colors"
							onClick={() => setPrompt(example)}
							disabled={isStreaming}
						>
							{example.slice(0, 50)}...
						</button>
					))}
				</div>
			</form>

			{error && (
				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
					<p className="text-sm text-destructive">Error: {error.message}</p>
				</div>
			)}

			<div className="flex-1 min-h-0 border rounded-lg bg-muted/30 overflow-auto">
				<div className="p-6">
					<Suspense
						fallback={<div className="text-muted-foreground">Loading...</div>}
					>
						<Renderer spec={spec} registry={registry} loading={isStreaming} />
					</Suspense>
					{!spec && !isStreaming && (
						<div className="text-center text-muted-foreground py-12">
							Enter a prompt above to generate a UI
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
