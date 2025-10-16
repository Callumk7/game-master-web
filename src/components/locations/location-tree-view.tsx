import {
	Building2,
	Castle,
	ChevronDown,
	ChevronRight,
	Factory,
	Globe,
	Home,
	MapIcon,
	MapPin,
	Mountain,
	Trees,
} from "lucide-react";
import * as React from "react";
import type { LocationTreeNode, LocationTreeResponse } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Link } from "~/components/ui/link";
import { cn } from "~/utils/cn";

interface LocationTreeViewProps {
	gameId: string;
	className?: string;
	locationTreeResponse: LocationTreeResponse | undefined;
}

interface LocationNodeProps {
	node: LocationTreeNode;
	gameId: string;
	level?: number;
}

type LocationType =
	| "continent"
	| "nation"
	| "region"
	| "city"
	| "settlement"
	| "building"
	| "complex";

const getLocationTypeConfig = (type: LocationType) => {
	switch (type) {
		case "continent":
			return {
				icon: Globe,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Continent",
				description: "A vast landmass",
			};
		case "nation":
			return {
				icon: Mountain,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Nation",
				description: "A sovereign country",
			};
		case "region":
			return {
				icon: Trees,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Region",
				description: "A geographic area",
			};
		case "city":
			return {
				icon: Building2,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "City",
				description: "A major urban center",
			};
		case "settlement":
			return {
				icon: Home,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Settlement",
				description: "A small community",
			};
		case "building":
			return {
				icon: Castle,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Building",
				description: "A single structure",
			};
		default: // 'complex'
			return {
				icon: Factory,
				color: "text-slate-700 dark:text-slate-300",
				bgColor: "bg-slate-50 dark:bg-slate-800/50",
				borderColor: "border-slate-200 dark:border-slate-700",
				label: "Complex",
				description: "A group of structures",
			};
	}
};

const getLocationDepthVisual = (level: number) => {
	const colors = [
		"border-l-slate-300 dark:border-l-slate-600", // continent
		"border-l-slate-300 dark:border-l-slate-600", // nation
		"border-l-slate-300 dark:border-l-slate-600", // region
		"border-l-slate-300 dark:border-l-slate-600", // city
		"border-l-slate-300 dark:border-l-slate-600", // settlement
		"border-l-slate-300 dark:border-l-slate-600", // building
		"border-l-slate-300 dark:border-l-slate-600", // complex
	];

	return colors[Math.min(level, colors.length - 1)];
};

function LocationNode({ node, gameId, level = 0 }: LocationNodeProps) {
	const [isOpen, setIsOpen] = React.useState(level < 3); // Auto-expand first 3 levels
	const hasChildren = !!(node.children && node.children.length > 0);
	const typeConfig = getLocationTypeConfig(node.type);

	const locationPath = `/games/${gameId}/locations/${node.id}`;
	const isTopLevel = level === 0;
	return (
		<div
			className={cn(
				"relative group",
				level > 0 && `ml-6 border-l-4 pl-4 ${getLocationDepthVisual(level - 1)}`,
			)}
		>
			{/* Connection line for nested items */}
			{level > 0 && (
				<div
					className={cn(
						"absolute -left-[2px] top-8 w-6 h-[1px]",
						getLocationDepthVisual(level - 1).replace("border-l-", "bg-"),
					)}
				/>
			)}

			<div
				className={cn(
					"rounded-lg border transition-all duration-200",
					"hover:shadow-md hover:border-primary/30",
					typeConfig.borderColor,
					typeConfig.bgColor,
					isTopLevel ? "p-4" : "p-3",
				)}
			>
				<div className="flex items-start gap-4">
					{/* Location Type Icon */}
					<div className="shrink-0">
						<div
							className={cn(
								"flex items-center justify-center rounded-full",
								"h-10 w-10 border",
								typeConfig.borderColor,
								"bg-background",
							)}
						>
							<typeConfig.icon
								className={cn("h-5 w-5", typeConfig.color)}
							/>
						</div>
					</div>

					{/* Location Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<Link
									to={locationPath}
									className={cn(
										"block hover:text-primary transition-colors",
										isTopLevel
											? "text-lg font-semibold"
											: "text-base font-medium",
									)}
								>
									<span className="truncate">{node.name}</span>
								</Link>

								{/* Type Badge and Stats */}
								<div className="flex items-center gap-2 mt-1">
									<Badge
										variant="outline"
										size="sm"
										className="text-xs"
									>
										<typeConfig.icon className="h-3 w-3 mr-1" />
										{typeConfig.label}
									</Badge>

									{hasChildren && (
										<Badge
											variant="outline"
											size="sm"
											className="text-xs"
										>
											<MapPin className="h-3 w-3 mr-1" />
											{node.children?.length} location
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

						{/* Tags */}
						{node.tags && node.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mb-2">
								{node.tags.map((tag) => (
									<Badge
										key={tag}
										variant="outline"
										size="sm"
										className="text-xs"
									>
										{tag}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Children */}
				{hasChildren && (
					<Collapsible open={isOpen} onOpenChange={setIsOpen}>
						<CollapsibleContent>
							<div className="mt-4 space-y-3">
								{node.children
									?.sort((a, b) => {
										// Sort by type hierarchy: continent > nation > region > city > settlement > building > complex
										const typeOrder = [
											"continent",
											"nation",
											"region",
											"city",
											"settlement",
											"building",
											"complex",
										];
										const aIndex = typeOrder.indexOf(a.type);
										const bIndex = typeOrder.indexOf(b.type);
										if (aIndex !== bIndex) return aIndex - bIndex;
										return a.name.localeCompare(b.name);
									})
									.map((child) => (
										<LocationNode
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

export function LocationTreeView({
	gameId,
	className,
	locationTreeResponse,
}: LocationTreeViewProps) {
	if (!locationTreeResponse?.data || locationTreeResponse.data.length === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center p-8 text-center",
					"rounded-lg border border-dashed border-border/50",
					"bg-muted/20",
					className,
				)}
			>
				<MapIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
				<h3 className="text-lg font-semibold text-muted-foreground mb-2">
					No locations yet
				</h3>
				<p className="text-sm text-muted-foreground max-w-sm">
					Create your first location to start building your world.
				</p>
			</div>
		);
	}

	// Calculate total locations across all levels
	const getTotalLocations = (nodes: LocationTreeNode[]): number => {
		return nodes.reduce((total, node) => {
			return total + 1 + (node.children ? getTotalLocations(node.children) : 0);
		}, 0);
	};

	const totalLocations = getTotalLocations(locationTreeResponse.data);

	return (
		<div className={cn("w-full", className)}>
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
					<MapIcon className="h-6 w-6 text-primary" />
					Locations
				</h2>
				<p className="text-muted-foreground mb-4">
					Explore the geography and settlements of your world
				</p>

				{/* Stats */}
				<div className="flex gap-3 flex-wrap">
					<Badge variant="secondary" size="sm">
						<Globe className="h-3 w-3 mr-1" />
						{totalLocations} location{totalLocations !== 1 ? "s" : ""}
					</Badge>
					<Badge variant="outline" size="sm">
						<Mountain className="h-3 w-3 mr-1" />
						{locationTreeResponse.data.length} top-level
					</Badge>
				</div>
			</div>

			{/* Location Tree */}
			<div className="space-y-4">
				{locationTreeResponse.data
					.sort((a, b) => {
						// Sort top level by type then name
						const typeOrder = [
							"continent",
							"nation",
							"region",
							"city",
							"settlement",
							"building",
							"complex",
						];
						const aIndex = typeOrder.indexOf(a.type);
						const bIndex = typeOrder.indexOf(b.type);
						if (aIndex !== bIndex) return aIndex - bIndex;
						return a.name.localeCompare(b.name);
					})
					.map((location) => (
						<LocationNode key={location.id} node={location} gameId={gameId} />
					))}
			</div>
		</div>
	);
}
