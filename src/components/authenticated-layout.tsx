import { Link } from "./ui/link";

interface AuthenticatedLayoutProps {
	user: {
		id: string;
		email: string;
	};
	children: React.ReactNode;
}

export function AuthenticatedLayout({ user, children }: AuthenticatedLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-card text-card-foreground border-b border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center gap-6">
							<Link to="/games" className="text-xl font-semibold hover:text-primary">
								Game Master
							</Link>
							<nav className="flex items-center gap-4 text-sm">
								<Link to="/games/new">Create Game</Link>
								<Link to="/games">Games</Link>
								<Link to="/account">Account</Link>
							</nav>
						</div>
						<div className="flex items-center gap-4 text-sm">
							<span className="text-muted-foreground">{user.email}</span>
							<Link to="/logout" variant="ghost">
								Logout
							</Link>
						</div>
					</div>
				</div>
			</header>
			<main className="flex-1 py-8">{children}</main>
		</div>
	);
}
