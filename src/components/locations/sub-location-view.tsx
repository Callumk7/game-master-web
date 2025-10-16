import { useGetLocationTreeQuery } from "~/api/@tanstack/react-query.gen";
import { Spinner } from "../ui/spinner";
import { LocationTreeView } from "./location-tree-view";

interface SubLocationViewProps {
	gameId: string;
	locationId: string;
}

export function SubLocationView({ gameId, locationId }: SubLocationViewProps) {
	const { data: locationTreeResponse, isLoading } = useGetLocationTreeQuery({
		path: { game_id: gameId },
		query: { start_id: locationId },
	});

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<LocationTreeView gameId={gameId} locationTreeResponse={locationTreeResponse} />
	);
}
