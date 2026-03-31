import { XCircle } from "lucide-react";
import { getErrorMessage, getFieldErrors } from "~/utils/api-errors";
import { cn } from "~/utils/cn";

interface MutationErrorDisplayProps {
	/** The error from a mutation (e.g. `mutation.error`). Renders nothing if null/undefined. */
	error: unknown;
	/** Optional className override/addition for the container */
	className?: string;
	/** Whether to show individual field errors as a list (default: true) */
	showFieldErrors?: boolean;
}

/**
 * Reusable error display for mutation failures.
 *
 * Handles both simple API errors (`{ error: "..." }`) and validation errors
 * (`{ errors: { field: [...] } }`), rendering a user-friendly message.
 *
 * Usage:
 * ```tsx
 * <MutationErrorDisplay error={mutation.error} />
 * ```
 */
export function MutationErrorDisplay({
	error,
	className,
	showFieldErrors = true,
}: MutationErrorDisplayProps) {
	if (error == null) return null;

	const fieldErrors = showFieldErrors ? getFieldErrors(error) : null;
	const message = fieldErrors ? null : getErrorMessage(error);

	return (
		<div
			className={cn(
				"bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md",
				className,
			)}
			role="alert"
		>
			<div className="flex items-start gap-3">
				<XCircle className="h-5 w-5 shrink-0 mt-0.5" />
				<div className="min-w-0">
					{fieldErrors ? (
						<FieldErrorList errors={fieldErrors} />
					) : (
						<p className="text-sm">{message}</p>
					)}
				</div>
			</div>
		</div>
	);
}

function FieldErrorList({ errors }: { errors: Record<string, string[]> }) {
	const entries = Object.entries(errors);
	if (entries.length === 0) {
		return <p className="text-sm">Validation failed.</p>;
	}

	return (
		<ul className="text-sm space-y-1 list-none p-0 m-0">
			{entries.map(([field, messages]) => {
				const label = field.charAt(0).toUpperCase() + field.slice(1);
				return (
					<li key={field}>
						<span className="font-medium">{label}:</span>{" "}
						{messages.join(", ")}
					</li>
				);
			})}
		</ul>
	);
}
