import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FormField } from "./ui/composite/form-field";

export function Auth({
	actionText,
	onSubmit,
	status,
	afterSubmit,
}: {
	actionText: string;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	status: "pending" | "idle" | "success" | "error";
	afterSubmit?: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{actionText}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					className="space-y-4"
				>
					<FormField id="email" label="Email" name="email" type="email" />
					<FormField
						id="password"
						label="Password"
						name="password"
						type="password"
					/>
					<Button type="submit" disabled={status === "pending"}>
						{status === "pending" ? "..." : actionText}
					</Button>
					{afterSubmit ? afterSubmit : null}
				</form>
			</CardContent>
		</Card>
	);
}
