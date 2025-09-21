import { Pencil, Trash2 } from "lucide-react";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarPositioner,
	MenubarSub,
	MenubarSubTrigger,
	MenubarTrigger,
} from "../ui/menubar";
import { Link, useParams } from "@tanstack/react-router";

interface CharacterMenuProps {
	onEditDetails: () => void;
	onDelete: () => void;
}

export function CharacterMenu({ onEditDetails, onDelete }: CharacterMenuProps) {
	const params = useParams({ from: "/_auth/games/$gameId/characters/$id" });
	return (
		<Menubar className={"w-fit"}>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarPositioner>
					<MenubarContent>
						<MenubarItem onClick={onEditDetails}>
							<Pencil className="w-4 h-4 mr-2" />
							Edit Details
						</MenubarItem>
						<MenubarItem onClick={onDelete}>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</MenubarItem>
					</MenubarContent>
				</MenubarPositioner>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarPositioner>
					<MenubarContent>
						<MenubarItem
							render={
								<Link
									to="/games/$gameId/characters/$id"
									params={params}
								/>
							}
						>
							Description
						</MenubarItem>
						<MenubarSub>
							<MenubarSubTrigger>Links..</MenubarSubTrigger>
							<MenubarPositioner>
								<MenubarContent>
									<MenubarItem>All</MenubarItem>
									<MenubarItem>Faction</MenubarItem>
									<MenubarItem>Characters</MenubarItem>
									<MenubarItem>Quests</MenubarItem>
									<MenubarItem
										render={
											<Link
												to="/games/$gameId/characters/$id/notes"
												params={params}
											/>
										}
									>
										Notes
									</MenubarItem>
								</MenubarContent>
							</MenubarPositioner>
							<MenubarItem
								render={
									<Link
										to="/games/$gameId/characters/$id/notes"
										params={params}
									/>
								}
							>
								Notes
							</MenubarItem>
						</MenubarSub>
						<MenubarItem>Create</MenubarItem>
					</MenubarContent>
				</MenubarPositioner>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Faction</MenubarTrigger>
				<MenubarPositioner>
					<MenubarContent>
						<MenubarItem>Go..</MenubarItem>
						<MenubarItem>Delete</MenubarItem>
					</MenubarContent>
				</MenubarPositioner>
			</MenubarMenu>
		</Menubar>
	);
}
