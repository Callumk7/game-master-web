import { ChevronRight } from "lucide-react";
import * as React from "react";
import type { EntityType } from "~/types";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { SidebarMenuItem, SidebarMenuLink, SidebarMenuSub } from "../ui/sidebar";

interface TreeNode {
	children?: Array<TreeNode>;
	id: string;
	name: string;
	entity_type: EntityType;
}

interface TreeProps {
	parentNode: TreeNode;
	gameId: string;
}

export function SidebarTree({ parentNode, gameId }: TreeProps) {
	const [isOpen, setIsOpen] = React.useState(true);

	if (!parentNode.children?.length) {
		return (
			<SidebarMenuItem>
				<div className="relative">
					<SidebarMenuLink
						to={`/games/$gameId/${parentNode.entity_type}s/$id` as string}
						params={{ gameId, id: parentNode.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{parentNode.name}</span>
					</SidebarMenuLink>
					<div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
						<div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
					</div>
				</div>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="group/collapsible"
			>
				<div className="relative">
					<SidebarMenuLink
						to={`/games/$gameId/${parentNode.entity_type}s/$id` as string}
						params={{ gameId, id: parentNode.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{parentNode.name}</span>
					</SidebarMenuLink>
					<CollapsibleTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-sidebar-accent z-10"
							>
								<ChevronRight
									className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
								/>
							</Button>
						}
					/>
				</div>
				<CollapsibleContent>
					<SidebarMenuSub className="mx-0 px-0 pl-2">
						{parentNode.children?.map((subNode) => (
							<SidebarTree
								gameId={gameId}
								key={subNode.id}
								parentNode={subNode}
							/>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}
