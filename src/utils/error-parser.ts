import type { ErrorDetails } from "~/api/types.gen";

interface ParsedError {
	message: string;
	code?: string;
	statusCode?: number;
	field?: string;
	details?: Record<string, unknown>;
}

// TODO: Fix the parsing of errors, I think we mostly use the details field, which has nested errors for each field

export function parseApiError(errorDetails: ErrorDetails | undefined): ParsedError {
	if (!errorDetails) {
		return {
			message: "An unknown error occurred",
		};
	}
	// Common field names to check for error information
	const messageFields = ["message", "error", "description", "detail", "msg"];
	const codeFields = ["code", "errorCode", "error_code", "type"];
	const statusFields = ["status", "statusCode", "status_code", "httpStatus"];
	const fieldFields = ["field", "fieldName", "property", "param"];

	const getMessage = (): string => {
		for (const field of messageFields) {
			const value = errorDetails[field];
			if (typeof value === "string" && value.length > 0) {
				return value;
			}
		}
		return "An unknown error occurred";
	};

	const getCode = (): string | undefined => {
		for (const field of codeFields) {
			const value = errorDetails[field];
			if (typeof value === "string" || typeof value === "number") {
				return String(value);
			}
		}
		return undefined;
	};

	const getStatusCode = (): number | undefined => {
		for (const field of statusFields) {
			const value = errorDetails[field];
			if (typeof value === "number") {
				return value;
			}
		}
		return undefined;
	};

	const getField = (): string | undefined => {
		for (const field of fieldFields) {
			const value = errorDetails[field];
			if (typeof value === "string") {
				return value;
			}
		}
		return undefined;
	};

	return {
		message: getMessage(),
		code: getCode(),
		statusCode: getStatusCode(),
		field: getField(),
		details: errorDetails,
	};
}
