import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";
import { createGameMutation } from "~/api/@tanstack/react-query.gen";
import { zGameCreateParams } from "~/api/zod.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const { useAppForm } = createFormHook();

type FormData = z.infer<typeof zGameCreateParams>;

export function CreateGameForm() {
	const createGame = useMutation(createGameMutation());

	const form = useAppForm({
		defaultValues: {
			name: "",
			content: "",
			setting: "",
		} as FormData,
		validators: {
			onChange: zGameCreateParams,
		},
		onSubmit: async ({ value }) => {
			try {
				await createGame.mutateAsync({
					body: {
						game: {
							name: value.name,
							content: value.content || undefined,
							setting: value.setting || undefined,
						},
					},
				});
				form.reset();
			} catch (error) {
				console.error("Failed to create game:", error);
			}
		},
	});

	return (
		<form.AppForm>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				<form.AppField 
					name="name"
					validators={{
						onChange: ({ value }) => 
							!value || value.trim().length === 0 ? "Game name is required" : undefined,
					}}
				>
					{(field) => (
						<form.Item>
							<field.Label>Game Name</field.Label>
							<field.Control>
								<Input
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter game name"
								/>
							</field.Control>
							<field.Message />
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="setting">
					{(field) => (
						<form.Item>
							<field.Label>Setting</field.Label>
							<field.Control>
								<Input
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g., Fantasy, Sci-Fi, Modern"
								/>
							</field.Control>
							<field.Description>
								The genre or setting of your game
							</field.Description>
							<field.Message />
						</form.Item>
					)}
				</form.AppField>

				<form.AppField name="content">
					{(field) => (
						<form.Item>
							<field.Label>Description</field.Label>
							<field.Control>
								<Textarea
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Describe your game world, campaign, or setting"
									rows={4}
								/>
							</field.Control>
							<field.Description>
								A detailed description of your game
							</field.Description>
							<field.Message />
						</form.Item>
					)}
				</form.AppField>

				<Button
					type="submit"
					disabled={createGame.isPending || !form.state.canSubmit}
				>
					{createGame.isPending ? "Creating..." : "Create Game"}
				</Button>
			</form>
		</form.AppForm>
	);
}
