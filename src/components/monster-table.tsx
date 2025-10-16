import { MonsterDetailSheet } from "~/components/monster-detail-sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Sheet, SheetTrigger } from "~/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { Monster } from "~/types/monsters";

interface MonsterTableProps {
	monsters: Monster[];
}

export function MonsterTable({ monsters }: MonsterTableProps) {
	return (
		<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Size</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Alignment</TableHead>
							<TableHead>AC</TableHead>
							<TableHead>HP</TableHead>
							<TableHead>CR</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{monsters.map((monster) => (
							<TableRow key={monster.name}>
								<TableCell>
								<Sheet>
								<SheetTrigger
								 render={
								  <Button
								    variant="link"
								   className="p-0 h-auto font-medium text-left justify-start"
								   >
								     {monster.name}
											</Button>
										}
									/>
									<MonsterDetailSheet monster={monster} />
								</Sheet>
							</TableCell>
								<TableCell>
									<div className="flex flex-wrap gap-1">
										{monster.size.map((size) => (
											<Badge
												key={size}
												variant="outline"
												className="text-xs"
											>
												{size}
											</Badge>
										))}
									</div>
								</TableCell>
								<TableCell>
									<span className="capitalize">
										{typeof monster.type === "string"
											? monster.type
											: monster.type.type}
									</span>
								</TableCell>
								<TableCell>
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
								</TableCell>
								<TableCell>
									{monster.ac
										.map((ac) =>
											typeof ac === "number" ? ac : ac.ac,
										)
										.join(" or ")}
								</TableCell>
								<TableCell>{monster.hp.average}</TableCell>
								<TableCell>
									{typeof monster.cr === "string"
										? monster.cr
										: monster.cr.cr}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				</div>
				);
}
