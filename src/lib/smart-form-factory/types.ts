import type { UseMutationOptions } from "@tanstack/react-query";
import type { z } from "zod";
import type { ErrorDetails } from "~/api";
import type { TDataShape } from "~/api/client/types.gen";
import type { Options } from "~/api/sdk.gen";

// ===================================
// FIELD CONFIGURATION TYPES
// ===================================

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

// ===================================
// API ERROR TYPES
// ===================================

export interface ApiError {
	errors?: ErrorDetails;
}

// ===================================
// SMART FORM FACTORY TYPES
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
	/** Field configuration overrides (use null to exclude a field) */
	fieldOverrides?: Partial<Record<string, Partial<FieldConfig> | null>>;
	/** CSS class for form container */
	className?: string;
	/** Custom submit button text */
	submitText?: string;
	/** Initial values for form fields (for edit forms) */
	initialValues?: Record<string, unknown>;
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
	initialValues?: Record<string, unknown>;
}

// ===================================
// LEGACY FORM FACTORY TYPES
// ===================================

export interface FormFactoryOptions<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, unknown>,
> {
	mutationOptions: () => UseMutationOptions<TData, TError, Options<TMutationData>>;
	schema: z.ZodSchema<TFormData>;
	fields: FieldConfig[];
	onSuccess?: (data: TData) => void;
	defaultValues?: Partial<TFormData>;
	className?: string;
	entityName?: string;
}

export interface UseFormWithMutationOptions<
	TData,
	TError,
	TMutationData extends TDataShape,
	TFormData = Record<string, unknown>,
> {
	mutationOptions: () => UseMutationOptions<TData, TError, Options<TMutationData>>;
	schema: z.ZodSchema<TFormData>;
	onSuccess?: (data: TData) => void;
	defaultValues?: Partial<TFormData>;
	entityName?: string;
}
