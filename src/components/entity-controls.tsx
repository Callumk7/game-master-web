import { EntityType } from "~/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Menu, Pencil } from "lucide-react";

interface EntityControlsProps {
	gameId: string;
	entityId: string;
	entityType: EntityType;
}

export function EntityControls({ gameId, entityId, entityType }: EntityControlsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
				<Menu className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>
					<Pencil className="h-4 w-4" />
					Edit
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
