import { useCharacterQuery } from "~/queries/characters";
import { FormField } from "../ui/composite/form-field";
import { Dialog, DialogContent } from "../ui/dialog";

interface EditCharacterDetailsDialogProps {
	gameId: string;
	characterId: string;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export function EditCharacterDetailsDialog({
	gameId,
	characterId,
	open,
	setOpen,
}: EditCharacterDetailsDialogProps) {
	const { data } = useCharacterQuery(gameId, characterId);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className={"max-w-md"}>
				<form>
					<div className="space-y-4">
						<FormField
							label="Class"
							name="class"
							type="text"
							value={data?.data?.class}
						/>
						<FormField
							label="Level"
							name="level"
							type="number"
							value={data?.data?.level}
						/>
						<FormField
							label="Tags"
							name="tags"
							type="text"
							value={data?.data?.tags}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
