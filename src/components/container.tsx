import { cn } from "~/utils/cn";

interface ContainerProps {
	className?: string;
	children: React.ReactNode;
}

export function Container({ className, children }: ContainerProps) {
	return (
		<div
			className={cn(
				"mt-6 mx-auto sm:max-w-xl md:max-w-xl lg:max-w-none lg:w-5/6",
				className,
			)}
		>
			{children}
		</div>
	);
}
