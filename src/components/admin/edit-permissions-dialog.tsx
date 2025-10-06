import { useState } from "react";
import type { Member } from "~/api/types.gen";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";

type Role = "owner" | "admin" | "member" | "viewer";

type Permission = {
	id: string;
	label: string;
	description: string;
	enabled: boolean;
};

type EditPermissionsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	member: Member;
	onUpdateRole: (memberId: string, newRole: Role) => void;
};

export function EditPermissionsDialog({
	open,
	onOpenChange,
	member,
	onUpdateRole,
}: EditPermissionsDialogProps) {
	const [selectedRole, setSelectedRole] = useState<Role>(member.role as Role);
	const [permissions, setPermissions] = useState<Permission[]>([
		{
			id: "deployments",
			label: "Manage Deployments",
			description: "Create, update, and delete deployments",
			enabled: member.role === "admin" || member.role === "owner",
		},
		{
			id: "environments",
			label: "Manage Environments",
			description: "Configure environment variables and settings",
			enabled: member.role === "admin" || member.role === "owner",
		},
		{
			id: "team",
			label: "Manage Team",
			description: "Invite and remove team members",
			enabled: member.role === "owner",
		},
		{
			id: "billing",
			label: "Manage Billing",
			description: "View and update billing information",
			enabled: member.role === "owner",
		},
	]);

	const togglePermission = (id: string) => {
		setPermissions(
			permissions.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
		);
	};

	const handleSave = () => {
		onUpdateRole(member.user_id, selectedRole);
		console.log("[v0] Updated permissions for:", member.email, permissions);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Permissions</DialogTitle>
					<DialogDescription>
						Update role and permissions for {member.email}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="edit-role">Role</Label>
						<Select
							value={selectedRole}
							onValueChange={(v) => setSelectedRole(v as Role)}
						>
							<SelectTrigger id="edit-role">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value="owner"
									disabled={member.role !== "owner"}
								>
									Owner
								</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="viewer">Viewer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="space-y-4">
						<Label className="text-sm font-medium">Custom Permissions</Label>
						{permissions.map((permission) => (
							<div
								key={permission.id}
								className="flex items-start justify-between gap-4"
							>
								<div className="space-y-0.5 flex-1">
									<Label
										htmlFor={permission.id}
										className="text-sm font-medium cursor-pointer"
									>
										{permission.label}
									</Label>
									<p className="text-xs text-muted-foreground">
										{permission.description}
									</p>
								</div>
								<Switch
									id={permission.id}
									checked={permission.enabled}
									onCheckedChange={() =>
										togglePermission(permission.id)
									}
									disabled={
										permission.id === "team" ||
										permission.id === "billing"
									}
								/>
							</div>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
