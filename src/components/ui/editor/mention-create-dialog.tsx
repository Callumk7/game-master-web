import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import {
	createCharacterMutation,
	createFactionMutation,
	createLocationMutation,
	createNoteMutation,
	createQuestMutation,
	listCharactersQueryKey,
	listFactionsQueryKey,
	listGameEntitiesQueryKey,
	listLocationsQueryKey,
	listNotesQueryKey,
	listQuestsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { Button } from "../button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../dialog";
import { Input } from "../input";
import { Label } from "../label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "../select";
import type { MentionItem } from "./mention-extension-simple";

interface MentionCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	entityType: MentionItem["type"];
	defaultName?: string;
	gameId: string;
	onSuccess: (entity: { id: string; name: string; type: MentionItem["type"] }) => void;
}

export function MentionCreateDialog({
	open,
	onOpenChange,
	entityType,
	defaultName = "",
	gameId,
	onSuccess,
}: MentionCreateDialogProps) {
	const queryClient = useQueryClient();

	// Form state
	const [name, setName] = React.useState(defaultName);
	const [characterClass, setCharacterClass] = React.useState("Commoner");
	const [level, setLevel] = React.useState("1");
	const [questStatus, setQuestStatus] = React.useState<
		"preparing" | "ready" | "active" | "paused" | "completed"
	>("preparing");
	const [locationType, setLocationType] = React.useState<
		"continent" | "nation" | "region" | "city" | "settlement" | "building" | "complex"
	>("city");

	// Reset form when dialog opens with new entity type or default name
	React.useEffect(() => {
		if (open) {
			setName(defaultName);
			setCharacterClass("Commoner");
			setLevel("1");
			setQuestStatus("preparing");
			setLocationType("city");
		}
	}, [open, defaultName]);

	// Character mutation
	const createCharacter = useMutation({
		...createCharacterMutation({ path: { game_id: gameId } }),
		onSuccess: (response) => {
			if (response.data) {
				toast.success("Character created successfully!");
				queryClient.invalidateQueries({
					queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
				});
				queryClient.invalidateQueries({
					queryKey: listCharactersQueryKey({ path: { game_id: gameId } }),
				});
				onSuccess({
					id: response.data.id,
					name: response.data.name,
					type: "character",
				});
				onOpenChange(false);
			}
		},
		onError: () => {
			toast.error("Failed to create character");
		},
	});

	// Quest mutation
	const createQuest = useMutation({
		...createQuestMutation({ path: { game_id: gameId } }),
		onSuccess: (response) => {
			if (response.data) {
				toast.success("Quest created successfully!");
				queryClient.invalidateQueries({
					queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
				});
				queryClient.invalidateQueries({
					queryKey: listQuestsQueryKey({ path: { game_id: gameId } }),
				});
				onSuccess({
					id: response.data.id,
					name: response.data.name,
					type: "quest",
				});
				onOpenChange(false);
			}
		},
		onError: () => {
			toast.error("Failed to create quest");
		},
	});

	// Location mutation
	const createLocation = useMutation({
		...createLocationMutation({ path: { game_id: gameId } }),
		onSuccess: (response) => {
			if (response.data) {
				toast.success("Location created successfully!");
				queryClient.invalidateQueries({
					queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
				});
				queryClient.invalidateQueries({
					queryKey: listLocationsQueryKey({ path: { game_id: gameId } }),
				});
				onSuccess({
					id: response.data.id,
					name: response.data.name,
					type: "location",
				});
				onOpenChange(false);
			}
		},
		onError: () => {
			toast.error("Failed to create location");
		},
	});

	// Faction mutation
	const createFaction = useMutation({
		...createFactionMutation({ path: { game_id: gameId } }),
		onSuccess: (response) => {
			if (response.data) {
				toast.success("Faction created successfully!");
				queryClient.invalidateQueries({
					queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
				});
				queryClient.invalidateQueries({
					queryKey: listFactionsQueryKey({ path: { game_id: gameId } }),
				});
				onSuccess({
					id: response.data.id,
					name: response.data.name,
					type: "faction",
				});
				onOpenChange(false);
			}
		},
		onError: () => {
			toast.error("Failed to create faction");
		},
	});

	// Note mutation
	const createNote = useMutation({
		...createNoteMutation({ path: { game_id: gameId } }),
		onSuccess: (response) => {
			if (response.data) {
				toast.success("Note created successfully!");
				queryClient.invalidateQueries({
					queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
				});
				queryClient.invalidateQueries({
					queryKey: listNotesQueryKey({ path: { game_id: gameId } }),
				});
				onSuccess({
					id: response.data.id,
					name: response.data.name,
					type: "note",
				});
				onOpenChange(false);
			}
		},
		onError: () => {
			toast.error("Failed to create note");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}

		switch (entityType) {
			case "character":
				createCharacter.mutate({
					body: {
						character: {
							name,
							class: characterClass,
							level: Number.parseInt(level, 10),
						},
					},
				} as Parameters<typeof createCharacter.mutate>[0]);
				break;
			case "quest":
				createQuest.mutate({
					body: {
						quest: {
							name,
							status: questStatus,
						},
					},
				} as Parameters<typeof createQuest.mutate>[0]);
				break;
			case "location":
				createLocation.mutate({
					body: {
						location: {
							name,
							type: locationType,
						},
					},
				} as Parameters<typeof createLocation.mutate>[0]);
				break;
			case "faction":
				createFaction.mutate({
					body: {
						faction: {
							name,
						},
					},
				} as Parameters<typeof createFaction.mutate>[0]);
				break;
			case "note":
				createNote.mutate({
					body: {
						note: {
							name,
						},
					},
				} as Parameters<typeof createNote.mutate>[0]);
				break;
		}
	};

	const isPending =
		createCharacter.isPending ||
		createQuest.isPending ||
		createLocation.isPending ||
		createFaction.isPending ||
		createNote.isPending;

	const getEntityIcon = () => {
		switch (entityType) {
			case "character":
				return "👤";
			case "faction":
				return "⚔";
			case "location":
				return "🗺";
			case "note":
				return "📝";
			case "quest":
				return "🎯";
			default:
				return "📄";
		}
	};

	const getEntityLabel = () => {
		switch (entityType) {
			case "character":
				return "Character";
			case "faction":
				return "Faction";
			case "location":
				return "Location";
			case "note":
				return "Note";
			case "quest":
				return "Quest";
			default:
				return "Entity";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<span className="inline-flex items-center gap-2">
							<span>{getEntityIcon()}</span>
							<span>Create New {getEntityLabel()}</span>
						</span>
					</DialogTitle>
					<DialogDescription>
						Create a new {getEntityLabel().toLowerCase()} and insert it as a
						mention.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						{/* Name field - always shown */}
						<div className="space-y-2">
							<Label htmlFor="name">Name *</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.currentTarget.value)}
								placeholder={`Enter ${getEntityLabel().toLowerCase()} name`}
								autoFocus
								required
							/>
						</div>

						{/* Character-specific fields */}
						{entityType === "character" && (
							<>
								<div className="space-y-2">
									<Label htmlFor="class">Class *</Label>
									<Input
										id="class"
										value={characterClass}
										onChange={(e) =>
											setCharacterClass(e.currentTarget.value)
										}
										placeholder="e.g., Wizard, Fighter, Rogue"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="level">Level *</Label>
									<Input
										id="level"
										type="number"
										min="1"
										max="100"
										value={level}
										onChange={(e) => setLevel(e.currentTarget.value)}
										required
									/>
								</div>
							</>
						)}

						{/* Quest-specific fields */}
						{entityType === "quest" && (
							<div className="space-y-2">
								<Label htmlFor="status">Status *</Label>
								<Select
									value={questStatus}
									onValueChange={(value) =>
										setQuestStatus(value as typeof questStatus)
									}
								>
									<SelectTrigger id="status">
										<SelectValue />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value="preparing">
												Preparing
											</SelectItem>
											<SelectItem value="ready">Ready</SelectItem>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="paused">Paused</SelectItem>
											<SelectItem value="completed">
												Completed
											</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</div>
						)}

						{/* Location-specific fields */}
						{entityType === "location" && (
							<div className="space-y-2">
								<Label htmlFor="type">Type *</Label>
								<Select
									value={locationType}
									onValueChange={(value) =>
										setLocationType(value as typeof locationType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue />
									</SelectTrigger>
									<SelectPositioner>
										<SelectContent>
											<SelectItem value="continent">
												Continent
											</SelectItem>
											<SelectItem value="nation">Nation</SelectItem>
											<SelectItem value="region">Region</SelectItem>
											<SelectItem value="city">City</SelectItem>
											<SelectItem value="settlement">
												Settlement
											</SelectItem>
											<SelectItem value="building">
												Building
											</SelectItem>
											<SelectItem value="complex">
												Complex
											</SelectItem>
										</SelectContent>
									</SelectPositioner>
								</Select>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creating..." : `Create ${getEntityLabel()}`}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
