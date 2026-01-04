interface TokenUsageProps {
	totalTokens: number;
	threshold?: number;
}

export function TokenUsage({ totalTokens, threshold = 100000 }: TokenUsageProps) {
	const percentage = (totalTokens / threshold) * 100;
	const isWarning = percentage > 80;

	return (
		<div className="px-4 py-2 text-xs border-b">
			<div className="flex items-center justify-between mb-1">
				<span className="text-muted-foreground">
					Context usage: {totalTokens.toLocaleString()} tokens
				</span>
				{isWarning && (
					<span className="text-yellow-600 font-medium">
						{Math.round(percentage)}% of recommended limit
					</span>
				)}
			</div>
			<div className="w-full bg-muted h-1 rounded-full overflow-hidden">
				<div
					className={`h-full transition-all ${
						isWarning ? "bg-yellow-500" : "bg-primary"
					}`}
					style={{ width: `${Math.min(percentage, 100)}%` }}
				/>
			</div>
		</div>
	);
}
