import type { FieldConfig } from "../types";

/**
 * Process initial values for form fields, handling editor field conversions
 */
export const processInitialValues = (
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

/**
 * Process form values for submission, handling editor field conversions
 */
export const processFormValuesForSubmission = (
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
