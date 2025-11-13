import { createFileRoute, redirect } from "@tanstack/react-router";
import { LandingPage } from "~/components/landing-page";

export const Route = createFileRoute("/")({
	ssr: true,
	component: App,
	beforeLoad: async ({ context }) => {
		// Redirect authenticated users directly to games
		if (context.token && context.user) {
			throw redirect({ to: "/games" });
		}
	},
});

function App() {
	return <LandingPage />;
}
