import { ChevronDown } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
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
} from "~/components/ui/combobox";
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
}

export function CreateLinkForm({
	gameId,
	sourceEntityType,
	sourceEntityId,
	onSuccess,
	onError,
}: CreateLinkFormProps) {
	const id = React.useId();
	const [selectedEntity, setSelectedEntity] = React.useState<{
		value: string;
		label: string;
	} | null>(null);
	const [relationshipValue, setRelationshipValue] = React.useState("");
	const [description, setDescription] = React.useState("");

	const { isLoading, error: fetchError, flatEntities } = useGameEntities(gameId);

	// Filter out self-referencing entity
	const filteredEntities = React.useMemo(() => {
		const selfValue = `${sourceEntityType}:${sourceEntityId}`;
		return flatEntities.filter((entity) => entity.value !== selfValue);
	}, [flatEntities, sourceEntityType, sourceEntityId]);

	const createLink = useCreateLink(
		() => {
			setSelectedEntity(null);
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
		if (!selectedEntity) return;

		const [targetType, targetId] = selectedEntity.value.split(":");

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

	const hasEntities = filteredEntities.length > 0;

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
					<Combobox
						items={filteredEntities}
						value={selectedEntity}
						onValueChange={(entity) => setSelectedEntity(entity)}
						itemToStringLabel={(entity) => entity?.label || ""}
						disabled={isLoading || !hasEntities}
					>
						<div className="relative flex flex-col gap-2">
							<ComboboxInput
								placeholder={
									isLoading
										? "Loading entities..."
										: !hasEntities
											? "No entities available"
											: "Select an entity to link"
								}
								id={id}
							/>
							<div className="absolute right-2 bottom-0 flex h-9 items-center justify-center text-muted-foreground">
								<ComboboxClear />
								<ComboboxTrigger
									className="h-9 w-6 text-muted-foreground shadow-none bg-transparent hover:bg-transparent border-none"
									aria-label="Open popup"
								>
									<ChevronDown className="size-4" />
								</ComboboxTrigger>
							</div>
						</div>

						<ComboboxPositioner>
							<ComboboxPopup>
								<ComboboxEmpty>No entities found.</ComboboxEmpty>
								<ComboboxList>
									{(entity) => (
										<ComboboxItem key={entity.value} value={entity}>
											<ComboboxItemIndicator />
											<div className="col-start-2">
												<div className="flex flex-col gap-1">
													<span className="text-xs text-muted-foreground capitalize">
														{entity.type}
													</span>
													<span>{entity.label}</span>
												</div>
											</div>
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxPopup>
						</ComboboxPositioner>
					</Combobox>
				</div>

				<FormField
					label="Relationship"
					id="relationship"
					value={relationshipValue}
					onChange={(e) => setRelationshipValue(e.currentTarget.value)}
				/>

				<div className="space-y-1">
					<Label htmlFor="description">Description of connection</Label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
					/>
				</div>

				<Button type="submit" disabled={!selectedEntity || createLink.isPending}>
					{createLink.isPending ? "Creating Link..." : "Create Link"}
				</Button>
			</div>
		</form>
	);
}
