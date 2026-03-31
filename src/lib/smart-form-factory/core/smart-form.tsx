import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";
import { Button } from "~/components/ui/button";
import { createFormHook } from "~/components/ui/form-tanstack";
import { MutationErrorDisplay } from "~/components/ui/mutation-error";
import { getFieldErrors } from "~/utils/api-errors";
import type { FieldConfig, HookFormOptions, SmartFormOptions } from "../types";
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
// SHARED: apply server field errors to form
// ===================================

/**
 * Map API field-level validation errors onto form field meta.
 * Works for both `ValidationApiError` and `SimpleApiError` (no-op for simple).
 */
function applyFieldErrors(
	error: unknown,
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form's setFieldMeta uses internal AnyFieldMetaBase
	setFieldMeta: (name: string, updater: (prev: any) => any) => void,
) {
	const fieldErrors = getFieldErrors(error);
	if (!fieldErrors) return;

	for (const [fieldName, messages] of Object.entries(fieldErrors)) {
		if (messages.length > 0) {
			setFieldMeta(fieldName, (prev: Record<string, unknown>) => ({
				...prev,
				errors: messages,
			}));
		}
	}
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
	resetOnSuccess = false,
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
				if (resetOnSuccess) {
					form.reset();
				}
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

					// Map API field-level errors onto form fields
					applyFieldErrors(error, form.setFieldMeta);

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

				<MutationErrorDisplay error={mutationInstance.error} className="mt-4" />
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
	resetOnSuccess = false,
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
			if (resetOnSuccess) {
				form.reset();
			}
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

				// Map API field-level errors onto form fields
				applyFieldErrors(error, form.setFieldMeta);

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
