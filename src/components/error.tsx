import { ErrorComponent } from "@tanstack/react-router";
import { isApiError } from "~/utils/api-errors";
import { parseApiErrors } from "~/utils/parse-errors";

export function BasicErrorComponent({ error }: { error: unknown }) {
	if (isApiError(error)) {
		const parsedError = parseApiErrors(error);
		console.log("parsedError", parsedError);
		return <ErrorComponent error={new Error(parsedError)} />;
	}

	return (
		<div>
			Error: <pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
}
