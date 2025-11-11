import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createObjectiveMutation,
	listGameObjectivesQueryKey,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { QuestSelect } from "./quest-select";

interface CreateObjectiveFormProps {
	gameId: string;
	onSuccess?: () => void;
}

export function CreateObjectiveForm({ gameId, onSuccess }: CreateObjectiveFormProps) {
	const queryClient = useQueryClient();
	const [objectiveTitle, setObjectiveTitle] = React.useState("");
	const [selectedQuestId, setSelectedQuestId] = React.useState<string | undefined>(
		undefined,
	);

	// Fetch quests for the dropdown
	const { data: questsData, isLoading: questsLoading } = useListQuestsQuery({
		path: { game_id: gameId },
	});
	const quests = questsData?.data || [];

	// Create objective mutation
	const mutation = useMutation({
		...createObjectiveMutation(),
		onSuccess: () => {
			toast.success("Objective created successfully!");

			// Invalidate objectives query to refetch
			queryClient.invalidateQueries({
				queryKey: listGameObjectivesQueryKey({
					path: { game_id: gameId },
				}),
			});

			// Reset form
			setObjectiveTitle("");
			setSelectedQuestId(undefined);

			// Call optional success callback
			if (onSuccess) {
				onSuccess();
			}
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to create objective",
			);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!objectiveTitle.trim()) {
			toast.error("Please enter an objective title");
			return;
		}

		if (!selectedQuestId) {
			toast.error("Please select a quest");
			return;
		}

		mutation.mutate({
			path: {
				game_id: gameId,
				quest_id: selectedQuestId,
			},
			body: {
				objective: {
					body: objectiveTitle.trim(),
				},
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="objective-title">Objective Title</Label>
				<Input
					id="objective-title"
					type="text"
					placeholder="Enter objective description"
					value={objectiveTitle}
					onChange={(e) => setObjectiveTitle(e.target.value.trim())}
					disabled={mutation.isPending}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="quest-select">Quest</Label>
				{questsLoading ? (
					<div className="text-muted-foreground text-sm p-2 border rounded-md">
						Loading quests...
					</div>
				) : quests.length === 0 ? (
					<div className="text-muted-foreground text-sm p-2 border border-dashed rounded-md">
						No quests available. Create a quest first to add objectives.
					</div>
				) : (
					<QuestSelect
						quests={quests}
						value={selectedQuestId}
						onChange={setSelectedQuestId}
						placeholder="Select a quest"
						disabled={mutation.isPending}
						required
					/>
				)}
			</div>

			<div className="flex gap-2">
				<Button
					type="submit"
					disabled={
						mutation.isPending ||
						!objectiveTitle.trim() ||
						!selectedQuestId ||
						questsLoading ||
						quests.length === 0
					}
				>
					{mutation.isPending ? "Creating..." : "Create Objective"}
				</Button>

				<Button
					type="button"
					variant="outline"
					onClick={() => {
						setObjectiveTitle("");
						setSelectedQuestId(undefined);
					}}
					disabled={mutation.isPending}
				>
					Reset
				</Button>
			</div>

			{mutation.isError && (
				<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
					<p className="text-sm">
						{mutation.error instanceof Error
							? mutation.error.message
							: "Failed to create objective. Please try again."}
					</p>
				</div>
			)}
		</form>
	);
}
