import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Users } from "lucide-react";
import { useMemo } from "react";
import {
	getFactionMembersOptions,
	getFactionOptions,
	useListFactionsQuery,
} from "~/api/@tanstack/react-query.gen";
import { SelectFactionCombobox } from "~/components/characters/select-faction-combobox";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Link } from "../ui/link";

interface CharacterFactionViewProps {
	gameId: string;
	characterId: string;
	primaryFactionId?: string;
}

export function CharacterFactionView({
	gameId,
	characterId,
	primaryFactionId,
}: CharacterFactionViewProps) {
	// Fetch the primary faction if it exists
	const { data: factionData, isLoading: isFactionLoading } = useQuery({
		...getFactionOptions({ path: { game_id: gameId, id: primaryFactionId! } }),
		enabled: !!primaryFactionId,
	});

	// Fetch faction members if faction exists
	const { data: factionMembersData, isLoading: isMembersLoading } = useQuery({
		...getFactionMembersOptions({
			path: { game_id: gameId, faction_id: primaryFactionId! },
		}),
		enabled: !!primaryFactionId,
	});

	// Fetch faction list for switcher
	const { data: factionList, isLoading: isFactionListLoading } = useListFactionsQuery({
		path: { game_id: gameId },
	});

	const faction = factionData?.data;
	const factionMembers = factionMembersData?.data?.members ?? [];
	const factions = useMemo(() => factionList?.data ?? [], [factionList?.data]);

	// Show faction selector if no faction is assigned
	if (!primaryFactionId) {
		return (
			<div className="space-y-4">
				<div className="text-center py-8">
					<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium mb-2">No Faction Assigned</h3>
					<p className="text-muted-foreground mb-4">
						This character is not currently a member of any faction.
					</p>
				</div>

				{isFactionListLoading ? (
					<div className="text-center text-muted-foreground">
						Loading factions...
					</div>
				) : (
					<div className="max-w-md mx-auto">
						<SelectFactionCombobox
							gameId={gameId}
							characterId={characterId}
							factions={factions}
						/>
					</div>
				)}
			</div>
		);
	}

	// Show loading state
	if (isFactionLoading) {
		return (
			<div className="space-y-4">
				<div className="animate-pulse">
					<div className="h-6 bg-muted rounded w-1/3 mb-2" />
					<div className="h-4 bg-muted rounded w-2/3 mb-4" />
					<div className="h-32 bg-muted rounded" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{faction && (
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									{faction.name}
									{faction.pinned && (
										<Badge variant="secondary">Pinned</Badge>
									)}
								</CardTitle>
								<CardDescription>Primary Faction</CardDescription>
							</div>
							<Link
								to="/games/$gameId/factions/$id"
								variant="outline"
								params={{ gameId, id: faction.id }}
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								View Details
							</Link>
						</div>
					</CardHeader>

					<CardContent className="space-y-4">
						{faction.tags && faction.tags.length > 0 && (
							<div>
								<h4 className="text-sm font-medium mb-2">Tags</h4>
								<div className="flex flex-wrap gap-2">
									{faction.tags.map((tag) => (
										<Badge key={tag} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{faction.content_plain_text && (
							<div>
								<h4 className="text-sm font-medium mb-2">Description</h4>
								<p className="text-sm text-muted-foreground line-clamp-3">
									{faction.content_plain_text}
								</p>
							</div>
						)}

						<Separator />

						<div>
							<div className="flex items-center justify-between mb-3">
								<h4 className="text-sm font-medium flex items-center gap-2">
									<Users className="h-4 w-4" />
									Members ({factionMembers.length})
								</h4>
							</div>

							{isMembersLoading ? (
								<div className="text-sm text-muted-foreground">
									Loading members...
								</div>
							) : factionMembers.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{factionMembers.slice(0, 6).map((member) => (
										<Link
											key={member.id}
											to="/games/$gameId/characters/$id"
											params={{ gameId, id: member.id }}
											className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50 transition-colors"
										>
											<div className="text-sm font-medium">
												{member.name}
											</div>
											{member.class && (
												<Badge
													variant="secondary"
													className="text-xs"
												>
													{member.class}
												</Badge>
											)}
										</Link>
									))}
									{factionMembers.length > 6 && (
										<div className="col-span-full text-center">
											<Link
												to="/games/$gameId/factions/$id"
												params={{ gameId, id: faction.id }}
											>
												View All {factionMembers.length} Members
											</Link>
										</div>
									)}
								</div>
							) : (
								<div className="text-sm text-muted-foreground">
									No other members
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			<div className="max-w-md">
				<h4 className="text-sm font-medium mb-2">Change Faction</h4>
				{isFactionListLoading ? (
					<div className="text-sm text-muted-foreground">
						Loading factions...
					</div>
				) : (
					<SelectFactionCombobox
						gameId={gameId}
						characterId={characterId}
						factions={factions}
						currentFactionId={primaryFactionId}
					/>
				)}
			</div>
		</div>
	);
}
