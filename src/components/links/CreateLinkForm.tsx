import * as React from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Button } from "../ui/button";
import { useCreateLink } from "./hooks/useCreateLink";
import { useGameEntities } from "./hooks/useGameEntities";
import type { CreateLinkFormProps, EntityType } from "./types";

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
			targetType: targetType as EntityType,
			targetId,
		});
	};

	if (fetchError) {
		return (
			<div className="text-sm text-red-600">
				Failed to load entities. Please try again.
			</div>
		);
	}

	const hasEntities = Object.values(entities).some((group) => group.length > 0);

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Select
				disabled={isLoading || !hasEntities}
				value={selectedValue}
				onValueChange={(value) => setSelectedValue(value as string)}
			>
				<SelectTrigger className="w-full max-w-xs">
					<SelectValue
						placeholder={
							isLoading
								? "Loading entities..."
								: !hasEntities
									? "No entities available"
									: "Select an entity to link"
						}
					/>
				</SelectTrigger>
				<SelectPositioner alignItemWithTrigger>
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
			</Select>

			<Button type="submit" disabled={!selectedValue || createLink.isPending}>
				{createLink.isPending ? "Creating Link..." : "Create Link"}
			</Button>
		</form>
	);
}
