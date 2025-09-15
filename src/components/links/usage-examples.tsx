/**
 * Usage Examples for the new Generic CreateLinkForm Component
 * 
 * These examples show how to replace the old faction-specific component
 * with the new generic one for all entity types.
 */

import { CreateLinkForm } from './CreateLinkForm';

// BEFORE: Old faction-specific usage
// <CreateLinkForm gameId={gameId} factionId={factionId} />

// AFTER: New generic usage patterns

// 1. For Faction Links (Direct replacement)
export function FactionLinkForm({ gameId, factionId }: { gameId: string; factionId: string }) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="faction"
			sourceEntityId={factionId}
		/>
	);
}

// 2. For Character Links
export function CharacterLinkForm({ gameId, characterId }: { gameId: string; characterId: string }) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="character"
			sourceEntityId={characterId}
			excludeTypes={['character']} // Prevent character-to-character links if desired
		/>
	);
}

// 3. For Location Links with custom success handling
export function LocationLinkForm({ 
	gameId, 
	locationId, 
	onLinkCreated 
}: { 
	gameId: string; 
	locationId: string; 
	onLinkCreated?: () => void;
}) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="location"
			sourceEntityId={locationId}
			onSuccess={() => {
				onLinkCreated?.();
				// Could also trigger a refetch or navigation
			}}
		/>
	);
}

// 4. For Quest Links with exclusions
export function QuestLinkForm({ 
	gameId, 
	questId, 
	existingLinks 
}: { 
	gameId: string; 
	questId: string; 
	existingLinks?: string[];
}) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="quest"
			sourceEntityId={questId}
			excludeIds={existingLinks} // Prevent duplicate links
		/>
	);
}

// 5. For Note Links with comprehensive options
export function NoteLinkForm({ 
	gameId, 
	noteId, 
	restrictToCharactersAndFactions = false,
	onSuccess,
	onError
}: { 
	gameId: string; 
	noteId: string; 
	restrictToCharactersAndFactions?: boolean;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="note"
			sourceEntityId={noteId}
			excludeTypes={
				restrictToCharactersAndFactions 
					? ['location', 'quest', 'note'] 
					: ['note'] // Always exclude note-to-note
			}
			onSuccess={onSuccess}
			onError={onError}
		/>
	);
}
