/** biome-ignore-all lint/suspicious/noExplicitAny: factory component */

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import type * as React from "react";
import { z } from "zod";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { TagInput } from "~/components/ui/composite/tag-input";
import { createFormHook } from "~/components/ui/form-tanstack";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { MinimalTiptap } from "../ui/shadcn-io/minimal-tiptap";

// Create form hook outside component
const { useAppForm } = createFormHook();

// ===================================
// TYPES
// ===================================

export interface FormFactoryOptions<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, any>,
> {
	mutationOptions: () => UseMutationOptions<TData, TError, Options<TMutationData>>;
	schema: z.ZodSchema<TFormData>;
	fields: FieldConfig[];
	onSuccess?: (data: TData) => void;
	defaultValues?: Partial<TFormData>;
	className?: string;
	entityName?: string;
}

export interface FieldConfig {
	name: string;
	label: string;
	type:
		| "text"
		| "number"
		| "textarea"
		| "editor"
		| "select"
		| "checkbox"
		| "email"
		| "password"
		| "date"
		| "tags";
	placeholder?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
	description?: string;
	disabled?: boolean;
	className?: string;
	validation?: {
		min?: number;
		max?: number;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	};
}

// Error interface for better type safety
export interface ApiError {
	message: string;
	fields?: Record<string, string[]>;
	code?: string;
}

// ===================================
// COMPONENTS
// ===================================

// Extract field control outside component to prevent recreation on each render
export const FormFieldControl: React.FC<{ field: FieldConfig; fieldApi: any }> = ({
	field,
	fieldApi,
}) => {
	const hasErrors = fieldApi.state?.meta?.errors?.length > 0;

	const commonProps = {
		name: fieldApi.name,
		value: fieldApi.state?.value ?? "",
		onBlur: fieldApi.handleBlur,
		disabled: field.disabled,
		required: field.required,
		"aria-invalid": hasErrors,
		className: field.className,
	};

	switch (field.type) {
		case "textarea":
			return (
				<Textarea
					{...commonProps}
					placeholder={field.placeholder}
					onChange={(e) => fieldApi.handleChange(e.target.value)}
					rows={4}
				/>
			);

		case "editor":
			return (
				<MinimalTiptap
					content={fieldApi.state?.value ?? null}
					onChange={fieldApi.handleChange}
					placeholder={field.placeholder}
					editable={!field.disabled}
					className={field.className}
				/>
			);

		case "select":
			return (
				<Select
					value={fieldApi.state?.value ?? ""}
					onValueChange={(value) => {
						fieldApi.handleChange(value);
					}}
					disabled={field.disabled}
					required={field.required}
				>
					<SelectTrigger className="w-full" aria-invalid={hasErrors}>
						<SelectValue
							placeholder={field.placeholder || `Select ${field.label}`}
						/>
					</SelectTrigger>
					<SelectPositioner>
						<SelectContent>
							{field.options?.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</SelectPositioner>
				</Select>
			);

		case "checkbox":
			return (
				<Checkbox
					checked={fieldApi.state?.value ?? false}
					onCheckedChange={(checked) => fieldApi.handleChange(checked)}
					disabled={field.disabled}
					required={field.required}
					aria-invalid={hasErrors}
				/>
			);

		case "number":
			return (
				<Input
					{...commonProps}
					type="number"
					placeholder={field.placeholder}
					onChange={(e) => {
						const value = e.target.value;
						if (value === "") {
							fieldApi.handleChange(undefined);
						} else {
							const numValue = e.target.valueAsNumber;
							if (!Number.isNaN(numValue)) {
								fieldApi.handleChange(numValue);
							}
							// For invalid input, don't update the form value yet
						}
					}}
					min={field.validation?.min}
					max={field.validation?.max}
				/>
			);

		case "date":
			return (
				<Input
					{...commonProps}
					type="date"
					onChange={(e) => fieldApi.handleChange(e.target.value)}
				/>
			);

		case "tags":
			return (
				<TagInput
					value={fieldApi.state?.value ?? []}
					onChange={fieldApi.handleChange}
					placeholder={field.placeholder}
					disabled={field.disabled}
				/>
			);

		default:
			return (
				<Input
					{...commonProps}
					type={field.type}
					placeholder={field.placeholder}
					onChange={(e) => fieldApi.handleChange(e.target.value)}
					minLength={field.validation?.minLength}
					maxLength={field.validation?.maxLength}
					pattern={field.validation?.pattern?.source}
				/>
			);
	}
};

// ===================================
// FACTORIES
// ===================================

export function createFormComponent<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, any>,
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
					if (apiError.fields) {
						Object.entries(apiError.fields).forEach(
							([fieldName, messages]) => {
								form.setFieldMeta(fieldName, (prev) => ({
									...prev,
									errors: messages,
								}));
							},
						);
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
									{(mutationInstance.error as ApiError)?.message ||
										"Something went wrong"}
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
	TFormData = Record<string, any>,
>({
	mutationOptions,
	schema,
	onSuccess,
	defaultValues = {},
	entityName = "game",
}: {
	mutationOptions: () => UseMutationOptions<TData, TError, Options<TMutationData>>;
	schema: z.ZodSchema<TFormData>;
	onSuccess?: (data: TData) => void;
	defaultValues?: Partial<TFormData>;
	entityName?: string;
}) {
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
				if (apiError.fields) {
					Object.entries(apiError.fields).forEach(([fieldName, messages]) => {
						form.setFieldMeta(fieldName, (prev) => ({
							...prev,
							errors: messages,
						}));
					});
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

// ===================================
// EXPORTS
// ===================================

// Export the form hook for direct usage
export { useAppForm };
