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
import type { EntityType } from "~/types";
import type { EntityLink } from "~/utils/linkHelpers";
import { useUpdateLink } from "../links/hooks/useUpdateLink";

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
	const [strength, setStrength] = useState(link.strength || "");

	const updateLink = useUpdateLink(
		() => {
			toast("Link updated successfully!");
			setOpen(false);
		},
		(error) => {
			toast.error("Failed to update link");
			console.error(error);
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		updateLink.mutate({
			gameId,
			sourceType,
			sourceId,
			targetType: link.type,
			targetId: link.id,
			data: {
				relationship_type: relationshipType || undefined,
				description: description || undefined,
				is_active: isActive,
				strength: strength ? Number(strength) : undefined,
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

					<div className="space-y-2">
						<Label htmlFor="strength">Relationship Strength (1-10)</Label>
						<Input
							id="strength"
							type="number"
							min="1"
							max="10"
							value={strength}
							onChange={(e) => setStrength(e.target.value)}
							placeholder="Optional strength rating"
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

