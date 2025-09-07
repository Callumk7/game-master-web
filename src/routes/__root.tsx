import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";

import Header from "../components/Header";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "~/utils/session";
import { Client } from "~/api/core/types.gen";
import { useEffect } from "react";
import { initializeApiClient } from "~/utils/api-client";

interface MyRouterContext {
  queryClient: QueryClient;
  client: Client;
}

// NOTE: This function accesses the session from the cookie session. It runs on the server.
const fetchSession = createServerFn({ method: "GET" }).handler(async () => {
  // We need to auth on the server so we have access to secure cookies
  console.log("Running the fetchUser server function");
  const session = await useAppSession();

  if (!session.data.token) {
    return null;
  }

  return {
    user: session.data.user,
    token: session.data.token,
  };
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const session = await fetchSession();

    return {
      ...session,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeApiClient();
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="text-black bg-white dark:bg-gray-900 dark:text-white">
        <Header />
        {children}
        <TanstackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
