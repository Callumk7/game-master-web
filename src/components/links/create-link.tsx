import * as React from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectPortal,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { EntityType } from "~/types";
import { Button } from "../ui/button";
import { FormField } from "../ui/composite/form-field";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCreateLink } from "./hooks/useCreateLink";
import { useGameEntities } from "./hooks/useGameEntities";

export interface CreateLinkFormProps {
	gameId: string;
	sourceEntityType: EntityType;
	sourceEntityId: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	excludeTypes?: EntityType[];
	excludeIds?: string[];
}

export function CreateLinkForm({
	gameId,
	sourceEntityType,
	sourceEntityId,
	onSuccess,
	onError,
	excludeTypes = [],
	excludeIds = [],
}: CreateLinkFormProps) {
	const [selectedValue, setSelectedValue] = React.useState("");
	const [relationshipValue, setRelationshipValue] = React.useState("");
	const [description, setDescription] = React.useState("");

	// Exclude self-referencing
	const finalExcludeIds = [...excludeIds, `${sourceEntityType}:${sourceEntityId}`];

	const {
		entities,
		isLoading,
		error: fetchError,
	} = useGameEntities(gameId, excludeTypes, finalExcludeIds);

	const createLink = useCreateLink(
		() => {
			setSelectedValue("");
			toast.success("Link created successfully");
			onSuccess?.();
		},
		(err) => {
			toast.error(`Failed to create link: ${err.message}`);
			onError?.(err);
		},
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedValue) return;

		const [targetType, targetId] = selectedValue.split(":");

		await createLink.mutateAsync({
			gameId,
			sourceType: sourceEntityType,
			sourceId: sourceEntityId,
			entity_type: targetType as EntityType,
			entity_id: targetId,
			relationship_type: relationshipValue,
			description,
		});
	};

	const hasEntities = Object.values(entities).some((group) => group.length > 0);

	// Find the label for the selected value
	const selectedLabel = React.useMemo(() => {
		if (!selectedValue) return "";

		for (const items of Object.values(entities)) {
			const selectedItem = items.find((item) => item.value === selectedValue);
			if (selectedItem) {
				return selectedItem.label;
			}
		}
		return selectedValue; // Fallback to value if label not found
	}, [selectedValue, entities]);

	if (fetchError) {
		return (
			<div className="text-sm text-red-600">
				Failed to load entities. Please try again.
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className="flex flex-col gap-4">
				<div className="space-y-1">
					<Label>Target Link</Label>
					<Select
						disabled={isLoading || !hasEntities}
						value={selectedValue}
						onValueChange={(value) => setSelectedValue(value as string)}
					>
						<SelectTrigger className="w-full">
							<SelectValue
								placeholder={
									isLoading
										? "Loading entities..."
										: !hasEntities
											? "No entities available"
											: "Select an entity to link"
								}
							>
								{selectedLabel}
							</SelectValue>
						</SelectTrigger>
						<SelectPortal>
							<SelectPositioner>
								<SelectContent>
									{Object.entries(entities).map(
										([type, items]) =>
											items.length > 0 && (
												<SelectGroup key={type}>
													<SelectLabel className="capitalize">
														{type}
													</SelectLabel>
													{items.map((item) => (
														<SelectItem
															key={item.value}
															value={item.value}
														>
															{item.label}
														</SelectItem>
													))}
												</SelectGroup>
											),
									)}
								</SelectContent>
							</SelectPositioner>
						</SelectPortal>
					</Select>
				</div>

				<FormField
					label="Relationship"
					id="relationship"
					value={relationshipValue}
					onInput={(e) => setRelationshipValue(e.currentTarget.value)}
				/>

				<div className="space-y-1">
					<Label htmlFor="description">Description of connection</Label>
					<Textarea
						id="description"
						value={description}
						onInput={(e) => setDescription(e.currentTarget.value)}
					/>
				</div>

				<Button type="submit" disabled={!selectedValue || createLink.isPending}>
					{createLink.isPending ? "Creating Link..." : "Create Link"}
				</Button>
			</div>
		</form>
	);
}
