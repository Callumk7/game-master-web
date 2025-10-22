import { Link } from "@tanstack/react-router";
import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	Gamepad,
	LogOut,
	Sparkles,
} from "lucide-react";
import { useGetUserProfileQuery } from "~/api/@tanstack/react-query.gen";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuLink,
	DropdownMenuPositioner,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "~/components/ui/sidebar";

export function SidebarUserControls() {
	const { data: userProfile } = useGetUserProfileQuery();
	const { isMobile } = useSidebar();

	if (!userProfile) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuButton
						size="lg"
						className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
					/>
				}
			>
				<Avatar className="h-8 w-8 rounded-lg">
					<AvatarImage
						src={userProfile.avatar_url}
						alt={userProfile.username}
					/>
					<AvatarFallback className="rounded-lg">
						{userProfile.username?.slice(0, 2)}
					</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-medium">{userProfile.username}</span>
					<span className="truncate text-xs">{userProfile.email}</span>
				</div>
				<ChevronsUpDown className="ml-auto size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuPositioner
				side={isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={24}
				alignOffset={24}
			>
				<DropdownMenuContent className="w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel>
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage
										src={userProfile.avatar_url}
										alt={userProfile.username}
									/>
									<AvatarFallback className="rounded-lg">
										{userProfile.username?.slice(0, 2)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{userProfile.username}
									</span>
									<span className="truncate text-xs">
										{userProfile.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<Sparkles />
							Upgrade to Pro
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuLink to="/account">
							<BadgeCheck />
							Account
						</DropdownMenuLink>
						<DropdownMenuLink to="/games">
							<Gamepad />
							Games
						</DropdownMenuLink>
						<DropdownMenuItem>
							<Bell />
							Notifications
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem render={<Link to="/logout" />}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
