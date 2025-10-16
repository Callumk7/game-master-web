import { Badge } from "~/components/ui/badge";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { Monster } from "~/types/monsters";

interface MonsterDetailSheetProps {
	monster: Monster;
}

export function MonsterDetailSheet({ monster }: MonsterDetailSheetProps) {

	const abilityScores = [
		{ name: "STR", value: monster.str },
		{ name: "DEX", value: monster.dex },
		{ name: "CON", value: monster.con },
		{ name: "INT", value: monster.int },
		{ name: "WIS", value: monster.wis },
		{ name: "CHA", value: monster.cha },
	];

	const speedText = Object.entries(monster.speed)
		.filter(([key, value]) => value && key !== "canHover")
		.map(([key, value]) => {
			if (key === "walk") return `${value} ft.`;
			if (key === "fly")
				return `fly ${typeof value === "number" ? value : value.number} ft.`;
			if (key === "swim") return `swim ${value} ft.`;
			if (key === "burrow") return `burrow ${value} ft.`;
			if (key === "climb") return `climb ${value} ft.`;
			return "";
		})
		.join(", ");

	return (
		<SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{monster.name}</SheetTitle>
					<SheetDescription>
						{monster.source} • Page {monster.page}
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
					{/* Header Section */}
					<div className="text-center pb-4 border-b">
						<h2 className="text-2xl font-bold text-foreground mb-1">
							{monster.name}
						</h2>
						<p className="text-sm text-muted-foreground">
							{monster.source} • Page {monster.page}
						</p>
						<div className="flex justify-center gap-2 mt-3">
							{monster.size.map((size) => (
								<Badge key={size} variant="secondary" className="text-xs">
									{size}
								</Badge>
							))}
							<Badge variant="outline" className="text-xs">
								{typeof monster.type === "string"
									? monster.type
									: monster.type.type}
							</Badge>
						</div>
					</div>

					{/* Combat Stats Grid */}
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="bg-muted/30 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-primary mb-1">
								{monster.ac
									.map((ac) => (typeof ac === "number" ? ac : ac.ac))
									.join("/")}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wide">
								Armor Class
							</div>
						</div>
						<div className="bg-muted/30 rounded-lg p-4 text-center">
							<div className="text-2xl font-bold text-red-600 mb-1">
								{monster.hp.average}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wide">
								Hit Points
								<div className="text-[10px] mt-1 opacity-75">
									{monster.hp.formula}
								</div>
							</div>
						</div>
						<div className="bg-muted/30 rounded-lg p-4 text-center col-span-2 md:col-span-1">
							<div className="text-2xl font-bold text-orange-600 mb-1">
								{typeof monster.cr === "string"
									? monster.cr
									: monster.cr.cr}
							</div>
							<div className="text-xs text-muted-foreground uppercase tracking-wide">
								Challenge Rating
							</div>
						</div>
					</div>

					{/* Speed */}
					{speedText && (
						<div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
								<h4 className="font-medium text-blue-900 dark:text-blue-100">
									Speed
								</h4>
							</div>
							<p className="text-sm text-blue-800 dark:text-blue-200">
								{speedText}
							</p>
						</div>
					)}

					{/* Ability Scores */}
					<div className="space-y-3">
						<h4 className="font-semibold text-lg border-b pb-2">
							Ability Scores
						</h4>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{abilityScores.map(({ name, value }) => (
								<div
									key={name}
									className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
								>
									<span className="font-medium text-sm">{name}</span>
									<span className="text-lg font-bold">{value}</span>
								</div>
							))}
						</div>
					</div>

					{/* Alignment & Languages */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<h4 className="font-medium">Alignment</h4>
							<div className="flex flex-wrap gap-1">
								{monster.alignment.map((alignment, index) => {
									const alignmentValue =
										typeof alignment === "string"
											? alignment
											: alignment.alignment;
									const key =
										typeof alignment === "string"
											? alignment
											: `${alignment.alignment}-${index}`;
									return (
										<Badge
											key={key}
											variant="outline"
											className="text-xs"
										>
											{alignmentValue}
										</Badge>
									);
								})}
							</div>
						</div>
						{monster.languages && monster.languages.length > 0 && (
							<div className="space-y-2">
								<h4 className="font-medium">Languages</h4>
								<p className="text-sm text-muted-foreground">
									{monster.languages.join(", ")}
								</p>
							</div>
						)}
					</div>

					{/* Traits */}
					{monster.trait && monster.trait.length > 0 && (
						<div className="space-y-3">
							<h4 className="font-semibold text-lg border-b pb-2">
								Traits{" "}
								<span className="text-sm font-normal text-muted-foreground">
									({monster.trait.length})
								</span>
							</h4>
							<div className="space-y-3 max-h-60 overflow-y-auto">
								{monster.trait.slice(0, 5).map((trait) => (
									<div
										key={trait.name}
										className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border-l-4 border-green-500"
									>
										<h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
											{trait.name}
										</h5>
										<div className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
											{typeof trait.entries[0] === "string"
												? trait.entries[0]
												: "Complex entry"}
										</div>
									</div>
								))}
								{monster.trait.length > 5 && (
									<p className="text-sm text-muted-foreground italic text-center py-2">
										And {monster.trait.length - 5} more traits...
									</p>
								)}
							</div>
						</div>
					)}

					{/* Actions */}
					{monster.action && monster.action.length > 0 && (
						<div className="space-y-3">
							<h4 className="font-semibold text-lg border-b pb-2">
								Actions{" "}
								<span className="text-sm font-normal text-muted-foreground">
									({monster.action.length})
								</span>
							</h4>
							<div className="space-y-3 max-h-60 overflow-y-auto">
								{monster.action.slice(0, 5).map((action) => (
									<div
										key={action.name}
										className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg p-4 border-l-4 border-red-500"
									>
										<h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">
											{action.name}
										</h5>
										<div className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
											{typeof action.entries[0] === "string"
												? action.entries[0]
												: "Complex entry"}
										</div>
									</div>
								))}
								{monster.action.length > 5 && (
									<p className="text-sm text-muted-foreground italic text-center py-2">
										And {monster.action.length - 5} more actions...
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</SheetContent>
			);
}
