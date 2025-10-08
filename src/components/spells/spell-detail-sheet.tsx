import type * as React from "react";
import { Badge } from "~/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import type { Spell } from "~/types/spell";
import {
	getSpellConditions,
	getSpellDamageTypes,
	getSpellDescription,
	getSpellHigherLevels,
	getSpellSavingThrows,
	getSpellScaling,
	getSpellTags,
} from "~/utils/spell-display";
import {
	getSpellCastingTime,
	getSpellComponents,
	getSpellDuration,
	getSpellLevel,
	getSpellRange,
	getSpellSchool,
	isRitual,
} from "~/utils/spell-utils";

interface SpellDetailSheetProps {
	spell: Spell;
	children: React.ReactNode;
}

export function SpellDetailSheet({ spell, children }: SpellDetailSheetProps) {
	const tags = getSpellTags(spell);
	const description = getSpellDescription(spell);
	const higherLevels = getSpellHigherLevels(spell);
	const scaling = getSpellScaling(spell);
	const damageTypes = getSpellDamageTypes(spell);
	const savingThrows = getSpellSavingThrows(spell);
	const conditions = getSpellConditions(spell);

	return (
		<Sheet>
			<SheetTrigger>{children}</SheetTrigger>
			<SheetContent side="right" width="lg" className="overflow-y-auto p-8 pt-10">
				<SheetHeader>
					<SheetTitle>{spell.name}</SheetTitle>
					<SheetDescription>
						{getSpellLevel(spell)} {getSpellSchool(spell)}
						{isRitual(spell) && " (ritual)"}
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6 pr-6">
					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{tags.map((tag) => (
								<Badge key={tag} variant="outline" className="text-xs">
									{tag}
								</Badge>
							))}
							<Badge variant="outline" className="text-xs">
								{spell.source}
								{spell.page && ` p${spell.page}`}
							</Badge>
						</div>
					)}

					{/* Basic Stats */}
					<div className="grid grid-cols-1 gap-4 text-sm">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="font-semibold">Casting Time:</span>{" "}
								{getSpellCastingTime(spell)}
							</div>
							<div>
								<span className="font-semibold">Range:</span>{" "}
								{getSpellRange(spell)}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="font-semibold">Components:</span>{" "}
								{getSpellComponents(spell)}
							</div>
							<div>
								<span className="font-semibold">Duration:</span>{" "}
								{getSpellDuration(spell)}
							</div>
						</div>
					</div>

					{/* Additional Info */}
					{(damageTypes || savingThrows || conditions) && (
						<div className="space-y-2 text-sm">
							{damageTypes && (
								<div>
									<span className="font-semibold">Damage Types:</span>{" "}
									{damageTypes}
								</div>
							)}
							{savingThrows && (
								<div>
									<span className="font-semibold">Saving Throws:</span>{" "}
									{savingThrows}
								</div>
							)}
							{conditions && (
								<div>
									<span className="font-semibold">Conditions:</span>{" "}
									{conditions}
								</div>
							)}
						</div>
					)}

					{/* Description */}
					<div>
						<h3 className="text-lg font-semibold mb-3 border-b pb-1">
							Description
						</h3>
						<div className="text-sm whitespace-pre-wrap text-muted-foreground">
							{description}
						</div>
					</div>

					{/* At Higher Levels */}
					{higherLevels && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								At Higher Levels
							</h3>
							<div className="text-sm whitespace-pre-wrap text-muted-foreground">
								{higherLevels}
							</div>
						</div>
					)}

					{/* Scaling (for cantrips) */}
					{scaling && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Scaling
							</h3>
							<div className="text-sm whitespace-pre-wrap text-muted-foreground">
								{scaling}
							</div>
						</div>
					)}

					{/* Other Sources */}
					{spell.otherSources && spell.otherSources.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Other Sources
							</h3>
							<div className="space-y-1 text-sm">
								{spell.otherSources.map((source, index) => (
									<div key={`${source.source}-${source.page}-${index}`}>
										<Badge variant="outline" className="text-xs mr-2">
											{source.source}
										</Badge>
										Page {source.page}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Aliases */}
					{spell.alias && spell.alias.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-3 border-b pb-1">
								Also Known As
							</h3>
							<div className="text-sm text-muted-foreground">
								{spell.alias.join(", ")}
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
