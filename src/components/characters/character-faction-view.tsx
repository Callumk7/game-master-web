import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Users } from "lucide-react";
import {
	getFactionMembersOptions,
	useGetCharacterPrimaryFactionQuery,
} from "~/api/@tanstack/react-query.gen";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "../ui/link";
import { CharacterTable } from "./character-table";

interface CharacterFactionViewProps {
	gameId: string;
	characterId: string;
}

export function CharacterFactionView({ gameId, characterId }: CharacterFactionViewProps) {
	// Fetch the primary faction if it exists
	const { data: primaryFactionData, isLoading: isFactionLoading } =
		useGetCharacterPrimaryFactionQuery({
			path: { game_id: gameId, character_id: characterId },
		});

	const faction = primaryFactionData?.data?.faction;

	const { data: memberData } = useQuery({
		...getFactionMembersOptions({
			path: { game_id: gameId, faction_id: faction?.id || "" },
		}),
		enabled: !!faction,
	});

	const members = memberData?.data?.members || [];

	if (!faction) {
		return (
			<div className="space-y-4">
				<div className="max-w-md">
					<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium mb-2">No Faction Assigned</h3>
					<p className="text-muted-foreground mb-4">
						This character is not currently a member of any faction.
					</p>
				</div>
			</div>
		);
	}

	const role = primaryFactionData.data?.role;

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

						{role && (
							<div>
								<h4 className="text-sm font-medium mb-2">Role</h4>
								<p className="text-sm text-muted-foreground line-clamp-3">
									{role}
								</p>
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
					</CardContent>
				</Card>
			)}
			<CharacterTable gameId={gameId} data={members} />
		</div>
	);
}
