import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import type { Character, Faction, Location, Note, Quest } from "~/api/types.gen";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export type Entity = Character | Faction | Location | Note | Quest;
export type EntityType = "character" | "faction" | "location" | "note" | "quest";

interface EntityGridProps<T extends Entity> {
	entities: T[];
	entityType: EntityType;
	entityIcon: string;
	onCreateNew: () => void;
	onView: (entity: T) => void;
	onEdit: (entity: T) => void;
	onDelete: (entity: T) => void;
	getEntitySpecificInfo?: (entity: T) => React.ReactNode;
}

export function EntityGrid<T extends Entity>({
	entities,
	entityType,
	entityIcon,
	onCreateNew,
	onView,
	onEdit,
	onDelete,
	getEntitySpecificInfo,
}: EntityGridProps<T>) {
	if (entities.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-8">
						<div className="text-4xl mb-4">{entityIcon}</div>
						<h3 className="text-lg font-semibold mb-2">
							No {entityType}s found
						</h3>
						<Button onClick={onCreateNew}>
							<Plus className="w-4 h-4 mr-2" />
							Create {entityType}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{entities.map((entity) => (
				<Card key={entity.id} className="hover:shadow-md transition-shadow">
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between">
							<CardTitle className="text-lg line-clamp-2">
								{"name" in entity ? entity.name : "Untitled"}
							</CardTitle>
							<div className="flex gap-1 ml-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onView(entity)}
								>
									<Eye className="w-4 h-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onEdit(entity)}
								>
									<Edit className="w-4 h-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(entity)}
									className="text-destructive hover:text-destructive"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
						{getEntitySpecificInfo?.(entity)}
					</CardHeader>
					<CardContent>
						{("content" in entity && entity.content) ||
						("description" in entity && entity.description) ? (
							<p className="text-sm text-muted-foreground line-clamp-3 mb-3">
								{(
									("content" in entity && entity.content) ||
									("description" in entity && entity.description) ||
									""
								)
									.replace(/[#*`[\]]/g, "")
									.substring(0, 150)}
								...
							</p>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
