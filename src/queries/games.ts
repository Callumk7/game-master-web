import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getGameOptions, listGameEntitiesOptions } from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useGetGameQuery = ({ id }: { id: string }) => {
	return useSuspenseQuery(getGameOptions({ path: { id } }));
};

export const useGetGameLinksQuery = ({ id }: { id: string }) => {
	return useQuery(listGameEntitiesOptions({ path: { game_id: id } }));
};
