import { ErrorComponent } from "@tanstack/react-router";
import { getErrorMessage, isApiError } from "~/utils/api-errors";

export function BasicErrorComponent({ error }: { error: unknown }) {
	const message = getErrorMessage(error);

	if (isApiError(error)) {
		return <ErrorComponent error={new Error(message)} />;
	}

	if (error instanceof Error) {
		return <ErrorComponent error={error} />;
	}

	return (
		<div>
			Error: <pre>{JSON.stringify(error, null, 2)}</pre>
		</div>
	);
}
