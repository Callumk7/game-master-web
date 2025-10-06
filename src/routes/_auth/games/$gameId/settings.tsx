import { createFileRoute } from "@tanstack/react-router";
import { MoreVertical, Search, Shield, UserPlus, Lock } from "lucide-react";
import { AvatarFallback } from "node_modules/@base-ui-components/react/esm/avatar/fallback/AvatarFallback";
import * as React from "react";
import { useListGameMembersQuery } from "~/api/@tanstack/react-query.gen";
import { Member } from "~/api/types.gen";
import { BlanketPermissions } from "~/components/admin/blanket-permissions";
import { EditPermissionsDialog } from "~/components/admin/edit-permissions-dialog";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Table,
	TableHeader,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
} from "~/components/ui/table";

export const Route = createFileRoute("/_auth/games/$gameId/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return <MembershipDashboard />;
}

type Role = "owner" | "admin" | "member" | "viewer";

function MembershipDashboard() {
	const { gameId } = Route.useParams();
	const {
		data: membersData,
		isLoading,
		isError,
	} = useListGameMembersQuery({ path: { game_id: gameId } });

	const [members, setMembers] = React.useState<Member[]>(membersData?.data || []);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
	const [editPermissionsOpen, setEditPermissionsOpen] = React.useState(false);
	const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
	const [inviteEmail, setInviteEmail] = React.useState("");
	const [inviteRole, setInviteRole] = React.useState("member");

	const filteredMembers = members.filter((member) =>
		member.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getInitials = (email: string): string => {
		return email.split("@")[0].slice(0, 2).toUpperCase();
	};

	const handleInvite = () => {
		const newMember: Member = {
			user_id: Date.now().toString(),
			email: inviteEmail,
			role: inviteRole,
		};
		setMembers([...members, newMember]);
		setInviteDialogOpen(false);
		setInviteEmail("");
		setInviteRole("member");
	};

	const handleRemoveMember = (id: string) => {
		setMembers(members.filter((m) => m.user_id !== id));
	};

	const handleResetPassword = (member: Member) => {
		console.log("[v0] Reset password for:", member.email);
		// Password reset logic would go here
	};

	const handleEditPermissions = (member: Member) => {
		setSelectedMember(member);
		setEditPermissionsOpen(true);
	};

	const handleUpdateRole = (memberId: string, newRole: Role) => {
		setMembers(
			members.map((m) => (m.user_id === memberId ? { ...m, role: newRole } : m)),
		);
		setEditPermissionsOpen(false);
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
				{/* Blanket Permissions Section */}
				<BlanketPermissions />

				{/* Members Section */}
				<Card className="border-border bg-card">
					<div className="p-6 border-b border-border">
						<div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
							<div className="relative flex-1 max-w-md w-full">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search members..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9 bg-background"
								/>
							</div>
							<Button
								onClick={() => setInviteDialogOpen(true)}
								className="w-full sm:w-auto"
							>
								<UserPlus className="h-4 w-4 mr-2" />
								Invite Member
							</Button>
						</div>
					</div>

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
									<TableHead className="text-muted-foreground">
										Status
									</TableHead>
									<TableHead className="text-muted-foreground">
										Joined
									</TableHead>
									<TableHead className="text-right text-muted-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredMembers?.map((member) => (
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
										<TableCell className="text-muted-foreground">
											{new Date(
												member.joined_at ?? 0,
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger
													render={
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													}
												></DropdownMenuTrigger>
												<DropdownMenuPositioner align="end">
													<DropdownMenuContent className="w-48">
														<DropdownMenuItem
															onClick={() =>
																handleEditPermissions(
																	member,
																)
															}
														>
															<Shield className="h-4 w-4 mr-2" />
															Edit Permissions
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleResetPassword(
																	member,
																)
															}
														>
															<Lock className="h-4 w-4 mr-2" />
															Reset Password
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() =>
																handleRemoveMember(
																	member.user_id,
																)
															}
															className="text-destructive focus:text-destructive"
															disabled={
																member.role === "owner"
															}
														>
															Remove Member
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenuPositioner>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Card>
			</div>

			{/* Invite Member Dialog */}
			<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite Team Member</DialogTitle>
						<DialogDescription>
							Send an invitation to join your team. They'll receive an email
							with instructions.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="colleague@company.com"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select
								value={inviteRole}
								onValueChange={(v) => setInviteRole(v as Role)}
							>
								<SelectTrigger id="role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								{inviteRole === "admin" &&
									"Full access to manage team and settings"}
								{inviteRole === "member" &&
									"Can view and edit project resources"}
								{inviteRole === "viewer" &&
									"Read-only access to project resources"}
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setInviteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleInvite} disabled={!inviteEmail}>
							Send Invitation
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Permissions Dialog */}
			{selectedMember && (
				<EditPermissionsDialog
					open={editPermissionsOpen}
					onOpenChange={setEditPermissionsOpen}
					member={selectedMember}
					onUpdateRole={handleUpdateRole}
				/>
			)}
		</div>
	);
}
