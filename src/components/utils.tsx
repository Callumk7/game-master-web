import { Badge } from "./ui/badge";

export const createBadges = (tags: string[] | undefined) => {
	if (!tags || tags.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);
};
