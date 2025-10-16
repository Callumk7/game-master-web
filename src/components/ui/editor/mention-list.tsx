import * as React from "react";
import { cn } from "~/utils/cn";
import type { MentionItem } from "./mention-extension-simple";

interface MentionListProps {
	items: MentionItem[];
	command: (item: MentionItem) => void;
}

interface MentionListRef {
	onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

export const MentionList = React.forwardRef<MentionListRef, MentionListProps>(
	(props, ref) => {
		const [selectedIndex, setSelectedIndex] = React.useState(0);
		const divRef = React.useRef<HTMLDivElement>(null);

		const selectItem = (index: number) => {
			const item = props.items[index];
			if (item) {
				props.command(item);
			}
		};

		const upHandler = () => {
			setSelectedIndex(
				(selectedIndex + props.items.length - 1) % props.items.length,
			);
		};

		const downHandler = () => {
			setSelectedIndex((selectedIndex + 1) % props.items.length);
		};

		const enterHandler = () => {
			selectItem(selectedIndex);
		};

		// biome-ignore lint/correctness/useExhaustiveDependencies: resets whenever items array changes in any way -> safest option
		React.useEffect(() => {
			setSelectedIndex(0);
		}, [props.items]);

		React.useImperativeHandle(ref, () => ({
			onKeyDown: ({ event }: { event: KeyboardEvent }) => {
				if (event.key === "ArrowUp") {
					upHandler();
					return true;
				}

				if (event.key === "ArrowDown") {
					downHandler();
					return true;
				}

				if (event.key === "Enter") {
					enterHandler();
					return true;
				}

				return false;
			},
		}));

		const getEntityIcon = (type: MentionItem["type"]) => {
			switch (type) {
				case "character":
					return "👤";
				case "faction":
					return "⚔";
				case "location":
					return "🗺";
				case "note":
					return "📝";
				case "quest":
					return "🎯";
				default:
					return "📄";
			}
		};

		const getEntityTypeLabel = (type: MentionItem["type"]) => {
			switch (type) {
				case "character":
					return "Character";
				case "faction":
					return "Faction";
				case "location":
					return "Location";
				case "note":
					return "Note";
				case "quest":
					return "Quest";
				default:
					return "Entity";
			}
		};

		const isCreateOption = (item: MentionItem) => item.id.startsWith("__create_");

		// Separate regular items from create options
		const regularItems = props.items.filter((item) => !isCreateOption(item));
		const createItems = props.items.filter((item) => isCreateOption(item));

		return (
			<div
				ref={divRef}
				className="bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-auto p-1"
			>
				{props.items.length ? (
					<>
						{/* Regular entity items */}
						{regularItems.map((item, index) => (
							<button
								key={item.id}
								type="button"
								className={cn(
									"flex items-center gap-2 w-full px-2 py-1.5 text-left text-sm rounded hover:bg-accent",
									index === selectedIndex ? "bg-accent" : "transparent",
								)}
								onClick={() => selectItem(index)}
							>
								<span className="text-base">
									{getEntityIcon(item.type)}
								</span>
								<div className="flex-1 min-w-0">
									<div className="font-medium text-foreground truncate">
										{item.label}
									</div>
									<div className="text-xs text-muted-foreground">
										{getEntityTypeLabel(item.type)}
									</div>
								</div>
							</button>
						))}

						{/* Separator if we have both regular and create items */}
						{regularItems.length > 0 && createItems.length > 0 && (
							<div className="border-t border-border my-1" />
						)}

						{/* Create new options */}
						{createItems.map((item, createIndex) => {
							const absoluteIndex = regularItems.length + createIndex;
							return (
								<button
									key={item.id}
									type="button"
									className={cn(
										"flex items-center gap-2 w-full px-2 py-1.5 text-left text-sm rounded hover:bg-accent",
										absoluteIndex === selectedIndex
											? "bg-accent"
											: "transparent",
									)}
									onClick={() => selectItem(absoluteIndex)}
								>
									<span className="text-base">
										{getEntityIcon(item.type)}
									</span>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-muted-foreground truncate italic">
											{item.label}
										</div>
									</div>
								</button>
							);
						})}
					</>
				) : (
					<div className="px-2 py-1.5 text-sm text-muted-foreground">
						No results found
					</div>
				)}
			</div>
		);
	},
);

MentionList.displayName = "MentionList";
