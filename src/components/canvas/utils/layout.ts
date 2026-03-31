/** Estimated node dimensions for handle calculations. */
const NODE_WIDTH = 280;
const NODE_HEIGHT = 150;

/**
 * Distribute `count` positions evenly in a circle around a center point.
 *
 * The radius scales with the number of nodes to prevent overlap.
 *
 * @param center  The center point of the circle (the source node position).
 * @param count   Number of positions to generate.
 * @param radius  Distance from center for each position (default scales with count).
 * @returns       An array of `{ x, y }` positions.
 */
export function radialLayout(
	center: { x: number; y: number },
	count: number,
	radius?: number,
): Array<{ x: number; y: number }> {
	if (count === 0) return [];

	const effectiveRadius = radius ?? Math.max(450, count * 80);

	// Single node — place directly to the right
	if (count === 1) {
		return [{ x: center.x + effectiveRadius, y: center.y }];
	}

	const angleStep = (2 * Math.PI) / count;
	// Start at the top (–π/2) so the first node appears above the source
	const startAngle = -Math.PI / 2;

	return Array.from({ length: count }, (_, i) => {
		const angle = startAngle + angleStep * i;
		return {
			x: center.x + effectiveRadius * Math.cos(angle),
			y: center.y + effectiveRadius * Math.sin(angle),
		};
	});
}

/**
 * Determine the best source and target handle IDs based on relative node
 * positions. Uses the dominant axis (horizontal vs vertical) to pick handles
 * on the closest sides.
 */
export function getClosestHandles(
	sourcePos: { x: number; y: number },
	targetPos: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
	// Compute center-to-center delta
	const dx = targetPos.x + NODE_WIDTH / 2 - (sourcePos.x + NODE_WIDTH / 2);
	const dy = targetPos.y + NODE_HEIGHT / 2 - (sourcePos.y + NODE_HEIGHT / 2);

	if (Math.abs(dx) >= Math.abs(dy)) {
		// Horizontal relationship
		return dx >= 0
			? { sourceHandle: "right-source", targetHandle: "left-target" }
			: { sourceHandle: "left-source", targetHandle: "right-target" };
	}
	// Vertical relationship
	return dy >= 0
		? { sourceHandle: "bottom-source", targetHandle: "top-target" }
		: { sourceHandle: "top-source", targetHandle: "bottom-target" };
}
