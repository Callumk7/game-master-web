import { TanstackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/ThemeProvider";
import { initializeApiClient } from "~/utils/api-client";
import { getAppSession } from "~/utils/session";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

// NOTE: This function accesses the session from the cookie session. It runs on the server.
const fetchSession = createServerFn({ method: "GET" }).handler(async () => {
	const session = await getAppSession();

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
				title: "Game Master - The DM Notebook",
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
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
					<Toaster position="top-center" theme={"dark"} />
				</ThemeProvider>
			</body>
		</html>
	);
}
