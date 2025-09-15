import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/utils/cn";
import { buttonVariants } from "./button";

interface BasicLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof buttonVariants> {}

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
	({ className, variant = "link", size, ...props }, ref) => {
		return (
			<a
				ref={ref}
				{...props}
				className={cn(buttonVariants({ variant, size, className }))}
			/>
		);
	},
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const Link: LinkComponent<typeof BasicLinkComponent> = (props) => {
	return <CreatedLinkComponent preload="intent" {...props} />;
};
