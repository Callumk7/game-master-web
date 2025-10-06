import { Ban, Eye, Lock, Shield } from "lucide-react";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

type PermissionLevel = "read" | "view" | "block";

type EntityPermissions = {
	deployments: PermissionLevel[];
	environments: PermissionLevel[];
	analytics: PermissionLevel[];
	settings: PermissionLevel[];
};

export function BlanketPermissions() {
	const [permissions, setPermissions] = React.useState<EntityPermissions>({
		deployments: ["read", "view"],
		environments: ["read"],
		analytics: ["view"],
		settings: [],
	});

	const togglePermission = (
		entity: keyof EntityPermissions,
		level: PermissionLevel,
	) => {
		setPermissions((prev) => {
			const current = prev[entity];
			const updated = current.includes(level)
				? current.filter((p) => p !== level)
				: [...current, level];
			return { ...prev, [entity]: updated };
		});
	};

	const hasPermission = (entity: keyof EntityPermissions, level: PermissionLevel) => {
		return permissions[entity].includes(level);
	};

	const getPermissionIcon = (level: PermissionLevel) => {
		switch (level) {
			case "read":
				return <Eye className="h-3.5 w-3.5" />;
			case "view":
				return <Shield className="h-3.5 w-3.5" />;
			case "block":
				return <Ban className="h-3.5 w-3.5" />;
		}
	};

	const entities: Array<{ key: keyof EntityPermissions; label: string }> = [
		{ key: "deployments", label: "Deployments" },
		{ key: "environments", label: "Environments" },
		{ key: "analytics", label: "Analytics" },
		{ key: "settings", label: "Settings" },
	];

	return (
		<Card className="border-border bg-card">
			<div className="p-6 border-b border-border">
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-lg bg-muted">
						<Lock className="h-5 w-5 text-muted-foreground" />
					</div>
					<div>
						<h2 className="text-lg font-semibold mb-1">
							Blanket Permissions
						</h2>
						<p className="text-sm text-muted-foreground text-pretty">
							Apply default permissions across all entities in your project
						</p>
					</div>
				</div>
			</div>

			<div className="p-6">
				<div className="space-y-6">
					{entities.map((entity) => (
						<div key={entity.key} className="space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-base font-medium">
									{entity.label}
								</Label>
								<div className="flex gap-2">
									{permissions[entity.key].map((level) => (
										<Badge
											key={level}
											variant="secondary"
											className="capitalize gap-1.5"
										>
											{getPermissionIcon(level)}
											{level}
										</Badge>
									))}
									{permissions[entity.key].length === 0 && (
										<Badge
											variant="outline"
											className="text-muted-foreground"
										>
											No permissions
										</Badge>
									)}
								</div>
							</div>

							<div className="flex flex-wrap gap-4 pl-4 border-l-2 border-border">
								<div className="flex items-center gap-2">
									<Switch
										id={`${entity.key}-read`}
										checked={hasPermission(entity.key, "read")}
										onCheckedChange={() =>
											togglePermission(entity.key, "read")
										}
									/>
									<Label
										htmlFor={`${entity.key}-read`}
										className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
									>
										<Eye className="h-3.5 w-3.5 text-muted-foreground" />
										Read
									</Label>
								</div>

								<div className="flex items-center gap-2">
									<Switch
										id={`${entity.key}-view`}
										checked={hasPermission(entity.key, "view")}
										onCheckedChange={() =>
											togglePermission(entity.key, "view")
										}
									/>
									<Label
										htmlFor={`${entity.key}-view`}
										className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
									>
										<Shield className="h-3.5 w-3.5 text-muted-foreground" />
										View
									</Label>
								</div>

								<div className="flex items-center gap-2">
									<Switch
										id={`${entity.key}-block`}
										checked={hasPermission(entity.key, "block")}
										onCheckedChange={() =>
											togglePermission(entity.key, "block")
										}
									/>
									<Label
										htmlFor={`${entity.key}-block`}
										className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
									>
										<Ban className="h-3.5 w-3.5 text-muted-foreground" />
										Block
									</Label>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
