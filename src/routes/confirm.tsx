import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { confirmEmail } from "~/api";
import { getAppSession } from "~/utils/session";

const confirmTokenFn = createServerFn({ method: "POST" })
	.inputValidator((d: { token: string }) => d)
	.handler(async ({ data }) => {
		const { data: confirmData, error } = await confirmEmail({ body: data });

		if (error) {
			return {
				error: true,
			};
		}

		const session = await getAppSession();

		if (confirmData) {
			await session.update({
				user: confirmData.user,
				token: confirmData.token,
			});

			throw redirect({
				href: "/",
			});
		}

		throw redirect({
			href: "/",
		});
	});

export const Route = createFileRoute("/confirm")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			token: search.token as string,
		};
	},
	beforeLoad: async ({ search }) => {
		const token = search.token;
		await confirmTokenFn({ data: { token } });
	},
});

function RouteComponent() {
	return <div>Hello "/confirm"!</div>;
}
