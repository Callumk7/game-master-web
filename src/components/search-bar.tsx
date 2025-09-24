import { Search } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface SearchBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	placeholder?: string;
}

export function SearchBar({
	searchQuery,
	onSearchChange,
	placeholder = "Search...",
}: SearchBarProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex flex-col gap-4">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder={placeholder}
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
