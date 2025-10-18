import { Tabs as TabsPrimitive } from "@base-ui-components/react/tabs";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "~/utils/cn";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
	return (
		<TabsPrimitive.Tab
			data-slot="tabs-trigger"
			className={cn(
				"data-[selected]:bg-background dark:data-[selected]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[selected]:border-input dark:data-[selected]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[selected]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
	return (
		<TabsPrimitive.Panel
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		/>
	);
}

function TabsNav({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			data-slot="tabs-nav"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function TabsNavList({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="tabs-nav-list"
			className={cn(
				"bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
				className,
			)}
			{...props}
		/>
	);
}

interface TabsNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	// Add any additional props you want to pass to the anchor element
}

const TabsNavLinkComponent = React.forwardRef<HTMLAnchorElement, TabsNavLinkProps>(
	({ className, ...props }, ref) => {
		return (
			<a
				ref={ref}
				data-slot="tabs-nav-link"
				className={cn(
					// Base styles
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
					// Active state styles via data-status attribute (applied automatically by TanStack Router)
					"data-[status=active]:bg-background data-[status=active]:dark:text-foreground data-[status=active]:dark:border-input data-[status=active]:dark:bg-input/30 data-[status=active]:shadow-sm",
					className,
				)}
				{...props}
			/>
		);
	},
);

TabsNavLinkComponent.displayName = "TabsNavLinkComponent";

const CreatedTabsNavLink = createLink(TabsNavLinkComponent);

const TabsNavLink: LinkComponent<typeof TabsNavLinkComponent> = (props) => {
	return <CreatedTabsNavLink {...props} />;
};

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsNav, TabsNavList, TabsNavLink };
