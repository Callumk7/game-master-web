import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { parseApiErrors } from "~/utils/parse-errors";
import type {
	ApiError,
	FieldConfig,
	FormFactoryOptions,
	UseFormWithMutationOptions,
} from "../types";
import { FormFieldControl } from "./field-control";

// Create form hook outside component
const { useAppForm } = createFormHook();

// ===================================
// LEGACY FORM FACTORY
// ===================================

export function createFormComponent<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, unknown>,
>({
	mutationOptions,
	schema,
	fields,
	onSuccess,
	defaultValues = {},
	className = "space-y-6",
	entityName = "game",
}: FormFactoryOptions<TData, TError, TMutationData, TFormData>) {
	return function FormComponent() {
		const queryClient = useQueryClient();

		const mutationInstance = useMutation({
			...mutationOptions(),
			onSuccess: (data) => {
				queryClient.invalidateQueries();
				onSuccess?.(data);
			},
		});

		const form = useAppForm({
			defaultValues,
			onSubmit: async ({ value }) => {
				try {
					const validatedData = schema.parse(value);
					const fullData = {
						body: { [entityName]: validatedData },
					} as unknown as Options<TMutationData>;

					await mutationInstance.mutateAsync(fullData);
				} catch (error) {
					if (error instanceof z.ZodError) {
						console.error("Validation error:", error.issues);
						// Set field-specific validation errors
						error.issues.forEach((issue) => {
							if (issue.path.length > 0) {
								const fieldName = issue.path[0] as string;
								form.setFieldMeta(fieldName, (prev) => ({
									...prev,
									errors: [issue.message],
								}));
							}
						});
					}

					// Handle API field errors
					const apiError = error as ApiError;
					if (apiError.errors && typeof apiError.errors === "object") {
						for (const [fieldName, errorValue] of Object.entries(
							apiError.errors,
						)) {
							let messages: string[] = [];

							// Normalize the error(s) into a string array, as form libraries usually expect this.
							if (typeof errorValue === "string") {
								messages = [errorValue]; // API returned a single string
							} else if (Array.isArray(errorValue)) {
								// Ensure all items in the array are strings before assigning
								messages = errorValue.filter(
									(item) => typeof item === "string",
								);
							}

							// Only update the field if we have valid error messages
							if (messages.length > 0) {
								form.setFieldMeta(fieldName, (prev) => ({
									...prev,
									errors: messages,
								}));
							}
						}
					}

					throw error;
				}
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
					>
						{fields.map((fieldConfig) => (
							<form.AppField
								key={fieldConfig.name}
								name={fieldConfig.name}
								validators={{
									onChange: ({ value }) => {
										if (fieldConfig.required && !value) {
											return `${fieldConfig.label} is required`;
										}
										return undefined;
									},
								}}
							>
								{(field) => (
									<form.Item>
										<field.Label>
											{fieldConfig.label}
											{fieldConfig.required && (
												<span className="text-destructive ml-1">
													*
												</span>
											)}
										</field.Label>

										<field.Control>
											<FormFieldControl
												field={fieldConfig}
												fieldApi={field}
											/>
										</field.Control>

										{fieldConfig.description && (
											<field.Description>
												{fieldConfig.description}
											</field.Description>
										)}

										<field.Message />
									</form.Item>
								)}
							</form.AppField>
						))}

						<div className="flex gap-2">
							<Button type="submit" disabled={mutationInstance.isPending}>
								{mutationInstance.isPending ? "Submitting..." : "Submit"}
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
					</form>
				</form.AppForm>

				{mutationInstance.isSuccess && (
					<div className="mt-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium">Success!</p>
								<p className="text-sm">
									{entityName} saved successfully!
								</p>
							</div>
						</div>
					</div>
				)}

				{mutationInstance.isError && (
					<div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<XCircle className="h-5 w-5 text-destructive" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium">Error</p>
								<p className="text-sm">
									{parseApiErrors(mutationInstance.error as ApiError)}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};
}

export function useFormWithMutation<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, unknown>,
>({
	mutationOptions,
	schema,
	onSuccess,
	defaultValues = {},
	entityName = "game",
}: UseFormWithMutationOptions<TData, TError, TMutationData, TFormData>) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		...mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries();
			onSuccess?.(data);
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				const validatedData = schema.parse(value);
				const fullData = {
					body: { [entityName]: validatedData },
				} as unknown as Options<TMutationData>;

				await mutation.mutateAsync(fullData);
			} catch (error) {
				if (error instanceof z.ZodError) {
					console.error("Validation error:", error.issues);
					// Set field-specific validation errors
					error.issues.forEach((issue) => {
						if (issue.path.length > 0) {
							const fieldName = issue.path[0] as string;
							form.setFieldMeta(fieldName, (prev) => ({
								...prev,
								errors: [issue.message],
							}));
						}
					});
				}

				// Handle API field errors
				const apiError = error as ApiError;
				if (apiError.errors && typeof apiError.errors === "object") {
					for (const [fieldName, errorValue] of Object.entries(
						apiError.errors,
					)) {
						let messages: string[] = [];

						// Normalize the error(s) into a string array, as form libraries usually expect this.
						if (typeof errorValue === "string") {
							messages = [errorValue]; // API returned a single string
						} else if (Array.isArray(errorValue)) {
							// Ensure all items in the array are strings before assigning
							messages = errorValue.filter(
								(item) => typeof item === "string",
							);
						}

						// Only update the field if we have valid error messages
						if (messages.length > 0) {
							form.setFieldMeta(fieldName, (prev) => ({
								...prev,
								errors: messages,
							}));
						}
					}
				}

				throw error;
			}
		},
	});

	return {
		form,
		mutation,
		// Helper to render form fields with proper UI components
		renderField: (fieldConfig: FieldConfig) => (
			<form.AppField
				key={fieldConfig.name}
				name={fieldConfig.name}
				validators={{
					onChange: ({ value }) => {
						if (fieldConfig.required && !value) {
							return `${fieldConfig.label} is required`;
						}
						return undefined;
					},
				}}
			>
				{(field) => (
					<form.Item>
						<field.Label>
							{fieldConfig.label}
							{fieldConfig.required && (
								<span className="text-destructive ml-1">*</span>
							)}
						</field.Label>

						<field.Control>
							<FormFieldControl field={fieldConfig} fieldApi={field} />
						</field.Control>

						{fieldConfig.description && (
							<field.Description>
								{fieldConfig.description}
							</field.Description>
						)}

						<field.Message />
					</form.Item>
				)}
			</form.AppField>
		),
	};
}

// Export the form hook for direct usage
export { useAppForm };
