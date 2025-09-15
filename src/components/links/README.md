# Generic Link Form Component

This component provides a reusable way to create links between any game entities (characters, factions, locations, notes, quests).

## Usage Examples

### Basic Usage (Faction to Any Entity)
```tsx
<CreateLinkForm
  gameId={gameId}
  sourceEntityType="faction"
  sourceEntityId={factionId}
/>
```

### Character to Any Entity (Excluding Factions)
```tsx
<CreateLinkForm
  gameId={gameId}
  sourceEntityType="character"
  sourceEntityId={characterId}
  excludeTypes={['faction']}
  onSuccess={() => toast.success('Character linked successfully!')}
/>
```

### Location with Custom Callbacks and Exclusions
```tsx
<CreateLinkForm
  gameId={gameId}
  sourceEntityType="location"
  sourceEntityId={locationId}
  excludeIds={existingLinkIds} // Prevent duplicate links
  onSuccess={() => {
    refetchLocationData();
    onClose();
  }}
  onError={(error) => {
    console.error('Link creation failed:', error);
  }}
/>
```

### Quest to Any Entity (Excluding Self-Type)
```tsx
<CreateLinkForm
  gameId={gameId}
  sourceEntityType="quest"
  sourceEntityId={questId}
  excludeTypes={['quest']} // Prevent quest-to-quest links
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `gameId` | string | Yes | The ID of the game |
| `sourceEntityType` | EntityType | Yes | The type of the source entity ('character' \| 'faction' \| 'location' \| 'note' \| 'quest') |
| `sourceEntityId` | string | Yes | The ID of the source entity |
| `onSuccess` | () => void | No | Callback when link is created successfully |
| `onError` | (error: Error) => void | No | Callback when link creation fails |
| `excludeTypes` | EntityType[] | No | Entity types to exclude from the selection |
| `excludeIds` | string[] | No | Specific entity IDs to exclude (format: "type:id") |

## Features

- **Generic**: Works with any source entity type
- **Self-Prevention**: Automatically prevents linking to the same entity
- **Type Safety**: Full TypeScript support with proper typing
- **Error Handling**: Built-in error handling with toast notifications
- **Loading States**: Shows loading state while fetching entities
- **Exclusions**: Supports excluding specific types or entities
- **Memoization**: Optimized data transformations to prevent unnecessary re-renders

## Hooks

### useGameEntities
Fetches and transforms game entities for selection.

```tsx
const { entities, isLoading, error, flatEntities } = useGameEntities(
  gameId,
  excludeTypes,
  excludeIds
);
```

### useCreateLink
Handles link creation with proper mutation management.

```tsx
const createLink = useCreateLink(onSuccess, onError);

await createLink.mutateAsync({
  gameId,
  sourceType: 'faction',
  sourceId: '123',
  targetType: 'character',
  targetId: '456',
});
```
