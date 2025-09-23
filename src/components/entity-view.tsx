interface EntityViewHeaderProps {
	name: string;
	badges?: React.ReactNode;
}

export function EntityViewHeader({ name, badges }: EntityViewHeaderProps) {
	return (
		<div>
			<div className="flex items-center gap-3">
				<div>
					<h1 className="text-3xl font-bold">{name}</h1>
					{badges && <div className="mt-1">{badges}</div>}
				</div>
			</div>
		</div>
	);
}
