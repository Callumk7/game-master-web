import { TabsNav, TabsNavLink, TabsNavList } from "~/components/ui/tabs";

interface LocationTabsProps {
	gameId: string;
	className?: string;
}

export function LocationTabs({ gameId, className }: LocationTabsProps) {
	return (
		<TabsNav className={className}>
			<TabsNavList>
				<TabsNavLink
					to="/games/$gameId/locations"
					params={{ gameId }}
					activeOptions={{ exact: true }}
				>
					Table
				</TabsNavLink>
				<TabsNavLink
					to="/games/$gameId/locations/tree"
					params={{ gameId }}
					activeOptions={{ exact: true }}
				>
					Tree
				</TabsNavLink>
			</TabsNavList>
		</TabsNav>
	);
}
