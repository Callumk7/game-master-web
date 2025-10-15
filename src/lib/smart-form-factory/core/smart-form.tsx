import { useMutation } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { z } from "zod";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { parseApiErrors } from "~/utils/parse-errors";
import type { ApiError, FieldConfig, HookFormOptions, SmartFormOptions } from "../types";
import {
	processFormValuesForSubmission,
	processInitialValues,
} from "../utils/form-utils";
import {
	extractDefaultValues,
	generateFieldsFromSchema,
	getSchemaField,
	isFieldRequired,
	validateSchemaField,
} from "../utils/schema-utils";
import { FormFieldControl } from "./field-control";

const { useAppForm } = createFormHook();

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
		// Auto-generate fields from schema
		const fields = generateFieldsFromSchema(schema, fieldOverrides);
		const defaultValues = processInitialValues(
			initialValues ?? extractDefaultValues(schema),
			fields,
		);

		const mutationInstance = useMutation({
			...mutation(),
			onSuccess: (data) => {
				onSuccess?.(data);
				form.reset();
			},
		});

		const form = useAppForm({
			defaultValues,
			onSubmit: async ({ value }) => {
				try {
					// Convert editor objects to strings before validation
					const { processed: processedValue, mentions } =
						processFormValuesForSubmission(value, fields);

					// Convert mentions to links
					const links = mentions.map((mention) => ({
						entity_type: mention.type,
						entity_id: mention.id,
					}));

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
						body: { [entityName]: validatedData, links },
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
					// Check for the new 'errors' property instead of 'fields'
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
										// Skip validation for editor fields during editing
										if (fieldConfig.type === "editor") {
											return undefined;
										}

										// Use Zod for real-time validation, but be lenient during typing
										return validateSchemaField(
											schema,
											fieldConfig.name,
											value,
										);
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
	// Auto-generate fields from schema (needed for processing)
	const fields = generateFieldsFromSchema(schema, {});
	const defaultValues = processInitialValues(
		initialValues ?? extractDefaultValues(schema),
		fields,
	);

	const mutationInstance = useMutation({
		...mutation(),
		onSuccess: (data) => {
			onSuccess?.(data);
			form.reset();
		},
	});

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				// Convert editor objects to strings before validation
				const { processed: processedValue, mentions } =
					processFormValuesForSubmission(value, fields);

				// Convert mentions to links
				const links = mentions.map((mention) => ({
					entity_type: mention.type,
					entity_id: mention.id,
				}));

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
					body: { [entityName]: validatedData, links },
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
				// Check for the new 'errors' property instead of 'fields'
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
				required: isFieldRequired(schema, fieldName),
			};

			// Apply smart field type detection
			const zodField = getSchemaField(schema, fieldName);
			const actualType =
				zodField instanceof z.ZodOptional
					? zodField._zod.def.innerType
					: zodField;

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
				const elementType = actualType._zod.def?.element;
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

							return validateSchemaField(schema, fieldName, value);
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
