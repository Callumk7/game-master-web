import { createFileRoute } from "@tanstack/react-router";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import { GamesList } from "~/components/GamesList";

export const Route = createFileRoute("/_auth/games/")({
  component: RouteComponent,
  loader: ({ context }) => context.queryClient.ensureQueryData({ ...listGamesOptions() }),
});

function RouteComponent() {
  return <GamesList />;
}
