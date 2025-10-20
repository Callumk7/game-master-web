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
		setCreateCharacterFactionId,
		setIsCreateFactionOpen,
		setIsCreateLocationOpen,
		setCreateLocationParentId,
		setIsCreateNoteOpen,
		setCreateNoteParentId,
		setIsCreateQuestOpen,
		setCreateQuestParentId,
	} = useUIActions();

	const handleOpenCreateCharacter = () => {
		setCreateCharacterFactionId(undefined);
		setIsCreateCharacterOpen(true);
	};

	const handleOpenCreateLocation = () => {
		setCreateLocationParentId(undefined);
		setIsCreateLocationOpen(true);
	};

	const handleOpenCreateNote = () => {
		setCreateNoteParentId(undefined);
		setIsCreateNoteOpen(true);
	};

	const handleOpenCreateQuest = () => {
		setCreateQuestParentId(undefined);
		setIsCreateQuestOpen(true);
	};

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
						onClick={handleOpenCreateNote}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Note
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={handleOpenCreateCharacter}
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
						onClick={handleOpenCreateLocation}
						className="w-full justify-start"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Location
					</SidebarMenuButton>
					<SidebarMenuButton
						onClick={handleOpenCreateQuest}
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
