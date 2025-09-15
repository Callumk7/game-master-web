import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string;
  href?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ title, value, href, Icon }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate({ to: href })}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// TODO: better navigation using tanstack router features and type safety
