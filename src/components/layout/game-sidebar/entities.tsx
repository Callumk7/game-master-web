import { useParams } from "@tanstack/react-router";
import { Gem, Globe, Image, MapPin, Scroll, Shield, Users } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuLink,
} from "~/components/ui/sidebar";
import { useGetGameLinksData } from "~/queries/utils";

interface SidebarEntitiesProps {
	gameId: string;
}

export function SidebarEntities({ gameId }: SidebarEntitiesProps) {
	const params = useParams({ from: "/_auth/games/$gameId" });
	const { characters, factions, locations, notes, quests, totalEntityCount } =
		useGetGameLinksData(gameId);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Entities</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuLink
						to={"/games/$gameId/all"}
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<Globe className="w-4 h-4" />
						All
						<Badge variant="secondary" className="ml-auto">
							{totalEntityCount.toString()}
						</Badge>
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/characters"
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<Users className="w-4 h-4" />
						Characters
						<Badge variant="secondary" className="ml-auto">
							{characters?.length.toString() || "0"}
						</Badge>
					</SidebarMenuLink>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/factions"
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<div className="w-4 h-4 flex items-center justify-center text-sm">
							<Shield className="w-4 h-4" />
						</div>
						Factions
						<Badge variant="secondary" className="ml-auto">
							{factions?.length.toString() || "0"}
						</Badge>
					</SidebarMenuLink>
				</SidebarMenuItem>

				<SidebarMenuLink
					to="/games/$gameId/locations"
					params={params}
					activeProps={{
						className: "bg-secondary text-secondary-foreground",
					}}
				>
					<MapPin className="w-4 h-4" />
					Locations
					<Badge variant="secondary" className="ml-auto">
						{locations?.length.toString() || "0"}
					</Badge>
				</SidebarMenuLink>
				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/quests"
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<Gem className="w-4 h-4" />
						Quests
						<Badge variant="secondary" className="ml-auto">
							{quests?.length.toString() || "0"}
						</Badge>
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/notes"
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<Scroll className="w-4 h-4" />
						Notes
						<Badge variant="secondary" className="ml-auto">
							{notes?.length.toString() || "0"}
						</Badge>
					</SidebarMenuLink>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/images"
						params={params}
						activeProps={{
							className: "bg-secondary text-secondary-foreground",
						}}
					>
						<Image className="w-4 h-4" />
						Images
					</SidebarMenuLink>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
