import { Input } from "../input";
import { Label } from "../label";

interface FormFieldProps extends React.ComponentProps<typeof Input> {
	label: string;
}

export function FormField({ label, className, id, ...props }: FormFieldProps) {
	const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;

	return (
		<div className="space-y-1">
			<Label htmlFor={inputId}>{label}</Label>
			<Input id={inputId} className={className} {...props} />
		</div>
	);
}
