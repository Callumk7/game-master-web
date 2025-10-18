import { createFileRoute } from "@tanstack/react-router";
import { useListGameMembersQuery } from "~/api/@tanstack/react-query.gen";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export const Route = createFileRoute("/_auth/games/$gameId/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return <MembershipDashboard />;
}

function MembershipDashboard() {
	const { gameId } = Route.useParams();
	const { data: membersData } = useListGameMembersQuery({ path: { game_id: gameId } });

	const members = membersData?.data ?? [];
	const getInitials = (email: string): string => {
		return email.split("@")[0].slice(0, 2).toUpperCase();
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			<div className="mb-8">
				<h1 className="text-3xl font-semibold mb-2 text-balance">Team Members</h1>
				<p className="text-muted-foreground text-pretty">
					Manage your team members, roles, and permissions
				</p>
			</div>

			<div className="space-y-6">
				{/* Members Section */}
				<Card className="border-border bg-card">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent border-border">
									<TableHead className="text-muted-foreground">
										Member
									</TableHead>
									<TableHead className="text-muted-foreground">
										Role
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{members?.map((member) => (
									<TableRow
										key={member.user_id}
										className="border-border"
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9">
													<AvatarFallback className="bg-muted text-muted-foreground text-xs">
														{getInitials(member.email)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">
														{member.email}
													</div>
													<div className="text-sm text-muted-foreground">
														{member.email}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge className="capitalize">
												{member.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													member.role === "active"
														? "default"
														: "secondary"
												}
												className="capitalize"
											>
												{member.role}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Card>
			</div>
		</div>
	);
}
