import { Edit, type LucideIcon, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Link } from "./link";

interface DetailField {
	label: string;
	value: ReactNode;
}

interface TabContent {
	id: string;
	label: string;
	content: ReactNode;
}

interface DetailTemplateProps {
	title: string;
	icon: LucideIcon;
	iconColor: string;
	badges?: ReactNode;
	editPath: string;
	gameId: string;
	entityId: string;
	imageUrl?: string;
	imageAlt?: string;
	fields?: DetailField[];
	content?: {
		title: string;
		value: ReactNode;
	};
	tabs?: TabContent[];
	defaultTab?: string;
	onDelete?: () => void;
}

export function DetailTemplate({
	title,
	icon: Icon,
	iconColor,
	badges,
	editPath,
	gameId,
	entityId,
	imageUrl,
	imageAlt,
	fields,
	content,
	tabs,
	defaultTab,
	onDelete,
}: DetailTemplateProps) {
	if (tabs) {
		return (
			<div className="space-y-6 mt-4">
				<h2 className="font-bold text-3xl">{title}</h2>

				{badges && <div className="flex justify-between">{badges}</div>}

				<Tabs defaultValue={defaultTab || tabs[0]?.id}>
					<TabsList>
						{tabs.map((tab) => (
							<TabsTrigger key={tab.id} value={tab.id}>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{tabs.map((tab) => (
						<TabsContent key={tab.id} value={tab.id}>
							{tab.content}
						</TabsContent>
					))}
				</Tabs>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Icon className={`h-8 w-8 ${iconColor}`} />
					<div>
						<h1 className="text-3xl font-bold">{title}</h1>
						{badges && <div className="mt-1">{badges}</div>}
					</div>
				</div>
				<div className="flex gap-2">
					<Link to={editPath} params={{ gameId, id: entityId }}>
						<Button variant="outline">
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Button>
					</Link>
					{onDelete && (
						<Button variant="destructive" onClick={onDelete}>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					)}
				</div>
			</div>

			{imageUrl && (
				<Card className="p-6">
					<h2 className="text-xl font-semibold mb-4">Portrait</h2>
					<img
						src={imageUrl}
						alt={imageAlt}
						className="max-w-sm h-auto rounded-lg border"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				</Card>
			)}

			<div className="grid gap-6">
				{fields && (
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Details</h2>
						<dl className="grid gap-4 sm:grid-cols-2">
							{fields.map((field) => (
								<div key={field.label}>
									<dt className="text-sm font-medium text-muted-foreground">
										{field.label}
									</dt>
									<dd className="text-base">{field.value}</dd>
								</div>
							))}
						</dl>
					</Card>
				)}

				{content?.value && (
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">{content.title}</h2>
						<div className="text-base whitespace-pre-wrap">
							{content.value}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
