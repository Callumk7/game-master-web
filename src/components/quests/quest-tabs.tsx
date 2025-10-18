import { TabsNav, TabsNavLink, TabsNavList } from "../ui/tabs";

interface QuestTabsProps {
	gameId: string;
	className?: string;
}

export function QuestTabs({ gameId, className }: QuestTabsProps) {
	return (
		<TabsNav className={className}>
			<TabsNavList>
				<TabsNavLink
					to="/games/$gameId/quests"
					params={{ gameId }}
					activeOptions={{ exact: true }}
				>
					Table
				</TabsNavLink>
				<TabsNavLink
					to="/games/$gameId/quests/tree"
					params={{ gameId }}
					activeOptions={{ exact: true }}
				>
					Tree
				</TabsNavLink>
			</TabsNavList>
		</TabsNav>
	);
}
