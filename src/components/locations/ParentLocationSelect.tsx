import type { Location } from "~/api/types.gen";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface ParentLocationSelectProps {
	locations: Location[];
	value?: string;
	onChange: (value: string | undefined) => void;
	currentType?: string;
	disabled?: boolean;
	placeholder?: string;
}

// Location type hierarchy - defines which types can be parents of which
const LOCATION_HIERARCHY = {
	continent: [],
	nation: ["continent"],
	region: ["continent", "nation"],
	city: ["continent", "nation", "region"],
	settlement: ["continent", "nation", "region", "city"],
	building: ["city", "settlement"],
	complex: ["city", "settlement", "building"],
} as const;

type LocationType = keyof typeof LOCATION_HIERARCHY;

function isValidParent(parentType: string, currentType?: string): boolean {
	if (!currentType) return true;
	
	const validParentTypes = LOCATION_HIERARCHY[currentType as LocationType];
	return validParentTypes?.includes(parentType as LocationType) ?? false;
}

function buildLocationHierarchy(locations: Location[]): Map<string, Location[]> {
	const hierarchy = new Map<string, Location[]>();
	
	// Create a map for quick lookup
	const locationMap = new Map(locations.map(loc => [loc.id, loc]));
	
	// Build hierarchy by following parent_id chains
	locations.forEach(location => {
		const path: Location[] = [];
		let current: Location | undefined = location;
		
		// Traverse up the hierarchy to build the full path
		while (current && path.length < 10) { // Prevent infinite loops
			path.unshift(current);
			current = current.parent_id ? locationMap.get(current.parent_id) : undefined;
		}
		
		hierarchy.set(location.id, path);
	});
	
	return hierarchy;
}

function formatLocationLabel(location: Location, hierarchy: Location[]): string {
	if (hierarchy.length <= 1) {
		return location.name;
	}
	
	// Show hierarchy: "Grandparent > Parent > Location"
	const pathNames = hierarchy.slice(0, -1).map(loc => loc.name);
	return `${location.name} (${pathNames.join(" > ")})`;
}

export function ParentLocationSelect({
	locations,
	value,
	onChange,
	currentType,
	disabled = false,
	placeholder = "Select parent location",
}: ParentLocationSelectProps) {
	// Filter locations that can be valid parents
	const validParentLocations = locations.filter(location => 
		isValidParent(location.type, currentType)
	);
	
	// Build hierarchy for display
	const hierarchy = buildLocationHierarchy(locations);
	
	// Sort locations by type hierarchy and then by name
	const typeOrder: Record<string, number> = {
		continent: 1,
		nation: 2,
		region: 3,
		city: 4,
		settlement: 5,
		building: 6,
		complex: 7,
	};
	
	const sortedLocations = validParentLocations.sort((a, b) => {
		const typeComparison = (typeOrder[a.type] || 999) - (typeOrder[b.type] || 999);
		if (typeComparison !== 0) return typeComparison;
		return a.name.localeCompare(b.name);
	});

	const handleValueChange = (selectedValue: string) => {
		if (selectedValue === "none") {
			onChange(undefined);
		} else {
			onChange(selectedValue);
		}
	};

	// Find the selected location to display its name
	const selectedLocation = value ? locations.find(loc => loc.id === value) : null;
	const displayValue = value || "none";
	
	// Get the display name for the selected location
	const getSelectedDisplayName = () => {
		if (!selectedLocation) return undefined;
		const locationHierarchy = hierarchy.get(selectedLocation.id) || [selectedLocation];
		return formatLocationLabel(selectedLocation, locationHierarchy);
	};

	return (
		<Select
			value={displayValue}
			onValueChange={handleValueChange}
			disabled={disabled}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder}>
					{selectedLocation ? (
						<div className="flex items-center gap-2">
							<span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
								{selectedLocation.type}
							</span>
							<span>{getSelectedDisplayName()}</span>
						</div>
					) : displayValue === "none" ? (
						<span className="text-muted-foreground">No parent (top-level location)</span>
					) : null}
				</SelectValue>
			</SelectTrigger>
			<SelectPositioner>
				<SelectContent>
					<SelectItem value="none">
						<span className="text-muted-foreground">No parent (top-level location)</span>
					</SelectItem>
					
					{sortedLocations.map((location) => {
						const locationHierarchy = hierarchy.get(location.id) || [location];
						const label = formatLocationLabel(location, locationHierarchy);
						
						return (
							<SelectItem key={location.id} value={location.id}>
								<div className="flex items-center gap-2">
									<span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
										{location.type}
									</span>
									<span>{label}</span>
								</div>
							</SelectItem>
						);
					})}
					
					{sortedLocations.length === 0 && (
						<SelectItem value="disabled" disabled>
							<span className="text-muted-foreground">
								{currentType 
									? `No valid parent locations for ${currentType}` 
									: "No locations available"
								}
							</span>
						</SelectItem>
					)}
				</SelectContent>
			</SelectPositioner>
		</Select>
	);
}