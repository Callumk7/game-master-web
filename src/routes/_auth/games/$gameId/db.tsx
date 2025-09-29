import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { charactersCollection } from "~/data";

export const Route = createFileRoute("/_auth/games/$gameId/db")({
	component: TestDbComponent,
});

function TestDbComponent() {
	const { gameId } = Route.useParams();
	const queryClient = useQueryClient();

	// Create the characters collection for this game
	const characters = charactersCollection(gameId, queryClient);

	// Toggle pin status with optimistic updates
	const togglePin = (character: (typeof characters.toArray)[0]) => {
		// Update the collection - the onUpdate handler will sync with server automatically
		characters.update(character.id, (draft) => {
			draft.pinned = !character.pinned;
		});
	};

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-6">TanStack DB Test</h1>

			<div className="space-y-8">
				{/* Basic Collection Info */}
				<section>
					<h2 className="text-xl font-semibold mb-4">Collection Info</h2>
					<div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
						<p>Total characters: {characters.size}</p>
						<p>Collection ID: characters-{gameId}</p>
						<p>Sync status: Active</p>
					</div>
				</section>

				{/* All Characters */}
				<section>
					<h2 className="text-xl font-semibold mb-4">All Characters</h2>
					<div className="grid gap-4">
						{characters.toArray.length === 0 ? (
							<p className="text-gray-500">
								No characters found. Create some characters first!
							</p>
						) : (
							characters.toArray.map((character) => (
								<div
									key={character.id}
									className="border rounded-lg p-4 bg-white dark:bg-gray-900"
								>
									<div className="space-y-3">
										{/* Pin button above character info */}
										<div className="flex justify-between items-center">
											<button
												type="button"
												onClick={() => togglePin(character)}
												className={`px-3 py-1 text-sm rounded-full transition-colors font-medium ${
													character.pinned
														? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
														: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
												}`}
											>
												{character.pinned ? "📌 Unpin" : "📌 Pin"}
											</button>
											<div className="text-xs text-gray-500">
												ID: {character.id}
											</div>
										</div>

										{/* Character info */}
										<div>
											<h3 className="font-semibold text-lg">
												{character.name}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												Level {character.level} {character.class}
											</p>
											{character.faction_role && (
												<p className="text-sm text-blue-600 dark:text-blue-400">
													Role: {character.faction_role}
												</p>
											)}
										</div>
									</div>

									{character.content && (
										<div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
											{character.content.substring(0, 150)}
											{character.content.length > 150 && "..."}
										</div>
									)}

									{character.tags && character.tags.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-1">
											{character.tags.map((tag) => (
												<span
													key={String(tag)}
													className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
												>
													{String(tag)}
												</span>
											))}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</section>

				{/* Collection Methods Demo */}
				<section>
					<h2 className="text-xl font-semibold mb-4">Collection Methods</h2>
					<div className="space-y-4">
						<div>
							<h3 className="font-medium mb-2">Available Methods:</h3>
							<ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
								<li>
									<code>characters.toArray</code> - Get all characters
									as array
								</li>
								<li>
									<code>characters.get(id)</code> - Get character by ID
								</li>
								<li>
									<code>characters.has(id)</code> - Check if character
									exists
								</li>
								<li>
									<code>characters.size</code> - Number of characters
								</li>
								<li>
									<code>characters.subscribe(callback)</code> - Listen
									to changes
								</li>
							</ul>
						</div>

						{characters.toArray.length > 0 && (
							<div>
								<h3 className="font-medium mb-2">
									Example: Get first character by ID
								</h3>
								<div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
									{(() => {
										const firstChar = characters.toArray[0];
										const retrieved = characters.get(firstChar.id);
										return (
											<pre>
												{JSON.stringify(retrieved, null, 2)}
											</pre>
										);
									})()}
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Pin/Unpin Demo */}
				<section>
					<h2 className="text-xl font-semibold mb-4">
						Collection Updates Demo
					</h2>
					<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
						<p className="text-sm">
							Click the "Pin" or "Unpin" buttons above to see TanStack DB's
							automatic sync in action!
						</p>
						<div className="text-sm space-y-1">
							<div>
								<strong>What happens:</strong>
							</div>
							<ol className="list-decimal list-inside ml-2 space-y-1">
								<li>Character is immediately updated in the UI</li>
								<li>
									Collection's onUpdate handler automatically calls the
									API
								</li>
								<li>If successful: change persists</li>
								<li>
									If failed: automatically rolls back to original state
								</li>
							</ol>
						</div>
						<div className="pt-2 border-t">
							<strong>Pinned characters: </strong>
							{characters.toArray.filter((c) => c.pinned).length} of{" "}
							{characters.toArray.length}
						</div>
					</div>
				</section>

				{/* Real-time Updates Demo */}
				<section>
					<h2 className="text-xl font-semibold mb-4">Real-time Updates</h2>
					<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
						<p className="text-sm">
							This collection automatically updates when characters are
							modified through the API. Try editing a character in another
							tab or through the characters page to see live updates!
						</p>
					</div>
				</section>

				{/* Usage Instructions */}
				<section>
					<h2 className="text-xl font-semibold mb-4">Usage in Components</h2>
					<div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
						<pre className="text-sm overflow-x-auto">
							{`// Basic usage
const characters = charactersCollection(gameId, queryClient)

// Access data
const allCharacters = characters.toArray
const specificCharacter = characters.get(characterId)
const hasCharacter = characters.has(characterId)
const totalCount = characters.size

// Simple optimistic updates (like the pin/unpin example above)
const togglePin = (character) => {
  // Just update the collection - onUpdate handler automatically syncs with server!
  characters.update(character.id, (draft) => {
    draft.pinned = !character.pinned
  })
  // That's it! No manual API calls needed.
  // If the server update fails, TanStack DB automatically rolls back.
}

// Other mutation examples
const updateName = (character, newName) => {
  characters.update(character.id, (draft) => {
    draft.name = newName
  })
}

// Subscribe to changes
useEffect(() => {
  const unsubscribe = characters.subscribe(() => {
    console.log('Characters updated!', characters.toArray)
  })
  return unsubscribe
}, [characters])`}
						</pre>
					</div>
				</section>
			</div>
		</div>
	);
}
