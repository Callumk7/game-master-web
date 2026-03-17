import { defineRegistry } from "@json-render/react";
import { cn } from "~/utils/cn";
import { catalog } from "./catalog";

const gapMap: Record<string, string> = {
	none: "gap-0",
	sm: "gap-1",
	md: "gap-4",
	lg: "gap-6",
	xl: "gap-8",
};

const alignMap: Record<string, string> = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
	baseline: "items-baseline",
};

const justifyMap: Record<string, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
};

const paddingMap: Record<string, string> = {
	none: "p-0",
	sm: "p-2",
	md: "p-4",
	lg: "p-6",
	xl: "p-8",
};

const maxWidthMap: Record<string, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
	full: "max-w-full",
};

const backgroundMap: Record<string, string> = {
	none: "",
	muted: "bg-muted",
	card: "bg-card border",
	primary: "bg-primary/10",
	secondary: "bg-secondary",
};

const textVariantMap: Record<string, string> = {
	default: "text-foreground",
	muted: "text-muted-foreground",
	primary: "text-primary",
	secondary: "text-secondary-foreground",
	destructive: "text-destructive",
	success: "text-green-600 dark:text-green-400",
	warning: "text-yellow-600 dark:text-yellow-400",
	info: "text-blue-600 dark:text-blue-400",
};

const textSizeMap: Record<string, string> = {
	xs: "text-xs",
	sm: "text-sm",
	default: "text-base",
	lg: "text-lg",
	xl: "text-xl",
};

const textWeightMap: Record<string, string> = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
};

const badgeVariantStyles: Record<string, string> = {
	default: "bg-primary text-primary-foreground",
	secondary: "bg-secondary text-secondary-foreground",
	destructive: "bg-destructive text-destructive-foreground",
	outline: "border border-input bg-background",
	success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yallow-400",
	info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusColors: Record<string, string> = {
	preparing: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
	ready: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	completed:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const avatarSizeMap: Record<string, string> = {
	sm: "size-6 text-xs",
	default: "size-8 text-sm",
	lg: "size-10 text-base",
	xl: "size-12 text-lg",
};

const progressVariantStyles: Record<string, string> = {
	default: "bg-primary",
	success: "bg-green-500",
	warning: "bg-yellow-500",
	destructive: "bg-red-500",
};

export const { registry } = defineRegistry(catalog, {
	components: {
		// === Layout Components ===
		Stack: ({ props, children }) => (
			<div
				className={cn(
					"flex",
					props.direction === "row" ? "flex-row" : "flex-col",
					gapMap[props.gap ?? "md"],
					alignMap[props.align ?? "stretch"],
					justifyMap[props.justify ?? "start"],
					props.wrap && "flex-wrap",
				)}
			>
				{children}
			</div>
		),

		Grid: ({ props, children }) => {
			const gridCols =
				props.columns && props.columns > 1
					? `grid-cols-${props.columns}`
					: "grid-cols-1";
			return (
				<div className={cn("grid", gridCols, gapMap[props.gap ?? "md"])}>
					{children}
				</div>
			);
		},

		Container: ({ props, children }) => (
			<div
				className={cn(
					paddingMap[props.padding ?? "md"],
					maxWidthMap[props.maxWidth ?? "full"],
					backgroundMap[props.background ?? "none"],
					props.border && "border rounded-lg",
					props.rounded && "rounded-lg",
				)}
			>
				{children}
			</div>
		),

		// === Typography Components ===
		Heading: ({ props }) => {
			const level = props.level ?? "2";
			const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
			const sizeStyles: Record<string, string> = {
				"1": "text-4xl font-bold",
				"2": "text-2xl font-semibold",
				"3": "text-xl font-semibold",
				"4": "text-lg font-medium",
				"5": "text-base font-medium",
				"6": "text-sm font-medium",
			};

			return (
				<HeadingTag className={cn(sizeStyles[level], "tracking-tight")}>
					{props.content}
				</HeadingTag>
			);
		},

		Text: ({ props }) => (
			<p
				className={cn(
					textSizeMap[props.size ?? "default"],
					textVariantMap[props.variant ?? "default"],
					textWeightMap[props.weight ?? "normal"],
				)}
			>
				{props.content}
			</p>
		),

		// === Card Components ===
		Card: ({ props, children }) => (
			<div
				className={cn(
					"rounded-xl border bg-card text-card-foreground shadow-sm",
					props.variant === "outline" && "shadow-none",
					props.variant === "ghost" && "border-0 shadow-none",
					props.variant === "elevated" && "shadow-md",
				)}
			>
				<div className="flex flex-col space-y-1.5 p-6">
					<div className="font-semibold leading-none tracking-tight">
						{props.title}
					</div>
					{props.description && (
						<div className="text-sm text-muted-foreground">
							{props.description}
						</div>
					)}
				</div>
				<div className="p-6 pt-0">{children}</div>
			</div>
		),

		MetricCard: ({ props }) => (
			<div className="rounded-lg border bg-card p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<div className="text-sm font-medium text-muted-foreground">
							{props.label}
						</div>
						<div className="text-3xl font-bold">{props.value}</div>
						{props.change && (
							<div
								className={cn(
									"text-sm",
									props.changeVariant === "positive"
										? "text-green-600 dark:text-green-400"
										: props.changeVariant === "negative"
											? "text-red-600 dark:text-red-400"
											: "text-muted-foreground",
								)}
							>
								{props.change}
							</div>
						)}
					</div>
				</div>
			</div>
		),

		CharacterCard: ({ props }) => (
			<div className="rounded-lg border bg-card p-4 shadow-sm">
				<div className="flex items-start gap-4">
					<div
						className={cn(
							"flex size-12 shrink-0 items-center justify-center rounded-full",
							props.status === "alive"
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								: props.status === "dead"
									? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
									: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
						)}
					>
						{props.name.charAt(0).toUpperCase()}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<div className="font-semibold truncate">{props.name}</div>
							<div
								className={cn(
									"size-2 rounded-full",
									props.status === "alive"
										? "bg-green-500"
										: props.status === "dead"
											? "bg-red-500"
											: "bg-gray-400",
								)}
							/>
						</div>
						{(props.race || props.class || props.level) && (
							<div className="text-sm text-muted-foreground">
								{[
									props.race,
									props.class,
									props.level && `Lvl ${props.level}`,
								]
									.filter(Boolean)
									.join(" • ")}
							</div>
						)}
						{props.tags && props.tags.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-2">
								{props.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		),

		QuestCard: ({ props }) => (
			<div className="rounded-lg border bg-card p-4 shadow-sm">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="font-semibold truncate">{props.title}</div>
						{props.description && (
							<div className="text-sm text-muted-foreground mt-1">
								{props.description}
							</div>
						)}
					</div>
					<span
						className={cn(
							"shrink-0 px-2 py-1 text-xs font-medium rounded-full",
							statusColors[props.status ?? "preparing"],
						)}
					>
						{(props.status ?? "preparing").charAt(0).toUpperCase() +
							(props.status ?? "preparing").slice(1)}
					</span>
				</div>
				{props.objectives && props.objectives.length > 0 && (
					<div className="mt-3 space-y-2">
						{props.objectives.map((obj, i) => (
							<div key={i} className="flex items-center gap-2 text-sm">
								<div
									className={cn(
										"size-4 rounded border flex items-center justify-center",
										obj.completed
											? "bg-primary border-primary text-primary-foreground"
											: "bg-background",
									)}
								>
									{obj.completed && "✓"}
								</div>
								<span
									className={
										obj.completed
											? "text-muted-foreground line-through"
											: ""
									}
								>
									{obj.text}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		),

		// === Data Display Components ===
		Table: ({ props }) => (
			<div className="rounded-lg border overflow-hidden">
				<table className="w-full">
					<thead className="bg-muted/50">
						<tr>
							{props.columns.map((col) => (
								<th
									key={col.key}
									className={cn(
										"px-4 py-2 text-sm font-medium text-left",
										col.align === "center" && "text-center",
										col.align === "right" && "text-right",
									)}
								>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y">
						{props.rows.map((row, i) => (
							<tr
								key={
									(row[props.rowKey ?? "id"] as
										| string
										| number
										| undefined) ?? i
								}
								className="hover:bg-muted/30"
							>
								{props.columns.map((col) => (
									<td
										key={col.key}
										className={cn(
											"px-4 py-2 text-sm",
											col.align === "center" && "text-center",
											col.align === "right" && "text-right",
										)}
									>
										{row[col.key] as string}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		),

		EntityList: ({ props }) => {
			if (props.layout === "grid") {
				return (
					<div className="grid grid-cols-2 gap-3">
						{props.items.map((item) => (
							<div
								key={item.id}
								className="rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center gap-2">
									<div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
										{item.name.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate">
											{item.name}
										</div>
										{item.description && (
											<div className="text-xs text-muted-foreground truncate">
												{item.description}
											</div>
										)}
									</div>
								</div>
								{item.badges && item.badges.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{item.badges.map((badge, j) => (
											<span
												key={j}
												className={cn(
													"px-1.5 py-0.5 text-xs rounded",
													badgeVariantStyles[
														badge.variant ?? "secondary"
													],
												)}
											>
												{badge.text}
											</span>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				);
			}

			return (
				<div className="divide-y rounded-lg border">
					{props.items.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-3 p-3 hover:bg-muted/50"
						>
							<div className="size-10 rounded-full bg-muted flex items-center justify-center font-medium">
								{item.name.charAt(0).toUpperCase()}
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-medium">{item.name}</div>
								{item.description && (
									<div className="text-sm text-muted-foreground truncate">
										{item.description}
									</div>
								)}
							</div>
							{item.badges && item.badges.length > 0 && (
								<div className="flex gap-1">
									{item.badges.map((badge, j) => (
										<span
											key={j}
											className={cn(
												"px-2 py-0.5 text-xs rounded",
												badgeVariantStyles[
													badge.variant ?? "secondary"
												],
											)}
										>
											{badge.text}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			);
		},

		// === Interactive Components ===
		Button: ({ props }) => {
			const variantStyles: Record<string, string> = {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				outline:
					"border bg-background hover:bg-accent hover:text-accent-foreground",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				success: "bg-green-600 text-white hover:bg-green-700",
			};

			const sizeStyles: Record<string, string> = {
				sm: "h-8 px-3 text-xs",
				default: "h-9 px-4 text-sm",
				lg: "h-10 px-6 text-base",
			};

			return (
				<button
					type="button"
					className={cn(
						"inline-flex items-center justify-center gap-2 rounded-md font-medium",
						"transition-colors focus-visible:outline-none focus-visible:ring-1",
						"focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
						variantStyles[props.variant ?? "default"],
						sizeStyles[props.size ?? "default"],
					)}
				>
					{props.label}
				</button>
			);
		},

		ButtonGroup: ({ props }) => {
			const justifyStyles: Record<string, string> = {
				start: "justify-start",
				center: "justify-center",
				end: "justify-end",
				between: "justify-between",
			};

			return (
				<div className={cn("flex gap-2", justifyStyles[props.align ?? "start"])}>
					{props.buttons.map((btn, i) => {
						const variantStyles: Record<string, string> = {
							default:
								"bg-primary text-primary-foreground hover:bg-primary/90",
							secondary:
								"bg-secondary text-secondary-foreground hover:bg-secondary/80",
							outline: "border bg-background hover:bg-accent",
							ghost: "hover:bg-accent",
							destructive:
								"bg-destructive text-white hover:bg-destructive/90",
							success: "bg-green-600 text-white hover:bg-green-700",
						};

						return (
							<button
								key={i}
								type="button"
								className={cn(
									"inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium",
									"transition-colors focus-visible:outline-none focus-visible:ring-1",
									"focus-visible:ring-ring",
									variantStyles[btn.variant ?? "default"],
								)}
							>
								{btn.label}
							</button>
						);
					})}
				</div>
			);
		},

		Badge: ({ props }) => (
			<span
				className={cn(
					"inline-flex items-center rounded-md font-medium",
					props.size === "sm" ? "px-1 py-0.5 text-xs" : "px-2 py-0.5 text-sm",
					badgeVariantStyles[props.variant ?? "default"],
				)}
			>
				{props.label}
			</span>
		),

		BadgeGroup: ({ props }) => (
			<div className={cn("flex gap-1", props.wrap !== false && "flex-wrap")}>
				{props.badges.map((badge, i) => (
					<span
						key={i}
						className={cn(
							"inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium",
							badgeVariantStyles[badge.variant ?? "secondary"],
						)}
					>
						{badge.label}
					</span>
				))}
			</div>
		),

		// === Feedback Components ===
		Alert: ({ props }) => {
			const variantStyles: Record<string, string> = {
				default: "bg-muted border-border",
				destructive:
					"bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
				success:
					"bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
				warning:
					"bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
				info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
			};

			const textStyles: Record<string, string> = {
				default: "",
				destructive: "text-red-800 dark:text-red-200",
				success: "text-green-800 dark:text-green-200",
				warning: "text-yellow-800 dark:text-yellow-200",
				info: "text-blue-800 dark:text-blue-200",
			};

			return (
				<div
					className={cn(
						"rounded-lg border p-4",
						variantStyles[props.variant ?? "default"],
					)}
				>
					<div
						className={cn(
							"font-medium",
							textStyles[props.variant ?? "default"],
						)}
					>
						{props.title}
					</div>
					{props.description && (
						<div
							className={cn(
								"text-sm mt-1",
								textStyles[props.variant ?? "default"],
							)}
						>
							{props.description}
						</div>
					)}
				</div>
			);
		},

		Progress: ({ props }) => (
			<div className="space-y-2">
				{props.label && <div className="text-sm font-medium">{props.label}</div>}
				<div className="relative h-2 rounded-full bg-muted overflow-hidden">
					<div
						className={cn(
							"h-full rounded-full transition-all",
							progressVariantStyles[props.variant ?? "default"],
						)}
						style={{ width: `${Math.min(100, Math.max(0, props.value))}%` }}
					/>
				</div>
				{props.showValue && (
					<div className="text-xs text-muted-foreground text-right">
						{Math.round(props.value)}%
					</div>
				)}
			</div>
		),

		StatBlock: ({ props }) => {
			const gridCols =
				props.columns && props.columns > 1
					? `grid-cols-${props.columns}`
					: "grid-cols-2";

			return (
				<div className="rounded-lg border bg-card p-4">
					{props.title && (
						<div className="font-semibold mb-3">{props.title}</div>
					)}
					<div className={cn("grid gap-3", gridCols)}>
						{props.stats.map((stat, i) => (
							<div key={i} className="flex flex-col">
								<div className="text-xs uppercase text-muted-foreground">
									{stat.name}
								</div>
								<div className="flex items-center gap-1">
									<span className="text-xl font-bold">
										{stat.value}
									</span>
									{stat.modifier && (
										<span className="text-sm text-muted-foreground">
											({stat.modifier})
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			);
		},

		// === Media Components ===
		Avatar: ({ props }) => {
			const initials = props.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();

			return (
				<div
					className={cn(
						"relative shrink-0 rounded-full bg-muted flex items-center justify-center",
						avatarSizeMap[props.size ?? "default"],
					)}
				>
					{props.imageUrl ? (
						<img
							src={props.imageUrl}
							alt={props.name}
							className="rounded-full object-cover size-full"
						/>
					) : (
						<span className="font-medium">{initials}</span>
					)}
				</div>
			);
		},

		AvatarGroup: ({ props }) => {
			const visible = props.avatars.slice(0, props.max ?? 4);
			const remaining = props.avatars.length - visible.length;

			return (
				<div className="flex -space-x-2">
					{visible.map((avatar, i) => (
						<div
							key={i}
							className={cn(
								"relative rounded-full bg-muted flex items-center justify-center",
								"ring-2 ring-background",
								avatarSizeMap[props.size ?? "default"],
							)}
							style={{ zIndex: visible.length - i }}
						>
							{avatar.imageUrl ? (
								<img
									src={avatar.imageUrl}
									alt={avatar.name}
									className="rounded-full object-cover size-full"
								/>
							) : (
								<span className="text-xs font-medium">
									{avatar.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</span>
							)}
						</div>
					))}
					{remaining > 0 && (
						<div
							className={cn(
								"relative rounded-full bg-muted flex items-center justify-center",
								"ring-2 ring-background text-xs font-medium",
								avatarSizeMap[props.size ?? "default"],
							)}
						>
							+{remaining}
						</div>
					)}
				</div>
			);
		},

		Divider: ({ props }) => {
			if (props.label) {
				return (
					<div className="flex items-center gap-4 my-4">
						<div className="flex-1 h-px bg-border" />
						<span className="text-xs text-muted-foreground uppercase">
							{props.label}
						</span>
						<div className="flex-1 h-px bg-border" />
					</div>
				);
			}

			return (
				<div
					className={cn(
						"bg-border",
						props.orientation === "vertical"
							? "w-px h-full min-h-4"
							: "h-px w-full",
					)}
				/>
			);
		},

		// === Input Components ===
		Input: ({ props }) => (
			<div className="flex flex-col gap-1.5">
				{props.label && (
					<label
						htmlFor={props.label}
						className="text-sm font-medium leading-none"
					>
						{props.label}
					</label>
				)}
				<input
					id={props.label}
					type={props.type ?? "text"}
					placeholder={props.placeholder}
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
						"transition-colors placeholder:text-muted-foreground",
						"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
				/>
			</div>
		),

		TextArea: ({ props }) => (
			<div className="flex flex-col gap-1.5">
				{props.label && (
					<label className="text-sm font-medium leading-none">
						{props.label}
					</label>
				)}
				<textarea
					placeholder={props.placeholder}
					rows={props.rows ?? 3}
					className={cn(
						"flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
						"transition-colors placeholder:text-muted-foreground",
						"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
						"disabled:cursor-not-allowed disabled:opacity-50",
					)}
				/>
			</div>
		),

		// === Composite Components ===
		Dashboard: ({ props, children }) => (
			<div className="space-y-6">
				{(props.title || props.description) && (
					<div>
						{props.title && (
							<h2 className="text-2xl font-bold tracking-tight">
								{props.title}
							</h2>
						)}
						{props.description && (
							<p className="text-muted-foreground mt-1">
								{props.description}
							</p>
						)}
					</div>
				)}
				{children}
			</div>
		),

		InfoGrid: ({ props }) => {
			const gridCols =
				props.columns && props.columns > 1
					? `grid-cols-${props.columns}`
					: "grid-cols-2";
			const valueStyles: Record<string, string> = {
				default: "",
				muted: "text-muted-foreground",
				primary: "text-primary",
			};

			return (
				<div className="space-y-3">
					{props.title && <h3 className="font-semibold">{props.title}</h3>}
					<div className={cn("grid gap-3", gridCols)}>
						{props.items.map((item, i) => (
							<div key={i}>
								<div className="text-xs uppercase text-muted-foreground">
									{item.label}
								</div>
								<div
									className={cn(
										"font-medium",
										valueStyles[item.variant ?? "default"],
									)}
								>
									{item.value}
								</div>
							</div>
						))}
					</div>
				</div>
			);
		},

		// === Timeline/History ===
		Timeline: ({ props }) => (
			<div className="space-y-4">
				{props.items.map((item, i) => {
					const dotStyles: Record<string, string> = {
						default: "bg-muted border-border",
						success:
							"bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700",
						warning:
							"bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700",
						destructive:
							"bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700",
						info: "bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700",
					};

					return (
						<div key={i} className="flex gap-3">
							<div className="flex flex-col items-center">
								<div
									className={cn(
										"size-3 rounded-full border-2",
										dotStyles[item.variant ?? "default"],
									)}
								/>
								{i < props.items.length - 1 && (
									<div className="w-0.5 flex-1 bg-border min-h-4" />
								)}
							</div>
							<div className="flex-1 pb-4">
								<div className="flex items-center gap-2">
									<div className="font-medium">{item.title}</div>
									{item.timestamp && (
										<span className="text-xs text-muted-foreground">
											{item.timestamp}
										</span>
									)}
								</div>
								{item.description && (
									<div className="text-sm text-muted-foreground mt-1">
										{item.description}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		),
	},

	actions: {
		click: async (params) => {
			console.log("Action:", params?.action ?? "click", params ?? {});
		},
		navigate: async (params) => {
			console.log("Navigate to:", params?.path);
		},
	},
});
