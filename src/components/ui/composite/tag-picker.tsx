import * as React from "react";
import {
	Combobox,
	ComboboxChip,
	ComboboxChipRemove,
	ComboboxChips,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPositioner,
	ComboboxValue,
} from "~/components/ui/combobox";
import { Label } from "~/components/ui/label";

interface TagPickerProps {
	tags: string[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	placeholder?: string;
	label?: string;
	className?: string;
}
export function TagPicker({
	tags,
	value = [],
	onValueChange,
	placeholder = "Search for tags",
	label = "Tags",
	className,
}: TagPickerProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const id = React.useId();

	return (
		<Combobox items={tags} multiple value={value} onValueChange={onValueChange}>
			<div className={className || "w-full max-w-xs flex flex-col gap-3"}>
				{label && <Label htmlFor={id}>{label}</Label>}
				<ComboboxChips ref={containerRef}>
					<ComboboxValue>
						{(selectedValues: string[]) => (
							<React.Fragment>
								{selectedValues.map((tag) => (
									<ComboboxChip key={tag} aria-label={tag}>
										{tag}
										<ComboboxChipRemove />
									</ComboboxChip>
								))}
								<ComboboxInput
									id={id}
									placeholder={
										selectedValues.length > 0 ? "" : placeholder
									}
									className="flex-1 h-6 border-0 bg-transparent pl-2 text-base outline-none shadow-none focus-visible:ring-0"
								/>
							</React.Fragment>
						)}
					</ComboboxValue>
				</ComboboxChips>
			</div>

			<ComboboxPositioner
				className="z-50 outline-none"
				sideOffset={6}
				anchor={containerRef}
			>
				<ComboboxPopup>
					<ComboboxEmpty>No languages found.</ComboboxEmpty>
					<ComboboxList>
						{(tag: string) => (
							<ComboboxItem key={tag} value={tag}>
								<ComboboxItemIndicator />
								<div className="col-start-2">{tag}</div>
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</ComboboxPositioner>
		</Combobox>
	);
}
