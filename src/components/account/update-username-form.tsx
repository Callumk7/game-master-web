import { useMutation } from "@tanstack/react-query";
import { updateUserProfileMutation } from "~/api/@tanstack/react-query.gen";
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
	const updateProfile = useMutation(updateUserProfileMutation());
	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: zProfileUpdate,
		},
		onSubmit({ value }) {
			updateProfile.mutate({ body: value });
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
