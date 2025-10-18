import { Button } from "./ui/button";

interface PageHeaderProps {
	title: string;
	description?: string;
	Icon?: React.ComponentType<{ className?: string }>;
	handleCreate?: () => void;
	children?: React.ReactNode;
}

export function PageHeader({
	title,
	description,
	handleCreate,
	Icon,
	children,
}: PageHeaderProps) {
	return (
		<div className="mb-8">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
						{Icon && <Icon className="h-6 w-6 text-primary" />}
						{title}
					</h1>
					{description && (
						<p className="text-muted-foreground my-2">{description}</p>
					)}
					{children}
				</div>
				{handleCreate && (
					<div className="flex items-center gap-2">
						<Button onClick={handleCreate}>Create</Button>
					</div>
				)}
			</div>
		</div>
	);
}
