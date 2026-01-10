import { useQuery } from "@tanstack/react-query";
import { createFileRoute, createLink } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";
import { z } from "zod";
import { searchGameOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { Switch } from "~/components/ui/switch";
import type { Entity, EntityType } from "~/types";

const searchParamsSchema = z.object({
	q: z.preprocess(
		(v) => (typeof v === "string" && v.trim().length ? v : undefined),
		z.string().optional(),
	),
	types: z.preprocess(
		(v) => (typeof v === "string" && v.trim().length ? v : undefined),
		z.string().optional(),
	),
	tags: z.preprocess(
		(v) => (typeof v === "string" && v.trim().length ? v : undefined),
		z.string().optional(),
	),
	pinned_only: z.preprocess(
		(v) => (v === true || v === "true" ? true : undefined),
		z.boolean().optional(),
	),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute("/_auth/games/$gameId/search")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		const parsed = searchParamsSchema.safeParse(search);
		return parsed.success ? parsed.data : {};
	},
});

const AnchorLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<"a">
>((props, ref) => <a ref={ref} {...props} />);
AnchorLink.displayName = "AnchorLink";
const EntityCardLink = createLink(AnchorLink);

const TYPE_META: Array<{ type: EntityType; label: string; param: string }> = [
	{ type: "character", label: "Characters", param: "character" },
	{ type: "faction", label: "Factions", param: "faction" },
	{ type: "location", label: "Locations", param: "location" },
	{ type: "quest", label: "Quests", param: "quest" },
	{ type: "note", label: "Notes", param: "note" },
];

const ROUTE_BY_TYPE: Record<EntityType, string> = {
	character: "/games/$gameId/characters/$id",
	faction: "/games/$gameId/factions/$id",
	location: "/games/$gameId/locations/$id",
	quest: "/games/$gameId/quests/$id",
	note: "/games/$gameId/notes/$id",
};

function normalizeCommaList(value: string) {
	return value
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
		.join(",");
}

function RouteComponent() {
	const { gameId } = Route.useParams();
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const q = search.q ?? "";
	const types = search.types ?? "";
	const tags = search.tags ?? "";
	const pinned_only = search.pinned_only ?? false;

	const [draftQ, setDraftQ] = React.useState(q);
	const [draftTags, setDraftTags] = React.useState(tags);

	React.useEffect(() => setDraftQ(q), [q]);
	React.useEffect(() => setDraftTags(tags), [tags]);

	React.useEffect(() => {
		const handle = setTimeout(() => {
			const nextQ = draftQ.trim().length > 0 ? draftQ : undefined;
			navigate({
				replace: true,
				search: (prev) => ({
					...prev,
					q: nextQ,
				}),
			});
		}, 250);
		return () => clearTimeout(handle);
	}, [draftQ, navigate]);

	React.useEffect(() => {
		const handle = setTimeout(() => {
			const nextTags =
				normalizeCommaList(draftTags).length > 0
					? normalizeCommaList(draftTags)
					: undefined;
			navigate({
				replace: true,
				search: (prev) => ({
					...prev,
					tags: nextTags,
				}),
			});
		}, 300);
		return () => clearTimeout(handle);
	}, [draftTags, navigate]);

	const normalizedTypes = normalizeCommaList(types);
	const typesSet = React.useMemo(
		() => new Set(normalizedTypes ? normalizedTypes.split(",") : []),
		[normalizedTypes],
	);

	const updateTypes = (next: Set<string>) => {
		const nextValue = Array.from(next).sort().join(",");
		const nextTypes = nextValue.length > 0 ? nextValue : undefined;
		navigate({
			replace: true,
			search: (prev) => ({
				...prev,
				types: nextTypes,
			}),
		});
	};

	const qTrim = q.trim();
	const typesParam = normalizedTypes || undefined;
	const tagsParam = normalizeCommaList(tags) || undefined;

	const searchQuery = useQuery({
		...searchGameOptions({
			path: { game_id: gameId },
			query: {
				q: qTrim,
				types: typesParam,
				tags: tagsParam,
				pinned_only,
				limit: 50,
				offset: 0,
			},
		}),
		enabled: qTrim.length > 0,
	});

	const searchData = searchQuery.data?.data;
	const total = searchData?.total_results ?? 0;
	const results = searchData?.results;

	const groups: Array<{ type: EntityType; label: string; items: Entity[] }> = [
		{ type: "character", label: "Characters", items: results?.characters ?? [] },
		{ type: "faction", label: "Factions", items: results?.factions ?? [] },
		{ type: "location", label: "Locations", items: results?.locations ?? [] },
		{ type: "quest", label: "Quests", items: results?.quests ?? [] },
		{ type: "note", label: "Notes", items: results?.notes ?? [] },
	];

	return (
		<Container>
			<PageHeader
				title="Search"
				description="Search across characters, factions, locations, quests, and notes."
				Icon={Search}
			/>

			<div className="space-y-6">
				<div className="rounded-lg border p-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="search-q">Query</Label>
							<Input
								id="search-q"
								placeholder="Search name + content…"
								value={draftQ}
								onChange={(e) => setDraftQ(e.currentTarget.value)}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="search-tags">Tags</Label>
							<Input
								id="search-tags"
								placeholder="comma,separated,tags"
								value={draftTags}
								onChange={(e) => setDraftTags(e.currentTarget.value)}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between gap-3">
							<div className="text-sm font-medium">Entity types</div>
							<div className="flex items-center gap-2">
								<Label
									htmlFor="pinned-only"
									className="text-sm text-muted-foreground"
								>
									Pinned only
								</Label>
								<Switch
									id="pinned-only"
									checked={pinned_only}
									onCheckedChange={(checked) => {
										const nextPinned = checked ? true : undefined;
										navigate({
											replace: true,
											search: (prev) => ({
												...prev,
												pinned_only: nextPinned,
											}),
										});
									}}
								/>
							</div>
						</div>

						<div className="flex flex-wrap gap-4">
							{TYPE_META.map((t) => {
								const checked = typesSet.has(t.param);
								return (
									<Label key={t.type} className="cursor-pointer">
										<Checkbox
											checked={checked}
											onCheckedChange={(next) => {
												const nextSet = new Set(typesSet);
												const isChecked = next === true;
												if (isChecked) nextSet.add(t.param);
												else nextSet.delete(t.param);
												updateTypes(nextSet);
											}}
										/>
										<span>{t.label}</span>
									</Label>
								);
							})}
						</div>

						<div className="text-xs text-muted-foreground">
							Leaving entity types empty searches all types. Results are
							capped to 50 per type.
						</div>
					</div>
				</div>

				{qTrim.length === 0 ? (
					<div className="text-sm text-muted-foreground">
						Type a query above to search your game.
					</div>
				) : searchQuery.isLoading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Spinner />
						Searching…
					</div>
				) : searchQuery.isError ? (
					<div className="text-sm text-destructive">
						Search failed. Please try again.
					</div>
				) : (
					<div className="space-y-6">
						<div className="flex items-center justify-between gap-3">
							<div className="text-sm text-muted-foreground">
								Showing{" "}
								<span className="font-medium text-foreground">
									{total}
								</span>{" "}
								result{total === 1 ? "" : "s"}
							</div>
							{searchData?.filters?.pinned_only ? (
								<Badge variant="secondary">Pinned only</Badge>
							) : null}
						</div>

						{groups.every((g) => g.items.length === 0) ? (
							<div className="text-sm text-muted-foreground">
								No results found. Try different keywords, tags, or entity
								types.
							</div>
						) : (
							<div className="space-y-8">
								{groups
									.filter((g) => g.items.length > 0)
									.map((g) => (
										<div key={g.type} className="space-y-2">
											<div className="flex items-center gap-2">
												<h2 className="text-sm font-semibold">
													{g.label}
												</h2>
												<Badge variant="outline">
													{g.items.length}
												</Badge>
											</div>
											<div className="grid gap-2">
												{g.items.map((entity) => (
													<EntityResultCard
														key={entity.id}
														entityType={g.type}
														gameId={gameId}
														entity={entity}
													/>
												))}
											</div>
										</div>
									))}
							</div>
						)}
					</div>
				)}
			</div>
		</Container>
	);
}

function EntityResultCard({
	gameId,
	entityType,
	entity,
}: {
	gameId: string;
	entityType: EntityType;
	entity: Entity;
}) {
	const to = ROUTE_BY_TYPE[entityType];
	const name = "name" in entity ? entity.name : undefined;
	const pinned = "pinned" in entity ? entity.pinned : false;
	const tags = "tags" in entity ? entity.tags : undefined;
	const contentPlain =
		"content_plain_text" in entity ? entity.content_plain_text : undefined;

	const snippet = contentPlain?.trim();

	return (
		<EntityCardLink
			to={to}
			params={{ gameId, id: entity.id }}
			className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<Card className="py-3 shadow-none hover:bg-accent/30 transition-colors">
				<CardContent className="px-4">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="font-medium truncate">
								{name || "Untitled"}
							</div>
							{snippet ? (
								<div className="mt-1 text-xs text-muted-foreground overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
									{snippet}
								</div>
							) : null}
						</div>
						<div className="flex items-center gap-1 shrink-0">
							<Badge variant="outline" size="sm">
								{entityType}
							</Badge>
							{pinned ? (
								<Badge variant="secondary" size="sm">
									Pinned
								</Badge>
							) : null}
						</div>
					</div>

					{tags && tags.length > 0 ? (
						<div className="mt-2 flex flex-wrap gap-1">
							{tags.slice(0, 8).map((t) => (
								<Badge key={t} variant="secondary" size="sm">
									{t}
								</Badge>
							))}
						</div>
					) : null}
				</CardContent>
			</Card>
		</EntityCardLink>
	);
}
