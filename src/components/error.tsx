import { ErrorComponent } from "@tanstack/react-router";
import { isApiError } from "~/utils/api-errors";
import { parseApiError } from "~/utils/error-parser";

export function BasicErrorComponent({ error }: { error: unknown }) {
	if (isApiError(error)) {
		const parsedError = parseApiError(error.errors);
		return <ErrorComponent error={parsedError} />;
	}

	return (
		<div>
			Error: <pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
}
