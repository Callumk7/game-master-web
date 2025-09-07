import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/games/show')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/games/show"!</div>
}
