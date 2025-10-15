import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useUpdateLink } from "~/queries/utils";
import type { EntityType } from "~/types";
import type { EntityLink } from "./types";

interface UpdateLinkDialogProps {
	link: EntityLink;
	gameId: string;
	sourceId: string;
	sourceType: EntityType;
}

export function UpdateLinkDialog({
	link,
	gameId,
	sourceId,
	sourceType,
}: UpdateLinkDialogProps) {
	const [open, setOpen] = useState(false);
	const [relationshipType, setRelationshipType] = useState(
		link.relationship_type || "",
	);
	const [description, setDescription] = useState(link.description_meta || "");
	const [isActive, setIsActive] = useState(link.is_active ?? true);

	// Special fields for specific link types
	const [isCurrentLocation, setIsCurrentLocation] = useState(
		link.is_current_location ?? false,
	);
	const [isPrimary, setIsPrimary] = useState(link.is_primary ?? false);
	const [factionRole, setFactionRole] = useState(link.faction_role || "");

	// Helper functions to determine which special fields to show (bidirectional)
	const isCharacterLocationLink =
		(sourceType === "character" && link.type === "location") ||
		(sourceType === "location" && link.type === "character");
	const isCharacterFactionLink =
		(sourceType === "character" && link.type === "faction") ||
		(sourceType === "faction" && link.type === "character");
	const isFactionLocationLink =
		(sourceType === "faction" && link.type === "location") ||
		(sourceType === "location" && link.type === "faction");

	const updateLink = useUpdateLink(
		() => {
			toast.success("Link updated successfully!");
			setOpen(false);
		},
		(error) => {
			toast.error("Failed to update link");
			console.error(error);
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const baseData = {
			relationship_type: relationshipType || undefined,
			description: description || undefined,
			is_active: isActive,
		};

		// Add special fields based on link type
		const specialFields: Record<string, unknown> = {};

		if (isCharacterLocationLink || isFactionLocationLink) {
			specialFields.is_current_location = isCurrentLocation;
		}

		if (isCharacterFactionLink) {
			specialFields.is_primary = isPrimary;
			if (factionRole) {
				specialFields.faction_role = factionRole;
			}
		}

		updateLink.mutate({
			gameId,
			sourceType,
			sourceId,
			targetType: link.type,
			targetId: link.id,
			data: {
				...baseData,
				...specialFields,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="ghost" size="sm">
						<Edit className="h-4 w-4" />
					</Button>
				}
			></DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Link</DialogTitle>
					<DialogDescription>
						Update the relationship between {sourceType} and {link.name} (
						{link.type}).
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="relationship-type">Relationship Type</Label>
						<Input
							id="relationship-type"
							value={relationshipType}
							onChange={(e) => setRelationshipType(e.target.value)}
							placeholder="e.g., ally, enemy, neutral"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Additional details about this relationship"
							rows={3}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="is-active"
							checked={isActive}
							onCheckedChange={(checked) => setIsActive(checked === true)}
						/>
						<Label htmlFor="is-active">Active relationship</Label>
					</div>

					{/* Character-Location specific fields */}
					{isCharacterLocationLink && (
						<div className="flex items-center space-x-2">
							<Checkbox
								id="is-current-location"
								checked={isCurrentLocation}
								onCheckedChange={(checked) =>
									setIsCurrentLocation(checked === true)
								}
							/>
							<Label htmlFor="is-current-location">Current location</Label>
						</div>
					)}

					{/* Character-Faction specific fields */}
					{isCharacterFactionLink && (
						<>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="is-primary-faction"
									checked={isPrimary}
									onCheckedChange={(checked) =>
										setIsPrimary(checked === true)
									}
								/>
								<Label htmlFor="is-primary-faction">
									Primary faction
								</Label>
							</div>
							<div className="space-y-2">
								<Label htmlFor="faction-role">Role in faction</Label>
								<Input
									id="faction-role"
									value={factionRole}
									onChange={(e) => setFactionRole(e.target.value)}
									placeholder="e.g., member, leader, spy"
								/>
							</div>
						</>
					)}

					{/* Faction-Location specific fields */}
					{isFactionLocationLink && (
						<div className="flex items-center space-x-2">
							<Checkbox
								id="is-current-location-faction"
								checked={isCurrentLocation}
								onCheckedChange={(checked) =>
									setIsCurrentLocation(checked === true)
								}
							/>
							<Label htmlFor="is-current-location-faction">
								Current location
							</Label>
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={updateLink.isPending}>
							{updateLink.isPending ? "Updating..." : "Update Link"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
