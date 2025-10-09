import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "~/components/ui/sidebar";
import { useGetLocationTreeSuspenseQuery } from "~/queries/locations";
import { SidebarTree } from "./tree";

interface SidebarLocationTreeProps {
	gameId: string;
}

export function SidebarLocationTree({ gameId }: SidebarLocationTreeProps) {
	const { data: locationTree } = useGetLocationTreeSuspenseQuery(gameId);
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Locations</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{locationTree?.data?.map((item) => (
						<SidebarTree gameId={gameId} key={item.id} parentNode={item} />
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
