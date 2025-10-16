import { PlusIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "~/components/ui/sidebar";
import { useGetLocationTreeSuspenseQuery } from "~/queries/locations";
import { useUIActions } from "~/state/ui";
import { SidebarTree } from "./tree";

interface SidebarLocationTreeProps {
	gameId: string;
}

export function SidebarLocationTree({ gameId }: SidebarLocationTreeProps) {
	const { data: locationTree } = useGetLocationTreeSuspenseQuery(gameId);
	const { setIsCreateLocationOpen } = useUIActions();
	return (
		<SidebarGroup>
			<SidebarGroupAction onClick={() => setIsCreateLocationOpen(true)}>
				<PlusIcon />
			</SidebarGroupAction>
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
