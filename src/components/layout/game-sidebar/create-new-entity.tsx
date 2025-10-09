import { Plus } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";
import { useUIActions } from "~/state/ui";

export function SidebarCreateNew() {
	return (
		<SidebarGroup>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarCreateNewMenu />
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}

function SidebarCreateNewMenu() {
	const { isMobile } = useSidebar();
	const {
		setIsCreateCharacterOpen,
		setIsCreateFactionOpen,
		setIsCreateLocationOpen,
		setIsCreateNoteOpen,
		setIsCreateQuestOpen,
	} = useUIActions();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuButton className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground" />
				}
			>
				<Plus className="w-4 h-4" />
				Create New
			</DropdownMenuTrigger>
			<DropdownMenuPositioner
				side={isMobile ? "bottom" : "right"}
				align="start"
				sideOffset={18}
				className="z-20"
			>
				<DropdownMenuContent className="w-56">
					<SidebarMenuButton
						onClick={() => setIsCreateNoteOpen(true)}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Note
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={() => setIsCreateCharacterOpen(true)}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Character
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={() => setIsCreateFactionOpen(true)}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Faction
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={() => setIsCreateLocationOpen(true)}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Location
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={() => setIsCreateQuestOpen(true)}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Quest
					</SidebarMenuButton>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
