/** biome-ignore-all lint/suspicious/noExplicitAny: factory component */

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";

import { z } from "zod";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { type ApiError, type FieldConfig, FormFieldControl } from "./factory-v2";
import { extractDefaultValues, generateFieldsFromSchema } from "./type-utils";

const { useAppForm } = createFormHook();

// ===================================
// SMART FACTORY TYPES
// ===================================

export interface SmartFormOptions<TData, TError, TMutationData extends TDataShape> {
	/** Generated mutation function from OpenAPI */
	mutation: (
		options?: Partial<Options<TMutationData>>,
	) => UseMutationOptions<TData, TError, Options<TMutationData>>;
	/** Zod schema for validation */
	schema: z.ZodObject<z.ZodRawShape>;
	/** Entity name for API request body wrapping */
	entityName: string;
	/** Success callback */
	onSuccess?: (data: TData) => void;
	/** Field configuration overrides */
	fieldOverrides?: Partial<Record<string, Partial<FieldConfig>>>;
	/** CSS class for form container */
	className?: string;
	/** Custom submit button text */
	submitText?: string;
}

export interface HookFormOptions<TData, TError, TMutationData extends TDataShape> {
	/** Generated mutation function from OpenAPI */
	mutation: (
		options?: Partial<Options<TMutationData>>,
	) => UseMutationOptions<TData, TError, Options<TMutationData>>;
	/** Zod schema for validation */
	schema: z.ZodObject<z.ZodRawShape>;
	/** Entity name for API request body wrapping */
	entityName: string;
	/** Success callback */
	onSuccess?: (data: TData) => void;
}

// ===================================
// SMART FORM FACTORY
// ===================================

/**
 * Creates a form component with automatic field generation from Zod schema
 * Eliminates the need for manual field configuration and default values
 */
export function createSmartForm<TData, TError, TMutationData extends TDataShape>({
	mutation,
	schema,
	entityName,
	onSuccess,
	fieldOverrides = {},
	className = "space-y-6",
	submitText = "Submit",
}: SmartFormOptions<TData, TError, TMutationData>) {
	return function SmartFormComponent() {
		const queryClient = useQueryClient();

		// Auto-generate fields from schema
		const fields = generateFieldsFromSchema(schema, fieldOverrides);
		const defaultValues = extractDefaultValues(schema);

		const mutationInstance = useMutation({
			...mutation(),
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
						for (const issue of error.issues) {
							if (issue.path.length > 0) {
								const fieldName = issue.path[0] as string;
								form.setFieldMeta(fieldName, (prev) => ({
									...prev,
									errors: [issue.message],
								}));
							}
						}
					}

					// Handle API field errors
					const apiError = error as ApiError;
					if (apiError.fields) {
						for (const [fieldName, messages] of Object.entries(
							apiError.fields,
						)) {
							form.setFieldMeta(fieldName, (prev) => ({
								...prev,
								errors: messages,
							}));
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
										// Use Zod for real-time validation, but be lenient during typing
										const fieldSchema = (schema.shape as any)[
											fieldConfig.name
										];
										if (fieldSchema && value !== undefined && value !== "") {
											const result = fieldSchema.safeParse(value);
											if (!result.success) {
												return (
													result.error.issues[0]?.message ||
													"Invalid value"
												);
											}
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
								{mutationInstance.isPending
									? "Submitting..."
									: submitText}
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

/**
 * Hook version for more control over form rendering
 * Auto-generates defaults and provides smart field rendering
 */
export function useSmartForm<TData, TError, TMutationData extends TDataShape>({
	mutation,
	schema,
	entityName,
	onSuccess,
}: HookFormOptions<TData, TError, TMutationData>) {
	const queryClient = useQueryClient();
	const defaultValues = extractDefaultValues(schema);

	const mutationInstance = useMutation({
		...mutation(),
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
					for (const issue of error.issues) {
						if (issue.path.length > 0) {
							const fieldName = issue.path[0] as string;
							form.setFieldMeta(fieldName, (prev) => ({
								...prev,
								errors: [issue.message],
							}));
						}
					}
				}

				const apiError = error as ApiError;
				if (apiError.fields) {
					for (const [fieldName, messages] of Object.entries(apiError.fields)) {
						form.setFieldMeta(fieldName, (prev) => ({
							...prev,
							errors: messages,
						}));
					}
				}
				throw error;
			}
		},
	});

	return {
		form,
		mutation: mutationInstance,

		/**
		 * Render a field with auto-generated configuration
		 */
		renderSmartField: (fieldName: string, overrides: Partial<FieldConfig> = {}) => {
			const fieldConfig: FieldConfig = {
				name: fieldName,
				label: fieldName
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (str) => str.toUpperCase()),
				type: "text",
				required: !(schema.shape as any)[fieldName]?.isOptional?.(),
				...overrides,
			};

			return (
				<form.AppField
					key={fieldName}
					name={fieldName}
					validators={{
						onChange: ({ value }) => {
							const fieldSchema = (schema.shape as any)[fieldName];
							if (fieldSchema && value !== undefined && value !== "") {
								const result = fieldSchema.safeParse(value);
								if (!result.success) {
									return (
										result.error.issues[0]?.message || "Invalid value"
									);
								}
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
			);
		},
	};
}
