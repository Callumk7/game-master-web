// ===================================
// MAIN EXPORTS
// ===================================

// Field control component
export { FormFieldControl } from "./core/field-control";

// Legacy form factory (for backward compatibility)
export {
	createFormComponent,
	useAppForm,
	useFormWithMutation,
} from "./core/form-factory";
// Smart form factory (recommended)
export { createSmartForm, useSmartForm } from "./core/smart-form";

// ===================================
// UTILITIES
// ===================================

// Form processing utilities
export { processFormValuesForSubmission, processInitialValues } from "./utils/form-utils";
// Schema utilities
export { extractDefaultValues, generateFieldsFromSchema } from "./utils/schema-utils";

// ===================================
// SCHEMAS
// ===================================

// Predefined schemas
export { createSchemaFor, schemas } from "./schemas";

// ===================================
// TYPES
// ===================================

// Export all types
export type {
	ApiError,
	FieldConfig,
	FormFactoryOptions,
	HookFormOptions,
	SmartFormOptions,
	UseFormWithMutationOptions,
} from "./types";

