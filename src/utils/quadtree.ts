// Quadtree implementation for spatial partitioning in force simulation
export interface Point {
	x: number;
	y: number;
	id: string;
}

export interface Rectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class QuadTree {
	private boundary: Rectangle;
	private points: Point[] = [];
	private divided = false;
	private northwest?: QuadTree;
	private northeast?: QuadTree;
	private southwest?: QuadTree;
	private southeast?: QuadTree;

	constructor(
		boundary: Rectangle,
		private capacity: number = 4,
	) {
		this.boundary = boundary;
	}

	insert(point: Point): boolean {
		if (!this.contains(point)) {
			return false;
		}

		if (this.points.length < this.capacity) {
			this.points.push(point);
			return true;
		}

		if (!this.divided) {
			this.subdivide();
		}

		return (
			this.northwest!.insert(point) ||
			this.northeast!.insert(point) ||
			this.southwest!.insert(point) ||
			this.southeast!.insert(point)
		);
	}

	private contains(point: Point): boolean {
		return (
			point.x >= this.boundary.x &&
			point.x < this.boundary.x + this.boundary.width &&
			point.y >= this.boundary.y &&
			point.y < this.boundary.y + this.boundary.height
		);
	}

	private subdivide(): void {
		const x = this.boundary.x;
		const y = this.boundary.y;
		const w = this.boundary.width / 2;
		const h = this.boundary.height / 2;

		this.northwest = new QuadTree({ x, y, width: w, height: h }, this.capacity);
		this.northeast = new QuadTree(
			{ x: x + w, y, width: w, height: h },
			this.capacity,
		);
		this.southwest = new QuadTree(
			{ x, y: y + h, width: w, height: h },
			this.capacity,
		);
		this.southeast = new QuadTree(
			{ x: x + w, y: y + h, width: w, height: h },
			this.capacity,
		);

		this.divided = true;
	}

	queryRange(range: Rectangle): Point[] {
		const found: Point[] = [];

		if (!this.intersects(range)) {
			return found;
		}

		for (const point of this.points) {
			if (this.pointInRange(point, range)) {
				found.push(point);
			}
		}

		if (this.divided) {
			found.push(...this.northwest!.queryRange(range));
			found.push(...this.northeast!.queryRange(range));
			found.push(...this.southwest!.queryRange(range));
			found.push(...this.southeast!.queryRange(range));
		}

		return found;
	}

	queryCircle(center: Point, radius: number): Point[] {
		const found: Point[] = [];
		const range: Rectangle = {
			x: center.x - radius,
			y: center.y - radius,
			width: radius * 2,
			height: radius * 2,
		};

		const candidates = this.queryRange(range);

		for (const point of candidates) {
			const dx = point.x - center.x;
			const dy = point.y - center.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance <= radius) {
				found.push(point);
			}
		}

		return found;
	}

	private intersects(range: Rectangle): boolean {
		return !(
			range.x > this.boundary.x + this.boundary.width ||
			range.x + range.width < this.boundary.x ||
			range.y > this.boundary.y + this.boundary.height ||
			range.y + range.height < this.boundary.y
		);
	}

	private pointInRange(point: Point, range: Rectangle): boolean {
		return (
			point.x >= range.x &&
			point.x <= range.x + range.width &&
			point.y >= range.y &&
			point.y <= range.y + range.height
		);
	}

	clear(): void {
		this.points = [];
		this.divided = false;
		this.northwest = undefined;
		this.northeast = undefined;
		this.southwest = undefined;
		this.southeast = undefined;
	}

	size(): number {
		let count = this.points.length;
		if (this.divided) {
			count += this.northwest!.size();
			count += this.northeast!.size();
			count += this.southwest!.size();
			count += this.southeast!.size();
		}
		return count;
	}
}
