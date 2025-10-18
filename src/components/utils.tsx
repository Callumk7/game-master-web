import type * as React from "react";
import { Badge, type BadgeVariant } from "./ui/badge";

export function createBadges(tags: string[] | undefined): React.JSX.Element | null;
export function createBadges(
	mainTag: string,
	otherTags: string[] | undefined,
): React.JSX.Element | null;
export function createBadges(...tags: string[]): React.JSX.Element | null;
export function createBadges(
	mainTags: string[],
	otherTags: string[] | undefined,
): React.JSX.Element | null;

export function createBadges(
	arg1?: string[] | undefined | string,
	arg2?: string[] | undefined | string,
	...rest: string[]
): React.JSX.Element | null {
	let tags: string[] = [];

	// Case 1: The first argument is an array. This can handle the first and fourth overloads.
	if (Array.isArray(arg1)) {
		tags = arg1;
		// Case 4: The second argument is also an array.
		if (Array.isArray(arg2)) {
			tags = [...tags, ...arg2];
		}
		// Case 2: The first argument is a string.
	} else if (typeof arg1 === "string") {
		// Case 2a: The second argument is an array.
		if (Array.isArray(arg2)) {
			tags = [arg1, ...(arg2 || [])];
		}
		// Case 2b: All arguments are strings.
		else {
			const otherStrings = arg2 ? [arg2, ...rest] : rest;
			tags = [arg1, ...otherStrings];
		}
	}

	if (tags.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);
}

export function getVariantFromStatus(status: string): BadgeVariant {
	const variantMap: Record<string, BadgeVariant> = {
		cancelled: "destructive",
		completed: "success",
		ready: "info",
		paused: "info",
		active: "warning",
	};

	return variantMap[status] || "outline";
}
