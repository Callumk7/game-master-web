import { Link } from "./ui/link";

interface AuthenticatedLayoutProps {
	user: {
		id: number;
		email: string;
	};
	children: React.ReactNode;
}

export function AuthenticatedLayout({ user, children }: AuthenticatedLayoutProps) {
	return (
		<div className="min-h-screen">
			<header className="bg-card text-card-foreground">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center gap-8">
							<h1 className="text-xl font-semibold">Game Master</h1>
							<Link to="/games/new">Create Game</Link>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm">{user.email}</span>
							<Link to="/logout">Logout</Link>
						</div>
					</div>
				</div>
			</header>
			<main className="py-8">{children}</main>
		</div>
	);
}
