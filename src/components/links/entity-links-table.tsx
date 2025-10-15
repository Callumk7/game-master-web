import type { ColumnDef } from "@tanstack/react-table";
import { EntityTable } from "../ui/composite/entity-table";

interface EntityLinksTableProps<T> {
	links: T[];
	columns: ColumnDef<T>[];
}

export function EntityLinksTable<T>({ links, columns }: EntityLinksTableProps<T>) {
	return (
		<EntityTable
			columns={columns}
			data={links}
			entityName="link"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
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
