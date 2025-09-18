import { useSuspenseQuery } from "@tanstack/react-query";
import { listFactionsOptions } from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListFactionsQuery = (gameId: string) => {
	return useSuspenseQuery({ ...listFactionsOptions({ path: { game_id: gameId } }) });
};
