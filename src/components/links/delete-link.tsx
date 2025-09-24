import { Trash } from "lucide-react";
import type { EntityType } from "~/types";
import { Button } from "../ui/button";
import { useDeleteLink } from "./hooks/useDeleteLink";

interface DeleteLinkProps {
	gameId: string;
	sourceId: string;
	sourceType: EntityType;
	targetId: string;
	targetType: EntityType;
}

export function DeleteLink({
	gameId,
	sourceId,
	sourceType,
	targetId,
	targetType,
}: DeleteLinkProps) {
	const deleteLink = useDeleteLink();

	const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		deleteLink.mutateAsync({
			gameId,
			sourceId,
			sourceType,
			targetId,
			targetType,
		});
	};

	return (
		<Button variant="ghost" size="icon" onClick={handleDelete}>
			<Trash className="w-3 h-3" />
		</Button>
	);
}
