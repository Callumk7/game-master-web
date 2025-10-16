import { PlusIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "~/components/ui/sidebar";
import { useGetQuestTreeSuspenseQuery } from "~/queries/quests";
import { useUIActions } from "~/state/ui";
import { SidebarTree } from "./tree";

interface SidebarQuestTreeProps {
	gameId: string;
}

export function SidebarQuestTree({ gameId }: SidebarQuestTreeProps) {
	const { data: questTree } = useGetQuestTreeSuspenseQuery(gameId);
	const { setIsCreateQuestOpen } = useUIActions();
	return (
		<SidebarGroup>
			<SidebarGroupAction onClick={() => setIsCreateQuestOpen(true)}>
				<PlusIcon />
			</SidebarGroupAction>
			<SidebarGroupLabel>Quests</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{questTree?.data?.map((item) => (
						<SidebarTree gameId={gameId} key={item.id} parentNode={item} />
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
