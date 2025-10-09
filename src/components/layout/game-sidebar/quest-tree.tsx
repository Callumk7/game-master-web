import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "~/components/ui/sidebar";
import { useGetQuestTreeSuspenseQuery } from "~/queries/quests";
import { SidebarTree } from "./tree";

interface SidebarQuestTreeProps {
	gameId: string;
}

export function SidebarQuestTree({ gameId }: SidebarQuestTreeProps) {
	const { data: questTree } = useGetQuestTreeSuspenseQuery(gameId);
	return (
		<SidebarGroup>
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
