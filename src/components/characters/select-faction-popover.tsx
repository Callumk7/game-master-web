import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import type { Faction } from "~/api";
import {
	useRemoveCharacterFromFactionMutation,
	useSetCharacterPrimaryFactionMutation,
} from "~/queries/characters";
import { Button } from "../ui/button";
import {
	Combobox,
	ComboboxClear,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPositioner,
	ComboboxTrigger,
} from "../ui/combobox";
import { FormField } from "../ui/composite/form-field";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface SelectFactionComboboxProps {
	gameId: string;
	characterId: string;
	factions: Faction[];
	currentFactionId?: string;
}
export function SelectFactionCombobox({
	gameId,
	characterId,
	factions,
	currentFactionId,
}: SelectFactionComboboxProps) {
	const id = React.useId();
	const [selectedFaction, setSelectedFaction] = React.useState<Faction | null>(null);
	const [role, setRole] = React.useState<string>("");

	// Set initial faction if one is currently assigned
	React.useEffect(() => {
		if (currentFactionId && factions.length > 0) {
			const currentFaction = factions.find((f) => f.id === currentFactionId);
			if (currentFaction) {
				setSelectedFaction(currentFaction);
			}
		}
	}, [currentFactionId, factions]);

	const selectFaction = useSetCharacterPrimaryFactionMutation(gameId, characterId);
	const removeFaction = useRemoveCharacterFromFactionMutation(gameId, characterId);

	const handleSave = () => {
		if (selectedFaction) {
			selectFaction.mutateAsync({
				body: {
					faction_id: selectedFaction.id,
					role,
				},
				path: { game_id: gameId, character_id: characterId },
			});
		} else {
			removeFaction.mutateAsync({
				path: { game_id: gameId, character_id: characterId },
			});
		}
	};

	const hasChanges = currentFactionId
		? selectedFaction?.id !== currentFactionId
		: selectedFaction !== null;

	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Select primary faction</PopoverTrigger>
			<PopoverPositioner>
				<PopoverContent>
					<div className="max-w-3xs space-y-2">
						<Combobox
							items={factions}
							itemToStringLabel={(faction) => faction.name}
							value={selectedFaction}
							onValueChange={(faction) => setSelectedFaction(faction)}
						>
							<div className="relative flex flex-col gap-2">
								<ComboboxInput
									placeholder={
										currentFactionId
											? "Change faction"
											: "Select a faction"
									}
									id={id}
								/>
								<div className="absolute right-2 bottom-0 flex h-9 items-center justify-center text-muted-foreground">
									<ComboboxClear />
									<ComboboxTrigger
										className="h-9 w-6 text-muted-foreground shadow-none bg-transparent hover:bg-transparent border-none"
										aria-label="Open popup"
									>
										<ChevronDownIcon className="size-4" />
									</ComboboxTrigger>
								</div>
							</div>

							<ComboboxPositioner sideOffset={6}>
								<ComboboxPopup>
									<ComboboxEmpty>No factions found.</ComboboxEmpty>
									<ComboboxList>
										{(faction) => (
											<ComboboxItem
												key={faction.id}
												value={faction}
											>
												<ComboboxItemIndicator />
												<div className="col-start-2">
													{faction.name}
												</div>
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxPopup>
							</ComboboxPositioner>
						</Combobox>

						<FormField
							label="Role"
							id="role"
							value={role}
							onInput={(e) => setRole(e.currentTarget.value)}
						/>
						{hasChanges && (
							<Button
								variant="secondary"
								onClick={handleSave}
								disabled={selectFaction.isPending}
							>
								{selectFaction.isPending
									? "Saving..."
									: selectedFaction
										? "Assign Faction"
										: "Remove Faction"}
							</Button>
						)}
					</div>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
