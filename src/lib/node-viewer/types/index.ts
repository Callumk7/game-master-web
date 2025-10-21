export interface NodePosition {
	x: number;
	y: number;
	vx: number;
	vy: number;
	id: string;
	type: string;
	name: string;
	children: string[];
	connectionCount: number;
	fixed?: boolean;
}

export interface Connection {
	from: string;
	to: string;
	strength?: number;
}

export interface ViewTransform {
	x: number;
	y: number;
	scale: number;
}

export interface NodeConfig {
	color: string;
	label: string;
}

export interface NodeTypeConfig {
	[key: string]: NodeConfig;
}

export interface ForceSimulationConfig {
	repulsionStrength: number;
	attractionStrength: number;
	centerForceStrength: number;
	targetLinkLength: number;
	linkFlexibility: number;
	unconnectedNodeRepulsion: number;
	repulsionCutoffDistance: number;
	simulationWidth: number;
	simulationHeight: number;
}

export interface GenericNode {
	id: string;
	name: string;
	type: string;
	children?: GenericNode[];
	strength?: number;
}
