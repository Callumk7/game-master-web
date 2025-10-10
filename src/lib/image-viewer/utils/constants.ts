export const DEFAULT_CONFIG = {
	maxZoom: 3,
	minZoom: 0.5,
	enablePan: true,
	enableZoom: true,
	zoomSteps: [1, 2, 3],
	maxDisplayWidth: 1200,
	maxDisplayHeight: 800,
} as const;

export const DIALOG_PADDING = {
	fit: 140, // Header + padding + controls + gap
	zoom: 80, // Reduced padding when zoomed for maximum canvas
} as const;

export const LAYOUT = {
	headerHeight: 64, // Height reserved for dialog header
	controlsHeight: 40, // Height for zoom controls overlay
	sidePadding: 24, // Left/right padding when zoomed
} as const;

export const DRAG_SETTINGS = {
	preventClickDelay: 10, // ms delay before allowing clicks after drag
	panSensitivity: 0.5, // Scroll wheel pan sensitivity
	zoomSensitivity: 0.1, // Zoom step size for scroll wheel
} as const;
