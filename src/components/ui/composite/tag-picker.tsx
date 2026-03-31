import * as React from "react";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
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
	const anchor = useComboboxAnchor();
	const id = React.useId();

	return (
		<Combobox
			items={tags}
			multiple
			autoHighlight
			value={value}
			onValueChange={onValueChange}
		>
			<div className={className || "w-full max-w-xs flex flex-col gap-3"}>
				{label && <Label htmlFor={id}>{label}</Label>}
				<ComboboxChips ref={anchor}>
					<ComboboxValue>
						{(selectedValues: string[]) => (
							<React.Fragment>
								{selectedValues.map((tag) => (
									<ComboboxChip key={tag}>{tag}</ComboboxChip>
								))}
								<ComboboxChipsInput
									id={id}
									placeholder={
										selectedValues.length > 0 ? "" : placeholder
									}
								/>
							</React.Fragment>
						)}
					</ComboboxValue>
				</ComboboxChips>
			</div>

			<ComboboxContent anchor={anchor}>
				<ComboboxEmpty>No tags found.</ComboboxEmpty>
				<ComboboxList>
					{(tag: string) => (
						<ComboboxItem key={tag} value={tag}>
							{tag}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
