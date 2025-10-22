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
						<SidebarUserControls />
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
