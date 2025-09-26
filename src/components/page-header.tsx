import { Button } from "./ui/button";

interface PageHeaderProps {
	title: string;
	description?: string;
	handleCreate?: () => void;
}

export function PageHeader({ title, description, handleCreate }: PageHeaderProps) {
	return (
		<div className="mb-8">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-bold">{title}</h1>
					{description && (
						<p className="text-muted-foreground mt-2">{description}</p>
					)}
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
