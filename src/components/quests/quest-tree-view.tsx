import {
	ChevronDown,
	ChevronRight,
	CheckCircle2,
	Circle,
	Pause,
	XCircle,
	Scroll,
	Target,
	Users,
	Crown,
	Zap,
} from "lucide-react";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Link } from "~/components/ui/link";
import { useGetQuestTreeSuspenseQuery } from "~/queries/quests";
import { cn } from "~/utils/cn";
import type { QuestTreeNode } from "~/api/types.gen";

interface QuestTreeViewProps {
	gameId: string;
	className?: string;
}

interface QuestNodeProps {
	node: QuestTreeNode;
	gameId: string;
	level?: number;
}

const getStatusConfig = (status: QuestTreeNode["status"]) => {
	switch (status) {
		case "completed":
			return {
				icon: CheckCircle2,
				color: "text-emerald-500",
				bgColor: "bg-emerald-500/10",
				borderColor: "border-emerald-500/20",
				label: "Complete",
			};
		case "active":
			return {
				icon: Zap,
				color: "text-blue-500",
				bgColor: "bg-blue-500/10",
				borderColor: "border-blue-500/20",
				label: "Active",
			};
		case "paused":
			return {
				icon: Pause,
				color: "text-amber-500",
				bgColor: "bg-amber-500/10",
				borderColor: "border-amber-500/20",
				label: "Paused",
			};
		case "cancelled":
			return {
				icon: XCircle,
				color: "text-red-500",
				bgColor: "bg-red-500/10",
				borderColor: "border-red-500/20",
				label: "Cancelled",
			};
		case "ready":
			return {
				icon: Target,
				color: "text-green-500",
				bgColor: "bg-green-500/10",
				borderColor: "border-green-500/20",
				label: "Ready",
			};
		default: // 'preparing'
			return {
				icon: Circle,
				color: "text-slate-500",
				bgColor: "bg-slate-500/10",
				borderColor: "border-slate-500/20",
				label: "Preparing",
			};
	}
};

const getTagIcon = (tag: string) => {
	const normalizedTag = tag.toLowerCase();

	if (normalizedTag.includes("main") || normalizedTag.includes("primary")) {
		return Crown;
	}
	if (normalizedTag.includes("player") || normalizedTag.includes("character")) {
		return Users;
	}
	if (normalizedTag.includes("side")) {
		return Scroll;
	}

	return null;
};

const getTagVariant = (tag: string) => {
	const normalizedTag = tag.toLowerCase();

	if (normalizedTag.includes("main") || normalizedTag.includes("primary")) {
		return "default" as const;
	}
	if (normalizedTag.includes("player") || normalizedTag.includes("character")) {
		return "secondary" as const;
	}
	if (normalizedTag.includes("completed")) {
		return "success" as const;
	}
	if (normalizedTag.includes("side")) {
		return "outline" as const;
	}

	return "outline" as const;
};

function QuestNode({ node, gameId, level = 0 }: QuestNodeProps) {
	const [isOpen, setIsOpen] = React.useState(level < 2); // Auto-expand first 2 levels
	const hasChildren = node.children && node.children.length > 0;
	const statusConfig = getStatusConfig(node.status);

	const questPath = `/games/${gameId}/quests/${node.id}`;
	const isTopLevel = level === 0;
	const excerpt = node.content_plain_text
		? node.content_plain_text.split("\n")[0].substring(0, 120) +
			(node.content_plain_text.length > 120 ? "..." : "")
		: "";

	return (
		<div
			className={cn(
				"relative group",
				level > 0 && "ml-6 border-l-2 border-border/30 pl-4",
			)}
		>
			{/* Connection line for nested items */}
			{level > 0 && (
				<div className="absolute -left-[1px] top-6 w-4 h-[1px] bg-border/30" />
			)}

			<div
				className={cn(
					"rounded-lg border transition-all duration-200",
					"hover:shadow-md hover:shadow-primary/5 hover:border-primary/30",
					statusConfig.borderColor,
					statusConfig.bgColor,
					isTopLevel ? "p-4" : "p-3",
				)}
			>
				<div className="flex items-start gap-3">
					{/* Status Icon */}
					<div
						className={cn(
							"flex items-center justify-center rounded-full shrink-0",
							"h-8 w-8",
							statusConfig.bgColor,
							statusConfig.borderColor,
							"border-2",
						)}
					>
						<statusConfig.icon
							className={cn("h-4 w-4", statusConfig.color)}
						/>
					</div>

					{/* Quest Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-3 mb-2">
							<div className="flex-1 min-w-0">
								<Link
									to={questPath}
									className={cn(
										"block hover:text-primary transition-colors",
										isTopLevel
											? "text-lg font-semibold"
											: "text-base font-medium",
									)}
								>
									<span className="truncate">{node.name}</span>
								</Link>

								{/* Status Badge */}
								<div className="flex items-center gap-2 mt-1">
									<Badge
										variant={
											statusConfig.label === "Complete"
												? "success"
												: statusConfig.label === "Active"
													? "ready"
													: "outline"
										}
										size="sm"
										className="text-xs"
									>
										{statusConfig.label}
									</Badge>

									{hasChildren && (
										<Badge
											variant="outline"
											size="sm"
											className="text-xs"
										>
											{node.children?.length} subtask
											{node.children?.length !== 1 ? "s" : ""}
										</Badge>
									)}
								</div>
							</div>

							{/* Expand/Collapse for children */}
							{hasChildren && (
								<Collapsible open={isOpen} onOpenChange={setIsOpen}>
									<CollapsibleTrigger
										render={
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 shrink-0"
											>
												{isOpen ? (
													<ChevronDown className="h-4 w-4" />
												) : (
													<ChevronRight className="h-4 w-4" />
												)}
											</Button>
										}
									/>
								</Collapsible>
							)}
						</div>

						{/* Quest Excerpt */}
						{excerpt && isTopLevel && (
							<p className="text-sm text-muted-foreground mb-3 leading-relaxed">
								{excerpt}
							</p>
						)}

						{/* Tags */}
						{node.tags && node.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mb-2">
								{node.tags.map((tag) => {
									const TagIcon = getTagIcon(tag);
									return (
										<Badge
											key={tag}
											variant={getTagVariant(tag)}
											size="sm"
											className="text-xs flex items-center gap-1"
										>
											{TagIcon && <TagIcon className="h-3 w-3" />}
											{tag}
										</Badge>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Children */}
				{hasChildren && (
					<Collapsible open={isOpen} onOpenChange={setIsOpen}>
						<CollapsibleContent>
							<div className="mt-4 space-y-3">
								{node.children?.map((child) => (
									<QuestNode
										key={child.id}
										node={child}
										gameId={gameId}
										level={level + 1}
									/>
								))}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>
		</div>
	);
}

export function QuestTreeView({ gameId, className }: QuestTreeViewProps) {
	const { data: questTreeData } = useGetQuestTreeSuspenseQuery(gameId);

	if (!questTreeData?.data || questTreeData.data.length === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center p-12 text-center",
					"rounded-lg border border-dashed border-border/50",
					"bg-muted/20",
					className,
				)}
			>
				<Scroll className="h-12 w-12 text-muted-foreground/40 mb-4" />
				<h3 className="text-lg font-semibold text-muted-foreground mb-2">
					No Quests Yet
				</h3>
				<p className="text-sm text-muted-foreground max-w-sm">
					This campaign doesn't have any quests yet. Create your first quest to
					start building your adventure!
				</p>
			</div>
		);
	}

	return (
		<div className={cn("w-full", className)}>
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
					<Scroll className="h-6 w-6 text-primary" />
					Quest Journal
				</h2>
				<p className="text-muted-foreground">
					Track your campaign's adventures and storylines
				</p>
			</div>

			{/* Quest Tree */}
			<div className="space-y-4">
				{questTreeData.data.map((quest) => (
					<QuestNode key={quest.id} node={quest} gameId={gameId} />
				))}
			</div>
		</div>
	);
}
