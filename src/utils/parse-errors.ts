import type { _Error } from "~/api";

/**
 * Parses an ApiError object into a formatted string.
 * @param apiError The error object from the API.
 * @returns A string representing the formatted errors, or a default message.
 */
export const parseApiErrors = (apiError: _Error): string => {
	// Check if the errors object exists and is not empty
	if (!apiError.errors || Object.keys(apiError.errors).length === 0) {
		return "An unknown error occurred.";
	}

	// Map each error to a "Field: Message" string and join them with a newline
	const errorMessages = Object.entries(apiError.errors)
		.map(([field, message]) => {
			// Capitalize the first letter of the field for better readability
			const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
			return `${formattedField}: ${String(message)}`;
		})
		.join("\n"); // Use newline to separate multiple errors

	return errorMessages;
};
