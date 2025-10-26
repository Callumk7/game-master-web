import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/theme-provider";
import { getAppSession } from "~/utils/session";
import appCss from "../styles.css?url";

export const SERVER_URL = "https://gamemastercore-production.up.railway.app";

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
	ssr: true,
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
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
					{children}
					<TanStackRouterDevtools position="top-right" />
					<ReactQueryDevtools buttonPosition="top-left" />
					<Scripts />
					<Toaster position="top-center" theme={"dark"} />
				</ThemeProvider>
			</body>
		</html>
	);
}
