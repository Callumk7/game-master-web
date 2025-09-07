import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { getGameOptions } from "~/api/@tanstack/react-query.gen";
import { clearApiAuth, updateApiAuth } from "~/utils/api-client";

export const Route = createFileRoute("/_auth/games/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ ...getGameOptions({ path: { id: 5 } }) }),
});

function RouteComponent() {
  const { token } = Route.useRouteContext();
  useLayoutEffect(() => {
    if (token) {
      updateApiAuth(token);
    } else {
      clearApiAuth();
    }
  }, [token]);
  const { data } = useGameQuery();
  return (
    <div>
      <h1>Games</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

const useGameQuery = () => {
  return useQuery({ ...getGameOptions({ path: { id: 5 } }) });
};
