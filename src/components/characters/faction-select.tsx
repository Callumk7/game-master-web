import type { Faction } from "~/api/types.gen";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPortal,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface FactionSelectProps {
	factions: Faction[];
	value?: string;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
	container?: React.RefObject<HTMLElement | null>;
}

export function FactionSelect({
	factions,
	value,
	onChange,
	disabled = false,
	placeholder = "Select parent quest",
	container,
}: FactionSelectProps) {
	const handleValueChange = (selectedValue: unknown) => {
		if (selectedValue === "none") {
			onChange(undefined);
		} else {
			onChange(selectedValue as string);
		}
	};

	// Find the selected quest to display its name
	const selectedFaction = value
		? factions.find((faction) => faction.id === value)
		: null;
	const displayValue = value || "none";

	// Get the display name for the selected quest
	const getSelectedDisplayName = () => {
		if (!selectedFaction) return undefined;
		return selectedFaction.name;
	};

	return (
		<Select
			value={displayValue}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder}>
					{selectedFaction ? (
						<div className="flex items-center gap-2">
							<span>{getSelectedDisplayName()}</span>
						</div>
					) : displayValue === "none" ? (
						<span className="text-muted-foreground">No Faction</span>
					) : null}
				</SelectValue>
			</SelectTrigger>
			<SelectPortal container={container}>
				<SelectPositioner>
					<SelectContent>
						<SelectItem value="none">
							<span className="text-muted-foreground">No Faction</span>
						</SelectItem>

						{factions.map((faction) => {
							const label = faction.name;

							return (
								<SelectItem key={faction.id} value={faction.id}>
									<div className="flex items-center gap-2">
										<span>{label}</span>
									</div>
								</SelectItem>
							);
						})}

						{factions.length === 0 && (
							<SelectItem value="disabled" disabled>
								<span className="text-muted-foreground">
									No factions available
								</span>
							</SelectItem>
						)}
					</SelectContent>
				</SelectPositioner>
			</SelectPortal>
		</Select>
	);
}
