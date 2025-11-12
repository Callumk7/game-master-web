import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FormField } from "./ui/composite/form-field";
import { Link } from "./ui/link";

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
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-2xl">{actionText}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(e);
					}}
					className="space-y-4 w-full flex flex-col"
				>
					<FormField id="email" label="Email" name="email" type="email" />
					<FormField
						id="password"
						label="Password"
						name="password"
						type="password"
					/>
					<Button type="submit" disabled={status === "pending"}>
						{status === "pending" ? "Loading..." : actionText}
					</Button>
					<div className="text-center text-sm text-muted-foreground">
						{actionText === "Login" ? (
							<>
								Don't have an account?{" "}
								<Link to="/signup" className="text-primary hover:underline">
									Sign up
								</Link>
							</>
						) : (
							<>
								Already have an account?{" "}
								<Link to="/login" className="text-primary hover:underline">
									Log in
								</Link>
							</>
						)}
					</div>
					{afterSubmit ? afterSubmit : null}
				</form>
			</CardContent>
		</Card>
	);
}
