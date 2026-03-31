/**
 * Distribute `count` positions evenly in a circle around a center point.
 *
 * @param center  The center point of the circle (the source node position).
 * @param count   Number of positions to generate.
 * @param radius  Distance from center for each position (default 300).
 * @returns       An array of `{ x, y }` positions.
 */
export function radialLayout(
	center: { x: number; y: number },
	count: number,
	radius = 300,
): Array<{ x: number; y: number }> {
	if (count === 0) return [];

	// Single node — place directly to the right
	if (count === 1) {
		return [{ x: center.x + radius, y: center.y }];
	}

	const angleStep = (2 * Math.PI) / count;
	// Start at the top (–π/2) so the first node appears above the source
	const startAngle = -Math.PI / 2;

	return Array.from({ length: count }, (_, i) => {
		const angle = startAngle + angleStep * i;
		return {
			x: center.x + radius * Math.cos(angle),
			y: center.y + radius * Math.sin(angle),
		};
	});
}
