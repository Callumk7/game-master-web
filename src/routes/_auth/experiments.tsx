import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getGame } from "~/api";
import { getGameOptions } from "~/api/@tanstack/react-query.gen";

export const Route = createFileRoute("/_auth/experiments")({
  component: RouteComponent,
  loader: async () => {
    const game = await getGame({
      path: { id: 5 },
    });
    return game.data;
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const game = Route.useLoaderData();
  const gameQuery = useQuery({
    ...getGameOptions({
      path: { id: 5 },
    }),
  });
  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl mt-20">
      <h1 className="text-3xl">Experiments</h1>
      <p>Your email is {user?.email}</p>
      <div>
        <h2 className="text-2xl">Game</h2>
        <pre>{JSON.stringify(game, null, 2)}</pre>
      </div>
      <div>
        <h2 className="text-2xl">Game Query</h2>
        <pre>{JSON.stringify(gameQuery.data, null, 2)}</pre>
      </div>
    </div>
  );
}
