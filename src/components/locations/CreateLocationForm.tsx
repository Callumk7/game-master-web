import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createLocationMutation,
	listLocationsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { useListLocationsQuery } from "~/queries/locations";
import { useSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";
import { ParentLocationSelect } from "./ParentLocationSelect";

export function CreateLocationForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/locations/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/locations/new" });
	const navigate = useNavigate();

	// Fetch existing locations for parent selection
	const { data: locationsData, isLoading: locationsLoading } =
		useListLocationsQuery(gameId);
	const locations = locationsData?.data || [];

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createLocationMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.location,
		entityName: "location",
		onSuccess: async () => {
			toast("Location created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return (
		<div className="space-y-6">
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="space-y-6">
						{renderSmartField("name")}
						{renderSmartField("type", {
							type: "select",
							label: "Location Type",
							options: [
								{ value: "continent", label: "Continent" },
								{ value: "nation", label: "Nation" },
								{ value: "region", label: "Region" },
								{ value: "city", label: "City" },
								{ value: "settlement", label: "Settlement" },
								{ value: "building", label: "Building" },
								{ value: "complex", label: "Complex" },
							],
							placeholder: "Select location type",
						})}

						{/* Custom parent location selector */}
						<form.AppField name="parent_id">
							{(field) => (
								<form.Item>
									<field.Label>Parent Location</field.Label>
									<field.Control>
										{locationsLoading ? (
											<div className="text-muted-foreground text-sm p-2">
												Loading locations...
											</div>
										) : (
											<ParentLocationSelect
												locations={locations}
												value={field.state.value}
												onChange={field.handleChange}
												currentType={form.getFieldValue("type")}
												placeholder="Select parent location (optional)"
											/>
										)}
									</field.Control>
									<field.Description>
										Choose a parent location to create a hierarchical
										structure. Leave empty for top-level locations.
									</field.Description>
									<field.Message />
								</form.Item>
							)}
						</form.AppField>

						{renderSmartField("tags")}
						{renderSmartField("content")}

						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Creating..." : "Create Location"}
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
						</div>
					</div>
				</form>
			</form.AppForm>

			{mutation.isError && (
				<div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
					<p className="text-sm">
						{(mutation.error as any)?.message || "Something went wrong"}
					</p>
				</div>
			)}
		</div>
	);
}
