import { X } from "lucide-react";
import { useEntityWindows, useUIActions } from "~/state/ui";
import { cn } from "~/utils/cn";

export function WindowTray() {
	const entityWindows = useEntityWindows();
	const { restoreEntityWindow, closeAllEntityWindows } = useUIActions();

	const minimizedWindows = entityWindows.filter(
		(window) => window.isOpen && window.isMinimized,
	);

	if (minimizedWindows.length === 0) {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[80vw]">
			<div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-3 py-2">
				<div className="flex items-center gap-2">
					{/* Close All Button */}
					<button
						type="button"
						onClick={closeAllEntityWindows}
						className={cn(
							"flex items-center justify-center p-2 rounded-md text-sm",
							"bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive",
							"border border-destructive/20 hover:border-destructive/30",
							"focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
							"transition-colors flex-shrink-0",
						)}
						title="Close all windows"
						aria-label="Close all windows"
					>
						<X className="w-4 h-4" />
					</button>

					{/* Separator */}
					<div className="w-px h-6 bg-border/50 flex-shrink-0" />

					{/* Scrollable window tabs */}
					<div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden">
						{minimizedWindows.map((window) => (
							<button
								key={window.id}
								type="button"
								onClick={() => restoreEntityWindow(window.id)}
								className={cn(
									"flex items-center gap-2 px-3 py-2 rounded-md text-sm",
									"bg-muted/50 hover:bg-muted transition-colors",
									"border border-border/50 hover:border-border",
									"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
									"min-w-[120px] max-w-[200px] flex-shrink-0",
								)}
								title={`Restore ${window.entity.name}`}
							>
								<div className="flex items-center gap-2 min-w-0">
									<div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
									<span className="truncate font-medium">
										{window.entity.name}
									</span>
									<span className="text-xs text-muted-foreground capitalize flex-shrink-0">
										{window.entity.type}
									</span>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

