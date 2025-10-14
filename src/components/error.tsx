import { ErrorComponent } from "@tanstack/react-router";
import { isApiError } from "~/utils/api-errors";
import { parseApiErrors } from "~/utils/parse-errors";

export function BasicErrorComponent({ error }: { error: unknown }) {
	if (isApiError(error)) {
		const parsedError = parseApiErrors(error);
		return <ErrorComponent error={parsedError} />;
	}

	return (
		<div>
			Error: <pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
}
