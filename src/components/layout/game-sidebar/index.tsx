import { useParams } from "@tanstack/react-router";
import { BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { SidebarCoreNav } from "./core-nav";
import { SidebarCreateNew } from "./create-new-entity";
import { SidebarEntities } from "./entities";
import { SidebarLocationTree } from "./location-tree";
import { SidebarPinnedEntities } from "./pinned-entities";
import { SidebarQuestTree } from "./quest-tree";
import { SidebarUserControls } from "./user-controls";

export function GameSidebar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	const params = useParams({ from: "/_auth/games/$gameId" });
	const gameId = params.gameId;

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<Sidebar>
			<SidebarHeader className="border-b p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BookOpen className="w-6 h-6" />
						<span className="font-bold">Game Master Pro</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						{mounted ? (
							theme === "dark" ? (
								<Sun className="w-4 h-4" />
							) : (
								<Moon className="w-4 h-4" />
							)
						) : (
							<div className="w-4 h-4" />
						)}
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="p-4 flex flex-col">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarUserControls
							user={{
								name: "Callum",
								email: "callum@example.com",
								avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-wixmp-ed30a86b8c4ca887773594c2.wixmp.com%2Ff%2Fc3f6f733-7289-4186-bc20-1a811747f37f%2Fdj8mxhn-ad79f500-0b82-4a44-9545-b7b3c345971f.jpg%2Fv1%2Ffill%2Fw_894%2Ch_894%2Cq_70%2Cstrp%2Fbilbo_baggins_in_the_civil_war_by_houndhobbit_dj8mxhn-pre.jpg%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNCIsInBhdGgiOiJcL2ZcL2MzZjZmNzMzLTcyODktNDE4Ni1iYzIwLTFhODExNzQ3ZjM3ZlwvZGo4bXhobi1hZDc5ZjUwMC0wYjgyLTRhNDQtOTU0NS1iN2IzYzM0NTk3MWYuanBnIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.daP_x5eECE26Uo4ui9uvt-de5gOkOQbwAj0W3oxvj7c&f=1&nofb=1&ipt=e47750affbcaf6d843dee0e65f5a2f9499b02d76adc2352d92c0c6c02c21b495",
							}}
						/>
					</SidebarMenuItem>
				</SidebarMenu>

				<Separator />

				<SidebarCreateNew />

				<SidebarCoreNav gameId={gameId} />

				<SidebarPinnedEntities gameId={gameId} />

				<SidebarEntities gameId={gameId} />

				<SidebarQuestTree gameId={gameId} />

				<SidebarLocationTree gameId={gameId} />
			</SidebarContent>
		</Sidebar>
	);
}
