import type { AnyFieldApi } from "@tanstack/react-form";
import * as React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { TagInput } from "~/components/ui/composite/tag-input";
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
import type { FieldConfig } from "../types";

// Lazy load the editor component to reduce initial bundle size
const LazyTiptap = React.lazy(() =>
	import("~/components/ui/editor").then((module) => ({
		default: module.Tiptap,
	})),
);

// Fallback skeleton component that matches the editor's styling
const EditorSkeleton: React.FC = () => (
	<div className="border min-h-1/2 bg-input/30 rounded-lg overflow-hidden animate-pulse">
		<div className="border-b px-3 py-1.5 h-10 bg-muted/50" />
		<div className="min-h-[360px] px-3 pt-1 pb-2" />
	</div>
);

/**
 * Renders form field controls based on field configuration
 * Extract field control outside component to prevent recreation on each render
 */
export const FormFieldControl: React.FC<{
	field: FieldConfig;
	fieldApi: AnyFieldApi;
}> = ({ field, fieldApi }) => {
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
				<React.Suspense fallback={<EditorSkeleton />}>
					<LazyTiptap
						content={fieldApi.state?.value ?? null}
						onChange={fieldApi.handleChange}
						placeholder={field.placeholder}
						editable={!field.disabled}
						className={field.className}
					/>
				</React.Suspense>
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
