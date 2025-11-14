import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Link } from "./ui/link";

interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
	return (
		<Card className="h-full hover:border-primary/50 transition-colors">
			<CardHeader>
				<div className="text-4xl mb-2">{icon}</div>
				<CardTitle className="text-xl">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-sm">{description}</p>
			</CardContent>
		</Card>
	);
}

export function LandingPage() {
	const features = [
		{
			icon: "⚔️",
			title: "Character Management",
			description:
				"Track NPCs, allies, and enemies with detailed profiles. Keep all character information organized and accessible during your sessions.",
		},
		{
			icon: "🗺",
			title: "Quest & Objectives",
			description:
				"Manage storylines, quests, and objectives. Track progress and ensure your narrative stays on course with hierarchical quest organization.",
		},
		{
			icon: "🏰",
			title: "Locations & World Building",
			description:
				"Build and organize your game world with a hierarchical location system. Navigate through cities, dungeons, and regions with ease.",
		},
		{
			icon: "⚜",
			title: "Faction Management",
			description:
				"Track organizations, guilds, and political entities. Manage relationships and dynamics between different groups in your world.",
		},
		{
			icon: "📝",
			title: "Notes System",
			description:
				"Keep all your DM notes organized in one place. Quick access to session notes, plot hooks, and important information.",
		},
		{
			icon: "⚡",
			title: "Initiative Tracker",
			description:
				"Streamline combat management with an intuitive initiative tracker. Keep battles moving smoothly and efficiently.",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
					<div className="text-center">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
							Game Master
						</h1>
						<p className="text-xl sm:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
							Your Ultimate DM Companion
						</p>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							Organize campaigns, track characters, manage quests, and bring
							your tabletop adventures to life with powerful tools designed
							for game masters.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button
								size="lg"
								className="w-full sm:w-auto"
								render={<Link to="/signup" />}
							>
								Get Started
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="w-full sm:w-auto"
								render={<Link to="/login" />}
							>
								Login
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
				<div className="text-center mb-12">
					<h2 className="text-3xl sm:text-4xl font-bold mb-4">
						Everything You Need to Master Your Campaign
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Powerful features designed to help you focus on storytelling while
						we handle the organization.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => (
						<FeatureCard
							key={feature.title}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-card border-y border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-4">
						Ready to Elevate Your Game?
					</h2>
					<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
						Join game masters who are already using Game Master to run better
						campaigns.
					</p>
					<Button size="lg" render={<Link to="/signup" />}>
						Start Your Adventure
					</Button>
				</div>
			</div>

			{/* Footer */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center text-sm text-muted-foreground">
					<p>Game Master - The DM Notebook</p>
				</div>
			</div>
		</div>
	);
}
