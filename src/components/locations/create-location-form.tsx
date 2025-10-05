import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createLocationMutation,
	getLocationTreeQueryKey,
	listGameEntitiesQueryKey,
	listLocationsQueryKey,
	useListLocationsQuery,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { useSmartForm, schemas } from "~/lib/smart-form-factory";
import { ParentLocationSelect } from "./parent-location-select";

interface CreateLocationFormProps {
	onSuccess?: () => void;
}

export function CreateLocationForm({ onSuccess }: CreateLocationFormProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Fetch existing locations for parent selection
	const { data: locationsData, isLoading: locationsLoading } = useListLocationsQuery({
		path: { game_id: gameId },
	});
	const locations = locationsData?.data || [];

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			createLocationMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.location,
		entityName: "location",
		onSuccess: async ({ data }) => {
			toast("Location created successfully!");
			queryClient.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getLocationTreeQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});

			if (onSuccess) {
				onSuccess();
			}

			if (data) {
				navigate({
					to: "/games/$gameId/locations/$id",
					params: { gameId, id: data.id },
				});
			}
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
							label: "Location Type",
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
