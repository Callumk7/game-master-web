import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { EntityTable, type FilterConfig } from "../ui/composite/entity-table";
import type { EntityLink } from "./types";

interface EntityLinksTableProps {
	links: EntityLink[];
	columns: ColumnDef<EntityLink>[];
}

export function EntityLinksTable({ links, columns }: EntityLinksTableProps) {
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const entity of links) {
			if (entity.tags) {
				for (const tag of entity.tags) {
					tagSet.add(tag);
				}
			}
		}
		return Array.from(tagSet).sort();
	}, [links]);

	const filters: FilterConfig[] = React.useMemo(
		() => [
			{ type: "text", columnId: "name", placeholder: "Filter names..." },
			{
				type: "multiselect",
				columnId: "tags",
				placeholder: "Filter tags...",
				options: allTags.map((tag) => ({ value: tag, label: tag })),
			},
		],
		[allTags],
	);

	return (
		<EntityTable
			columns={columns}
			data={links}
			entityName="link"
			filters={filters}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 2,
				type: 0.6,
				description_meta: 2,
			}}
			defaultHidden={["description_meta"]}
			initialSort={[{ id: "name", desc: false }]}
		/>
	);
}
