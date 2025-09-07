import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/games/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/games/new"!</div>
}
