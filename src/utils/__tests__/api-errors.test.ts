import { describe, expect, it } from "vitest";
import {
	enrichWithStatus,
	getErrorMessage,
	getErrorStatus,
	getFieldErrors,
	isApiError,
	isSimpleApiError,
	isValidationApiError,
	parseError,
} from "../api-errors";

// =============================================================================
// Test fixtures
// =============================================================================

const simpleError = { error: "Resource not found" };
const validationError = {
	errors: {
		email: ["has invalid format", "has already been taken"],
		name: ["can't be blank"],
	},
};
const emptyValidationError = { errors: {} };

// =============================================================================
// Type guards
// =============================================================================

describe("isSimpleApiError", () => {
	it("returns true for a valid simple error", () => {
		expect(isSimpleApiError(simpleError)).toBe(true);
	});

	it("returns false for a validation error", () => {
		expect(isSimpleApiError(validationError)).toBe(false);
	});

	it("returns false for null", () => {
		expect(isSimpleApiError(null)).toBe(false);
	});

	it("returns false for a string", () => {
		expect(isSimpleApiError("some error")).toBe(false);
	});

	it("returns false for an Error instance", () => {
		expect(isSimpleApiError(new Error("fail"))).toBe(false);
	});

	it("returns false for an object without the error key", () => {
		expect(isSimpleApiError({ message: "nope" })).toBe(false);
	});

	it("returns false for { error: 123 } (non-string)", () => {
		expect(isSimpleApiError({ error: 123 })).toBe(false);
	});
});

describe("isValidationApiError", () => {
	it("returns true for a valid validation error", () => {
		expect(isValidationApiError(validationError)).toBe(true);
	});

	it("returns true for empty errors map", () => {
		expect(isValidationApiError(emptyValidationError)).toBe(true);
	});

	it("returns false for a simple error", () => {
		expect(isValidationApiError(simpleError)).toBe(false);
	});

	it("returns false for null", () => {
		expect(isValidationApiError(null)).toBe(false);
	});

	it("returns false for { errors: 'string' }", () => {
		expect(isValidationApiError({ errors: "bad" })).toBe(false);
	});
});

describe("isApiError", () => {
	it("returns true for a simple error", () => {
		expect(isApiError(simpleError)).toBe(true);
	});

	it("returns true for a validation error", () => {
		expect(isApiError(validationError)).toBe(true);
	});

	it("returns false for arbitrary objects", () => {
		expect(isApiError({ foo: "bar" })).toBe(false);
	});

	it("returns false for primitives", () => {
		expect(isApiError(42)).toBe(false);
		expect(isApiError(undefined)).toBe(false);
	});
});

// =============================================================================
// enrichWithStatus / getErrorStatus
// =============================================================================

describe("enrichWithStatus & getErrorStatus", () => {
	it("attaches status to an object error", () => {
		const err = { error: "Not found" };
		const enriched = enrichWithStatus(err, 404);
		expect(getErrorStatus(enriched)).toBe(404);
	});

	it("status is not enumerable", () => {
		const err = { error: "Forbidden" };
		const enriched = enrichWithStatus(err, 403);
		expect(Object.keys(enriched)).not.toContain(Symbol.for("apiErrorStatus"));
		// JSON.stringify should not include the symbol
		expect(JSON.stringify(enriched)).toBe('{"error":"Forbidden"}');
	});

	it("returns undefined for non-object errors", () => {
		expect(getErrorStatus("string error")).toBeUndefined();
		expect(getErrorStatus(null)).toBeUndefined();
		expect(getErrorStatus(42)).toBeUndefined();
	});
});

// =============================================================================
// parseError
// =============================================================================

describe("parseError", () => {
	it("parses a simple API error", () => {
		const parsed = parseError(simpleError);
		expect(parsed.kind).toBe("simple");
		if (parsed.kind === "simple") {
			expect(parsed.error).toBe("Resource not found");
		}
	});

	it("parses a validation API error", () => {
		const parsed = parseError(validationError);
		expect(parsed.kind).toBe("validation");
		if (parsed.kind === "validation") {
			expect(parsed.errors.email).toEqual([
				"has invalid format",
				"has already been taken",
			]);
		}
	});

	it("wraps unknown values as unknown kind", () => {
		const parsed = parseError("just a string");
		expect(parsed.kind).toBe("unknown");
		if (parsed.kind === "unknown") {
			expect(parsed.raw).toBe("just a string");
		}
	});

	it("wraps Error instances as unknown kind", () => {
		const parsed = parseError(new Error("boom"));
		expect(parsed.kind).toBe("unknown");
	});

	it("wraps null as unknown kind", () => {
		const parsed = parseError(null);
		expect(parsed.kind).toBe("unknown");
	});

	it("is idempotent — already-parsed errors pass through", () => {
		const first = parseError(simpleError);
		const second = parseError(first);
		expect(second).toBe(first);
	});

	it("preserves enriched status through parsing", () => {
		const err = enrichWithStatus({ error: "Unauthorized" }, 401);
		const parsed = parseError(err);
		expect(parsed.kind).toBe("simple");
		expect(getErrorStatus(parsed)).toBe(401);
	});
});

// =============================================================================
// getErrorMessage
// =============================================================================

describe("getErrorMessage", () => {
	it("extracts message from a simple API error", () => {
		expect(getErrorMessage(simpleError)).toBe("Resource not found");
	});

	it("formats a validation API error with field names", () => {
		const msg = getErrorMessage(validationError);
		expect(msg).toContain("Email:");
		expect(msg).toContain("has invalid format");
		expect(msg).toContain("has already been taken");
		expect(msg).toContain("Name:");
		expect(msg).toContain("can't be blank");
	});

	it("returns the fallback for empty validation errors", () => {
		expect(getErrorMessage(emptyValidationError)).toBe("Validation failed.");
	});

	it("extracts message from a parsed ApiError (simple)", () => {
		const parsed = parseError(simpleError);
		expect(getErrorMessage(parsed)).toBe("Resource not found");
	});

	it("extracts message from a parsed ApiError (validation)", () => {
		const parsed = parseError(validationError);
		expect(getErrorMessage(parsed)).toContain("Email:");
	});

	it("extracts message from a parsed ApiError (unknown wrapping an Error)", () => {
		const parsed = parseError(new Error("network failure"));
		expect(getErrorMessage(parsed)).toBe("network failure");
	});

	it("extracts message from a JS Error instance", () => {
		expect(getErrorMessage(new Error("oh no"))).toBe("oh no");
	});

	it("returns the string directly for string errors", () => {
		expect(getErrorMessage("connection refused")).toBe("connection refused");
	});

	it("returns the default fallback for null/undefined", () => {
		expect(getErrorMessage(null)).toBe("Something went wrong. Please try again.");
		expect(getErrorMessage(undefined)).toBe(
			"Something went wrong. Please try again.",
		);
	});

	it("accepts a custom fallback message", () => {
		expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
	});

	it("returns the default fallback for empty string", () => {
		expect(getErrorMessage("")).toBe("Something went wrong. Please try again.");
	});
});

// =============================================================================
// getFieldErrors
// =============================================================================

describe("getFieldErrors", () => {
	it("returns field errors from a validation error", () => {
		const fields = getFieldErrors(validationError);
		expect(fields).toEqual({
			email: ["has invalid format", "has already been taken"],
			name: ["can't be blank"],
		});
	});

	it("returns field errors from a parsed validation error", () => {
		const parsed = parseError(validationError);
		const fields = getFieldErrors(parsed);
		expect(fields).toEqual({
			email: ["has invalid format", "has already been taken"],
			name: ["can't be blank"],
		});
	});

	it("returns null for a simple error", () => {
		expect(getFieldErrors(simpleError)).toBeNull();
	});

	it("returns null for an Error instance", () => {
		expect(getFieldErrors(new Error("boom"))).toBeNull();
	});

	it("returns null for null", () => {
		expect(getFieldErrors(null)).toBeNull();
	});
});
