import { Link } from "~/components/ui/link";

export function EntityCreationLink({
	gameId,
	entityId,
	label,
	message,
	to,
}: {
	gameId: string;
	entityId: string;
	label: string;
	message?: string;
	to: string;
}) {
	return (
		<div className="flex flex-col gap-2">
			{message ? <div className="text-sm text-foreground">{message}</div> : null}
			<Link to={to} params={{ gameId, id: entityId }} variant="outline" size="sm">
				{label}
			</Link>
		</div>
	);
}
