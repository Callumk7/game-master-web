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
	/** Initial values for form fields (for edit forms) */
	initialValues?: Record<string, any>;
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
	/** Initial values for form fields (for edit forms) */
	initialValues?: Record<string, any>;
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
	initialValues,
}: SmartFormOptions<TData, TError, TMutationData>) {
	return function SmartFormComponent() {
		const queryClient = useQueryClient();

		// Auto-generate fields from schema
		const fields = generateFieldsFromSchema(schema, fieldOverrides);
		const defaultValues = processInitialValues(
			initialValues ?? extractDefaultValues(schema),
			fields,
		);

		const mutationInstance = useMutation({
			...mutation(),
			onSuccess: (data) => {
				queryClient.invalidateQueries();
				onSuccess?.(data);
				form.reset();
			},
		});

		const form = useAppForm({
			defaultValues,
			onSubmit: async ({ value }) => {
				try {
					// Convert editor objects to strings before validation
					const processedValue = processFormValuesForSubmission(value, fields);

					// Auto-extend schema to include _plain_text fields for editor fields
					const extendedSchema = fields.reduce((acc, field) => {
						if (field.type === "editor") {
							return acc.extend({
								[`${field.name}_plain_text`]: z.string().optional(),
							});
						}
						return acc;
					}, schema);

					const validatedData = extendedSchema.parse(processedValue);
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
										// Skip validation for editor fields during editing
										if (fieldConfig.type === "editor") {
											return undefined;
										}

										// Use Zod for real-time validation, but be lenient during typing
										const fieldSchema = (schema.shape as any)[
											fieldConfig.name
										];
										if (
											fieldSchema &&
											value !== undefined &&
											value !== ""
										) {
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
	initialValues,
}: HookFormOptions<TData, TError, TMutationData>) {
	const queryClient = useQueryClient();

	// Auto-generate fields from schema (needed for processing)
	const fields = generateFieldsFromSchema(schema, {});
	const defaultValues = processInitialValues(
		initialValues ?? extractDefaultValues(schema),
		fields,
	);

	const mutationInstance = useMutation({
		...mutation(),
		onSuccess: (data) => {
			queryClient.invalidateQueries();
			onSuccess?.(data);
			form.reset();
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				// Convert editor objects to strings before validation
				const processedValue = processFormValuesForSubmission(value, fields);

				// Auto-extend schema to include _plain_text fields for editor fields
				const extendedSchema = fields.reduce((acc, field) => {
					if (field.type === "editor") {
						return acc.extend({
							[`${field.name}_plain_text`]: z.string().optional(),
						});
					}
					return acc;
				}, schema);

				const validatedData = extendedSchema.parse(processedValue);
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
			// Start with basic field config
			let fieldConfig: FieldConfig = {
				name: fieldName,
				label: fieldName
					.replace(/([A-Z])/g, " $1")
					.replace(/^./, (str) => str.toUpperCase()),
				type: "text",
				required: !(schema.shape as any)[fieldName]?.isOptional?.(),
			};

			// Apply smart field type detection
			const zodField = (schema.shape as any)[fieldName];
			const actualType =
				zodField instanceof z.ZodOptional ? zodField._def.innerType : zodField;

			if (actualType instanceof z.ZodString) {
				// Check for rich text editor fields (complex content)
				if (
					fieldName.includes("content") ||
					fieldName.includes("description") ||
					fieldName.includes("notes") ||
					fieldName.includes("body") ||
					fieldName.includes("message")
				) {
					fieldConfig.type = "editor";
				}
			} else if (actualType instanceof z.ZodEnum) {
				fieldConfig.type = "select";
				const enumValues = actualType.options || [];
				fieldConfig.options = enumValues.map((value) => ({
					value: String(value),
					label: String(value).charAt(0).toUpperCase() + String(value).slice(1),
				}));
			} else if (actualType instanceof z.ZodArray) {
				// Check if it's an array of strings, likely for tags
				const elementType = actualType._def?.element;
				if (elementType instanceof z.ZodString) {
					fieldConfig.type = "tags";
				}
			}

			// Apply any overrides
			fieldConfig = { ...fieldConfig, ...overrides };

			return (
				<form.AppField
					key={fieldName}
					name={fieldName}
					validators={{
						onChange: ({ value }) => {
							// Skip validation for editor fields during editing
							if (fieldConfig.type === "editor") {
								return undefined;
							}

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

const processInitialValues = (
	initialValues: Record<string, any>,
	fields: FieldConfig[],
) => {
	if (!initialValues) return initialValues;

	const processed = { ...initialValues };

	fields.forEach((field) => {
		if (field.type === "editor" && typeof processed[field.name] === "string") {
			const stringValue = processed[field.name] as string;

			// Try to parse as JSON first
			try {
				const parsed = JSON.parse(stringValue);
				// Verify it's a valid TipTap document structure
				if (parsed && typeof parsed === "object" && parsed.type) {
					processed[field.name] = parsed;
					return;
				}
			} catch {
				// Not JSON, continue to plain text handling
			}

			// Handle as plain text - convert to TipTap document structure
			if (stringValue.trim()) {
				processed[field.name] = {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: stringValue,
								},
							],
						},
					],
				};
			} else {
				// Empty string becomes null
				processed[field.name] = null;
			}
		}
	});

	return processed;
};

const processFormValuesForSubmission = (
	value: Record<string, any>,
	fields: FieldConfig[],
) => {
	const processed = { ...value };

	fields.forEach((field) => {
		const fieldValue = processed[field.name];

		// Handle new editor format with both JSON and text
		if (
			field.type === "editor" &&
			typeof fieldValue === "object" &&
			fieldValue !== null &&
			"json" in fieldValue &&
			"text" in fieldValue
		) {
			// Set the main field to the JSON string
			processed[field.name] = JSON.stringify(fieldValue.json);
			// Set the plain text field
			processed[`${field.name}_plain_text`] = fieldValue.text;
		} else if (
			field.type === "editor" &&
			typeof fieldValue === "object" &&
			fieldValue !== null
		) {
			// Backward compatibility: if it's just a TipTap object
			processed[field.name] = JSON.stringify(fieldValue);
		}
		// If it's already a string, leave it as is
		// If it's null/undefined, leave it as is
	});

	return processed;
};
