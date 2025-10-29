import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LocationUpdateParams } from "~/api";
import {
	getLocationQueryKey,
	getLocationTreeQueryKey,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";
import { schemas, useSmartForm } from "~/lib/smart-form-factory";
import { useUIActions } from "~/state/ui";
import { Button } from "../ui/button";
import { ParentLocationSelect } from "./parent-location-select";

interface EditLocationFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<LocationUpdateParams>;
}

export function EditLocationForm({ initialData, params }: EditLocationFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const { setIsEditLocationOpen } = useUIActions();

	const { form, mutation, renderSmartField } = useSmartForm({
		mutation: () =>
			updateLocationMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),
		onSuccess: async () => {
			toast.success("Location updated successfully!");
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
				queryKey: getLocationQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			setIsEditLocationOpen(false);
		},
		schema: schemas.location,
		entityName: "location",
		initialValues: {
			...initialData,
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
										<ParentLocationSelect
											gameId={gameId}
											value={field.state.value}
											onChange={field.handleChange}
											currentType={form.getFieldValue("type")}
											placeholder="Select parent location (optional)"
										/>
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

						<div className="flex gap-2">
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Updating..." : "Update Location"}
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
		</div>
	);
}
