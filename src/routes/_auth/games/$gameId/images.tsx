import { createFileRoute } from "@tanstack/react-router";
import {
	listGameImagesOptions,
	useListGameImagesQuery,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { ImageGrid } from "~/components/images/image-grid";

export const Route = createFileRoute("/_auth/games/$gameId/images")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			listGameImagesOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const {
		data: imageData,
		isLoading,
		isSuccess,
	} = useListGameImagesQuery({ path: { game_id: gameId } });
	return (
		<Container>
			{isLoading && <p>Loading...</p>}
			{isSuccess && <ImageGrid gameId={gameId} images={imageData.data} />}
		</Container>
	);
}
