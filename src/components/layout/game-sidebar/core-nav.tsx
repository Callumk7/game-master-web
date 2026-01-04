import { BowArrow, Home, Search, Settings, Speech, Target } from "lucide-react";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuLink,
} from "~/components/ui/sidebar";

interface SidebarCoreNavProps {
	gameId: string;
}

export function SidebarCoreNav({ gameId }: SidebarCoreNavProps) {
	return (
		<SidebarGroup>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuLink to="/games/$gameId" params={{ gameId }}>
						<Home className="w-4 h-4" />
						Dashboard
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink
						to="/games/$gameId/search"
						params={{ gameId }}
						search={{}}
					>
						<Search className="w-4 h-4" />
						Search
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink to="/games/$gameId/initiative" params={{ gameId }}>
						<BowArrow className="w-4 h-4" />
						Initiative Tracker
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink to="/games/$gameId/settings" params={{ gameId }}>
						<Settings className="w-4 h-4" />
						Game Settings
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink to="/games/$gameId/objectives" params={{ gameId }}>
						<Target className="w-4 h-4" />
						All Objectives
					</SidebarMenuLink>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuLink to="/games/$gameId/chat" params={{ gameId }}>
						<Speech className="w-4 h-4" />
						Chat
					</SidebarMenuLink>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
