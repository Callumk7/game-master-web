import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	completeObjectiveMutation,
	createObjectiveMutation,
	deleteObjectiveMutation,
	listGameObjectivesQueryKey,
	listObjectivesQueryKey,
	uncompleteObjectiveMutation,
} from "~/api/@tanstack/react-query.gen";
import type { Objective } from "~/api/types.gen";

interface UseObjectiveMutationsProps {
	gameId: string;
	questId: string;
	isGameList?: boolean;
}

export function useObjectiveMutations({
	gameId,
	questId,
	isGameList,
}: UseObjectiveMutationsProps) {
	const queryClient = useQueryClient();

	const queryKey = isGameList
		? listGameObjectivesQueryKey({ path: { game_id: gameId } })
		: listObjectivesQueryKey({
				path: { game_id: gameId, quest_id: questId },
			});

	const createObjective = useMutation({
		...createObjectiveMutation(),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey });

			const previousObjectives = queryClient.getQueryData(queryKey);

			const optimisticObjective: Objective = {
				id: `temp-${Date.now()}`,
				body: variables.body?.objective?.body || "",
				complete: false,
				quest_id: questId,
				note_link_id: undefined,
				inserted_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			queryClient.setQueryData(
				queryKey,
				(old: { data?: Objective[] } | undefined) => ({
					...old,
					data: [...(old?.data || []), optimisticObjective],
				}),
			);

			return { previousObjectives };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(queryKey, context?.previousObjectives);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const completeObjective = useMutation({
		...completeObjectiveMutation(),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey });
			const previousObjectives = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(
				queryKey,
				(old: { data?: Objective[] } | undefined) => ({
					...old,
					data:
						old?.data?.map((obj: Objective) =>
							obj.id === variables.path.objective_id
								? { ...obj, complete: true }
								: obj,
						) || [],
				}),
			);

			return { previousObjectives };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(queryKey, context?.previousObjectives);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const uncompleteObjective = useMutation({
		...uncompleteObjectiveMutation(),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey });
			const previousObjectives = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(
				queryKey,
				(old: { data?: Objective[] } | undefined) => ({
					...old,
					data:
						old?.data?.map((obj: Objective) =>
							obj.id === variables.path.objective_id
								? { ...obj, complete: false }
								: obj,
						) || [],
				}),
			);

			return { previousObjectives };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(queryKey, context?.previousObjectives);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const deleteObjective = useMutation({
		...deleteObjectiveMutation(),
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey });
			const previousObjectives = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(
				queryKey,
				(old: { data?: Objective[] } | undefined) => ({
					...old,
					data:
						old?.data?.filter(
							(obj: Objective) => obj.id !== variables.path.id,
						) || [],
				}),
			);

			return { previousObjectives };
		},
		onError: (_err, _variables, context) => {
			queryClient.setQueryData(queryKey, context?.previousObjectives);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const handleCreateObjective = (objectiveText: string) => {
		createObjective.mutate({
			path: { game_id: gameId, quest_id: questId },
			body: { objective: { body: objectiveText } },
		});
	};

	const handleToggleComplete = (objectiveId: string, currentComplete: boolean) => {
		const mutation = currentComplete ? uncompleteObjective : completeObjective;
		mutation.mutate({
			path: { game_id: gameId, quest_id: questId, objective_id: objectiveId },
		});
	};

	const handleDeleteObjective = (objectiveId: string) => {
		deleteObjective.mutate({
			path: { game_id: gameId, quest_id: questId, id: objectiveId },
		});
	};

	return {
		createObjective: {
			mutate: handleCreateObjective,
			isPending: createObjective.isPending,
		},
		toggleComplete: handleToggleComplete,
		deleteObjective: {
			mutate: handleDeleteObjective,
			isPending: deleteObjective.isPending,
		},
	};
}
