import type * as React from "react";
import type { Quest } from "~/api/types.gen";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPortal,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface QuestSelectProps {
	quests: Quest[];
	value?: string;
	onChange: (value: string | undefined) => void;
	disabled?: boolean;
	placeholder?: string;
	container?: React.RefObject<HTMLElement | null>;
	required?: boolean;
}

function buildQuestHierarchy(quests: Quest[]): Map<string, Quest[]> {
	const hierarchy = new Map<string, Quest[]>();

	// Create a map for quick lookup
	const questMap = new Map(quests.map((quest) => [quest.id, quest]));

	// Build hierarchy by following parent_id chains
	quests.forEach((quest) => {
		const path: Quest[] = [];
		let current: Quest | undefined = quest;

		// Traverse up the hierarchy to build the full path
		while (current && path.length < 10) {
			// Prevent infinite loops
			path.unshift(current);
			current = current.parent_id ? questMap.get(current.parent_id) : undefined;
		}

		hierarchy.set(quest.id, path);
	});

	return hierarchy;
}

function formatQuestLabel(quest: Quest, hierarchy: Quest[]): string {
	if (hierarchy.length <= 1) {
		return quest.name;
	}

	// Show hierarchy: "Main Quest > Sub Quest > Current Quest"
	const pathNames = hierarchy.slice(0, -1).map((q) => q.name);
	return `${quest.name} (${pathNames.join(" > ")})`;
}

export function QuestSelect({
	quests,
	value,
	onChange,
	disabled = false,
	placeholder = "Select quest",
	container,
	required = false,
}: QuestSelectProps) {
	// Build hierarchy for display
	const hierarchy = buildQuestHierarchy(quests);

	// Sort quests alphabetically by name
	const sortedQuests = [...quests].sort((a, b) => a.name.localeCompare(b.name));

	const handleValueChange = (selectedValue: unknown) => {
		if (selectedValue === "placeholder") {
			onChange(undefined);
		} else {
			onChange(selectedValue as string);
		}
	};

	// Find the selected quest to display its name
	const selectedQuest = value ? quests.find((quest) => quest.id === value) : null;
	const displayValue = value || "placeholder";

	// Get the display name for the selected quest
	const getSelectedDisplayName = () => {
		if (!selectedQuest) return undefined;
		const questHierarchy = hierarchy.get(selectedQuest.id) || [selectedQuest];
		return formatQuestLabel(selectedQuest, questHierarchy);
	};

	const selectContent = (
		<SelectPositioner>
			<SelectContent>
				{!required && (
					<SelectItem value="placeholder">
						<span className="text-muted-foreground">{placeholder}</span>
					</SelectItem>
				)}

				{sortedQuests.map((quest) => {
					const questHierarchy = hierarchy.get(quest.id) || [quest];
					const label = formatQuestLabel(quest, questHierarchy);

					return (
						<SelectItem key={quest.id} value={quest.id}>
							<div className="flex items-center gap-2">
								<span className="text-xs bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
									quest
								</span>
								<span>{label}</span>
							</div>
						</SelectItem>
					);
				})}

				{sortedQuests.length === 0 && (
					<SelectItem value="disabled" disabled>
						<span className="text-muted-foreground">No quests available</span>
					</SelectItem>
				)}
			</SelectContent>
		</SelectPositioner>
	);

	return (
		<Select
			value={displayValue}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder}>
					{selectedQuest ? (
						<div className="flex items-center gap-2">
							<span className="text-xs bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
								quest
							</span>
							<span>{getSelectedDisplayName()}</span>
						</div>
					) : (
						<span className="text-muted-foreground">{placeholder}</span>
					)}
				</SelectValue>
			</SelectTrigger>
			{container ? (
				<SelectPortal container={container}>{selectContent}</SelectPortal>
			) : (
				selectContent
			)}
		</Select>
	);
}
