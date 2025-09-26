import { SquareArrowDownRight } from "lucide-react";
import * as React from "react";
import DraggableWindow from "~/components/draggable";
import { Button } from "~/components/ui/button";
import type { EntityLink } from "~/utils/linkHelpers";
import { Badge } from "./badge";
import { TiptapViewer } from "./editor/viewer";

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

	return (
		<>
			<Button variant="ghost" onClick={() => setIsOpen(true)}>
				<SquareArrowDownRight className="h-4 w-4" />
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
						<Badge>{entity.type}</Badge>
					</div>
					<TiptapViewer content={entity.content} />
				</div>
			</DraggableWindow>
		</>
	);
}
