import * as React from "react";
import { Button } from "~/components/ui/button";
import DraggableWindow from "~/components/draggable";
import type { EntityLink } from "./EntityLinksTable";

interface EntityLinkButtonProps {
	entity: EntityLink;
}

// Simple counter for staggering window positions
let windowCounter = 0;

export function EntityLinkButton({ entity }: EntityLinkButtonProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [windowOffset] = React.useState(() => {
		const offset = windowCounter * 30; // 30px stagger
		windowCounter = (windowCounter + 1) % 10; // Reset after 10 windows
		return { x: offset, y: offset };
	});

	const displayContent = entity.content_plain_text || entity.description_plain_text || entity.content || entity.description || "No content available";

	return (
		<>
			<Button
				variant="ghost"
				className="font-medium hover:underline p-0 h-auto justify-start"
				onClick={() => setIsOpen(true)}
			>
				{entity.name}
			</Button>
			<DraggableWindow
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				title={entity.name}
				defaultWidth={600}
				defaultHeight={400}
				minWidth={400}
				minHeight={300}
				initialOffset={windowOffset}
			>
				<div className="prose prose-sm max-w-none">
					<div className="mb-4">
						<span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 capitalize">
							{entity.type}
						</span>
					</div>
					<div className="whitespace-pre-wrap text-sm leading-relaxed">
						{displayContent}
					</div>
				</div>
			</DraggableWindow>
		</>
	);
}