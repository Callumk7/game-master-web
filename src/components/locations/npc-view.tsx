import { Crown, Users } from "lucide-react";
import { useGetLocationLinksQuery } from "~/api/@tanstack/react-query.gen";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface NPCViewProps {
	gameId: string;
	locationId: string;
}

export function NPCView({ gameId, locationId }: NPCViewProps) {
	const { data: linkData, isLoading } = useGetLocationLinksQuery({
		path: { game_id: gameId, location_id: locationId },
	});

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-muted rounded w-1/4"></div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: just a skeleton
							<div key={i} className="h-32 bg-muted rounded-xl"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	const links = linkData?.data;
	if (!links) {
		return (
			<div className="p-6 text-center">
				<div className="rounded-lg border border-dashed p-8">
					<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold text-muted-foreground">
						No NPCs or Factions Found
					</h3>
					<p className="text-sm text-muted-foreground mt-2">
						This location doesn't have any characters or factions associated
						with it yet.
					</p>
				</div>
			</div>
		);
	}

	const filteredNpcs = links.links?.characters?.filter(
		(character) => character.is_current_location === true,
	);

	const filteredFactions = links.links?.factions?.filter(
		(faction) => faction.is_current_location === true,
	);

	const hasContent =
		(filteredNpcs?.length ?? 0) > 0 || (filteredFactions?.length ?? 0) > 0;

	if (!hasContent) {
		return (
			<div className="p-6 text-center">
				<div className="rounded-lg border border-dashed p-8">
					<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold text-muted-foreground">
						No NPCs or Factions Found
					</h3>
					<p className="text-sm text-muted-foreground mt-2">
						This location doesn't have any characters or factions associated
						with it yet.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-8">
			{filteredNpcs && filteredNpcs.length > 0 && (
				<section>
					<div className="flex items-center gap-3 mb-6">
						<Users className="h-6 w-6 text-primary" />
						<h2 className="text-2xl font-bold">Characters</h2>
						<Badge variant="secondary">{filteredNpcs.length}</Badge>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredNpcs.map((npc) => (
							<Card
								key={npc.id}
								className="hover:shadow-md transition-shadow cursor-pointer"
							>
								<CardHeader className="pb-4">
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarFallback>
												{npc.name?.charAt(0)?.toUpperCase() ||
													"?"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<CardTitle className="truncate">
												{npc.name}
											</CardTitle>
											{npc.content_plain_text && (
												<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
													{npc.content_plain_text}
												</p>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between">
										<Badge variant="outline" size="sm">
											Character
										</Badge>
										{npc.is_current_location && (
											<Badge variant="success" size="sm">
												Present
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			)}

			{filteredFactions && filteredFactions.length > 0 && (
				<section>
					<div className="flex items-center gap-3 mb-6">
						<Crown className="h-6 w-6 text-primary" />
						<h2 className="text-2xl font-bold">Factions</h2>
						<Badge variant="secondary">{filteredFactions.length}</Badge>
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredFactions.map((faction) => (
							<Card
								key={faction.id}
								className="hover:shadow-md transition-shadow cursor-pointer"
							>
								<CardHeader className="pb-4">
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarFallback>
												{faction.name?.charAt(0)?.toUpperCase() ||
													"?"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<CardTitle className="truncate">
												{faction.name}
											</CardTitle>
											{faction.content_plain_text && (
												<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
													{faction.content_plain_text}
												</p>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between">
										<Badge variant="outline" size="sm">
											Faction
										</Badge>
										{faction.is_current_location && (
											<Badge variant="success" size="sm">
												Present
											</Badge>
										)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
