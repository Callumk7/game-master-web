import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "~/utils/cn";

interface ResizablePanelGroupProps {
	direction: "horizontal" | "vertical";
	className?: string;
	children: React.ReactNode;
}

interface ResizablePanelProps {
	defaultSize?: number;
	minSize?: number;
	maxSize?: number;
	className?: string;
	children: React.ReactNode;
}

interface ResizableHandleProps {
	withHandle?: boolean;
	className?: string;
}

const ResizablePanelGroupContext = React.createContext<{
	direction: "horizontal" | "vertical";
	panels: Array<{ id: string; size: number; minSize: number; maxSize: number }>;
	updatePanelSize: (id: string, size: number) => void;
} | null>(null);

export function ResizablePanelGroup({ 
	direction, 
	className, 
	children 
}: ResizablePanelGroupProps) {
	const [panels, setPanels] = React.useState<Array<{
		id: string;
		size: number;
		minSize: number;
		maxSize: number;
	}>>([]);

	const updatePanelSize = React.useCallback((id: string, size: number) => {
		setPanels(prev => prev.map(panel => 
			panel.id === id ? { ...panel, size } : panel
		));
	}, []);

	const contextValue = React.useMemo(() => ({
		direction,
		panels,
		updatePanelSize,
	}), [direction, panels, updatePanelSize]);

	return (
		<ResizablePanelGroupContext.Provider value={contextValue}>
			<div
				className={cn(
					"flex h-full w-full",
					direction === "horizontal" ? "flex-row" : "flex-col",
					className
				)}
			>
				{children}
			</div>
		</ResizablePanelGroupContext.Provider>
	);
}

export function ResizablePanel({
	defaultSize = 50,
	minSize = 10,
	maxSize = 90,
	className,
	children,
}: ResizablePanelProps) {
	const context = React.useContext(ResizablePanelGroupContext);
	const panelId = React.useId();
	const [size, setSize] = React.useState(defaultSize);

	React.useEffect(() => {
		if (context) {
			context.updatePanelSize(panelId, size);
		}
	}, [context, panelId, size]);

	const style = React.useMemo(() => {
		if (context?.direction === "horizontal") {
			return { width: `${size}%`, height: "100%" };
		}
		return { height: `${size}%`, width: "100%" };
	}, [context?.direction, size]);

	return (
		<div
			className={cn("overflow-hidden", className)}
			style={style}
		>
			{children}
		</div>
	);
}

export function ResizableHandle({ withHandle = false, className }: ResizableHandleProps) {
	const context = React.useContext(ResizablePanelGroupContext);
	const [isDragging, setIsDragging] = React.useState(false);

	const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);

		const handleMouseMove = (e: MouseEvent) => {
			// Basic resize logic - this is a simplified implementation
			// In a production app, you'd want more sophisticated resize handling
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}, []);

	if (!context) return null;

	const isHorizontal = context.direction === "horizontal";

	return (
		<div
			className={cn(
				"group relative flex items-center justify-center bg-border transition-colors hover:bg-accent",
				isHorizontal 
					? "w-px min-w-px cursor-col-resize" 
					: "h-px min-h-px cursor-row-resize",
				isDragging && "bg-accent",
				className
			)}
			onMouseDown={handleMouseDown}
		>
			{withHandle && (
				<div className={cn(
					"flex items-center justify-center rounded-sm border bg-border transition-colors group-hover:bg-accent",
					isHorizontal 
						? "h-4 w-3 -translate-x-px" 
						: "h-3 w-4 -translate-y-px"
				)}>
					<GripVertical 
						className={cn(
							"h-2.5 w-2.5 text-muted-foreground",
							!isHorizontal && "rotate-90"
						)} 
					/>
				</div>
			)}
		</div>
	);
}