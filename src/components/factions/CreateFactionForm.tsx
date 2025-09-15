import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createFactionMutation,
	listFactionsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useSmartForm } from "~/components/forms/smart-factory";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { schemas } from "../forms/type-utils";

export function CreateFactionForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/factions/new" });
	const context = useRouteContext({
		from: "/_auth/games/$gameId/factions/new",
	});
	const navigate = useNavigate();

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createFactionMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.faction,
		entityName: "faction",
		onSuccess: async () => {
			toast("Faction created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Create New Faction</CardTitle>
			</CardHeader>
			<CardContent>
				<form.AppForm>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						{/* All these fields are auto-generated with smart defaults! */}
						{renderSmartField("name", {
							placeholder: "Enter faction name",
						})}

						{renderSmartField("description", {
							type: "textarea",
							placeholder:
								"Describe the faction's goals, history, and role...",
							description: "Optional description of the faction",
						})}

						{renderSmartField("allegiance", {
							description: "The moral alignment of this faction",
							placeholder: "Select allegiance",
						})}

						{renderSmartField("power_level", {
							description: "Rate the faction's influence and power (1-10)",
							placeholder: "5",
						})}

						{/* Show current form state for debugging */}
						{import.meta.env.DEV && (
							<details className="mt-4 p-4 bg-muted rounded">
								<summary className="cursor-pointer font-semibold">
									Form Debug Info
								</summary>
								<pre className="mt-2 text-xs">
									{JSON.stringify(form.state, null, 2)}
								</pre>
							</details>
						)}

						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								disabled={mutation.isPending}
								className="flex-1"
							>
								{mutation.isPending ? "Creating..." : "Create Faction"}
							</Button>

							<Button
								type="button"
								variant="outline"
								onClick={() => {
									if (
										form.state.isDirty &&
										!confirm(
											"Are you sure? All unsaved changes will be lost.",
										)
									) {
										return;
									}
									form.reset();
								}}
							>
								Reset
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={() => navigate({ to: ".." })}
							>
								Cancel
							</Button>
						</div>

						{/* Status messages are handled automatically by the mutation */}
						{mutation.isSuccess && (
							<div className="p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-md">
								✅ Faction created successfully!
							</div>
						)}

						{mutation.isError && (
							<div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
								❌ Error:{" "}
								{(mutation.error as { message?: string })?.message ||
									"Something went wrong"}
							</div>
						)}
					</form>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
