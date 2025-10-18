import { cn } from "~/utils/cn";

interface ContainerProps {
	className?: string;
	children: React.ReactNode;
}

export function Container({ className, children }: ContainerProps) {
	return (
		<div
			className={cn("mt-6 mx-auto max-w-none sm:max-w-11/12 2xl:w-3/4", className)}
		>
			{children}
		</div>
	);
}
