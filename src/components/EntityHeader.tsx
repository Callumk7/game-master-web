import { Plus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface EntityHeaderProps {
  icon: string;
  title: string;
  count: number;
  entityType: string;
  onCreateNew: () => void;
}

export function EntityHeader({ icon, title, count, entityType, onCreateNew }: EntityHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        New {entityType}
      </Button>
    </div>
  );
}