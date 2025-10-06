import { Button } from "~/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "~/components/ui/popover";
import { Slider } from "~/components/ui/slider";
import type { ForceSimulationConfig } from "../types";

interface ControlsProps {
	config: ForceSimulationConfig;
	onConfigChange: (config: Partial<ForceSimulationConfig>) => void;
	isRunning: boolean;
	onRestart: () => void;
	onResetView: () => void;
	useCanvas: boolean;
	onToggleRenderer: () => void;
	performanceMonitoring?: boolean;
	onTogglePerformanceMonitoring?: () => void;
}

export function Controls({
	config,
	onConfigChange,
	isRunning,
	onRestart,
	onResetView,
	useCanvas,
	onToggleRenderer,
	performanceMonitoring,
	onTogglePerformanceMonitoring,
}: ControlsProps) {
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button size="sm" variant="secondary">
						Controls
					</Button>
				}
			/>
			<PopoverPositioner side="bottom" align="end">
				<PopoverContent className="space-y-10">
					{/* Quick Actions */}
					<div className="space-y-3">
						<h3 className="text-xs font-medium text-muted-foreground">
							Quick Actions
						</h3>
						<div className="flex flex-col gap-2">
							<Button
								size="sm"
								variant="secondary"
								onClick={onRestart}
								disabled={isRunning}
								className="w-full justify-start"
							>
								{isRunning ? "Simulating..." : "Restart Layout"}
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={onResetView}
								className="w-full justify-start"
							>
								Reset View
							</Button>
							<Button
								size="sm"
								variant="secondary"
								onClick={onToggleRenderer}
								className="w-full justify-start"
							>
								Renderer: {useCanvas ? "Canvas" : "SVG"}
							</Button>
							{isDevelopment && onTogglePerformanceMonitoring && (
								<Button
									size="sm"
									variant={
										performanceMonitoring ? "default" : "secondary"
									}
									onClick={onTogglePerformanceMonitoring}
									className={`w-full justify-start ${
										performanceMonitoring
											? "bg-green-600 hover:bg-green-700 text-white"
											: ""
									}`}
								>
									Performance: {performanceMonitoring ? "ON" : "OFF"}
								</Button>
							)}
						</div>
					</div>

					{/* Force Parameters */}
					<div className="space-y-3">
						<h3 className="text-xs font-medium text-muted-foreground">
							Force Parameters
						</h3>
						<div className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="repulsion-slider"
									className="text-xs font-medium"
								>
									Repulsion Force: {config.repulsionStrength}
								</label>
								<Slider
									id="repulsion-slider"
									value={[config.repulsionStrength]}
									onValueChange={(value) =>
										onConfigChange({
											repulsionStrength: Array.isArray(value)
												? value[0]
												: value,
										})
									}
									min={5000}
									max={50000}
									step={1000}
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="attraction-slider"
									className="text-xs font-medium"
								>
									Link Attraction: {config.attractionStrength * 0.01}
								</label>
								<Slider
									id="attraction-slider"
									value={[config.attractionStrength]}
									onValueChange={(value) =>
										onConfigChange({
											attractionStrength: Array.isArray(value)
												? value[0]
												: value,
										})
									}
									min={1}
									max={40}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="center-slider"
									className="text-xs font-medium"
								>
									Center Force: {config.centerForceStrength * 0.00001}
								</label>
								<Slider
									id="center-slider"
									value={[config.centerForceStrength]}
									onValueChange={(value) =>
										onConfigChange({
											centerForceStrength: Array.isArray(value)
												? value[0]
												: value,
										})
									}
									min={1}
									max={15}
									step={1}
									className="w-full"
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="length-slider"
									className="text-xs font-medium"
								>
									Target Link Length: {config.targetLinkLength}
									px
								</label>
								<Slider
									id="length-slider"
									value={[config.targetLinkLength]}
									onValueChange={(value) =>
										onConfigChange({
											targetLinkLength: Array.isArray(value)
												? value[0]
												: value,
										})
									}
									min={50}
									max={400}
									step={10}
									className="w-full"
								/>
							</div>
						</div>
					</div>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
