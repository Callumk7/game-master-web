import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getUserProfileQueryKey,
	updateUserProfileMutation,
} from "~/api/@tanstack/react-query.gen";
import { zProfileUpdate } from "~/api/zod.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { Input } from "~/components/ui/input";

const { useAppForm } = createFormHook();

interface UpdateProfileFormProps {
	defaultValues?: {
		username?: string;
	};
	className?: string;
}
export function UpdateProfileForm({ defaultValues, className }: UpdateProfileFormProps) {
	const queryClient = useQueryClient();
	const updateProfile = useMutation(updateUserProfileMutation());
	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: zProfileUpdate,
		},
		onSubmit({ value }) {
			toast.info("Updating profile...");
			updateProfile.mutate(
				{ body: value },
				{
					onSuccess: () => {
						toast.success("Profile updated!");
						queryClient.invalidateQueries({
							queryKey: getUserProfileQueryKey(),
						});
					},
					onError: () => {
						toast.error("Failed to update profile.");
					},
				},
			);
		},
	});

	return (
		<div className={className}>
			<form.AppForm>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-8 max-w-xs w-full"
				>
					<form.AppField name="username">
						{(field) => (
							<form.Item>
								<field.Label>Username</field.Label>
								<field.Control>
									<Input
										placeholder="shadcn"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
									/>
								</field.Control>
								<field.Description>
									This is your public display name.
								</field.Description>
								<field.Message />
							</form.Item>
						)}
					</form.AppField>
					<Button type="submit">Submit</Button>
				</form>
			</form.AppForm>
		</div>
	);
}
