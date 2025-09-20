import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/games/$gameId/characters/$id/notes',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/games/$gameId/characters/$id/notes"!</div>
}
