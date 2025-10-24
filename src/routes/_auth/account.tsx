import { createFileRoute } from "@tanstack/react-router";
import {
	getUserProfileOptions,
	useGetUserProfileQuery,
} from "~/api/@tanstack/react-query.gen";
import { UpdateProfileForm } from "~/components/account/update-username-form";
import { AuthenticatedLayout } from "~/components/authenticated-layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/_auth/account")({
	ssr: true,
	component: RouteComponent,
	loader: ({ context }) => {
		return context.queryClient.ensureQueryData(getUserProfileOptions());
	},
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	const { data: userProfile, isLoading } = useGetUserProfileQuery();

	if (!user) {
		return <h1>You are not logged in.</h1>;
	}

	if (isLoading) {
		return <h1>Loading...</h1>;
	}

	return (
		<AuthenticatedLayout user={user!}>
			<Card className="max-w-md mx-auto mt-8">
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>Manage your account details.</CardDescription>
				</CardHeader>
				<CardContent>
					<UpdateProfileForm
						defaultValues={{ username: userProfile?.username }}
					/>
				</CardContent>
			</Card>
		</AuthenticatedLayout>
	);
}
