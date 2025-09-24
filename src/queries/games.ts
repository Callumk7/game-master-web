import { useSuspenseQuery } from "@tanstack/react-query";
import { getGameOptions, listGameEntitiesOptions } from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useGetGameSuspenseQuery = ({ id }: { id: string }) => {
	return useSuspenseQuery(getGameOptions({ path: { id } }));
};

export const useGetGameLinksSuspenseQuery = ({ id }: { id: string }) => {
	return useSuspenseQuery(listGameEntitiesOptions({ path: { game_id: id } }));
};
