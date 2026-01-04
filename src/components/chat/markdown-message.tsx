import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "~/utils/cn";

export function MarkdownMessage({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"prose prose-sm dark:prose-invert max-w-none",
				"prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent",
				"prose-code:before:content-none prose-code:after:content-none",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeSanitize]}
				components={{
					h1: ({ className: h1ClassName, ...props }) => (
						<h1
							{...props}
							className={cn(
								"text-2xl font-bold mt-4 mb-2 first:mt-0",
								h1ClassName,
							)}
						/>
					),
					h2: ({ className: h2ClassName, ...props }) => (
						<h2
							{...props}
							className={cn(
								"text-xl font-bold mt-3 mb-2 first:mt-0",
								h2ClassName,
							)}
						/>
					),
					h3: ({ className: h3ClassName, ...props }) => (
						<h3
							{...props}
							className={cn(
								"text-lg font-semibold mt-2 mb-1 first:mt-0",
								h3ClassName,
							)}
						/>
					),
					h4: ({ className: h4ClassName, ...props }) => (
						<h4
							{...props}
							className={cn(
								"text-base font-semibold mt-2 mb-1 first:mt-0",
								h4ClassName,
							)}
						/>
					),
					h5: ({ className: h5ClassName, ...props }) => (
						<h5
							{...props}
							className={cn(
								"text-sm font-semibold mt-2 mb-1 first:mt-0",
								h5ClassName,
							)}
						/>
					),
					h6: ({ className: h6ClassName, ...props }) => (
						<h6
							{...props}
							className={cn(
								"text-sm font-semibold mt-2 mb-1 first:mt-0",
								h6ClassName,
							)}
						/>
					),
					a: ({ className: aClassName, ...props }) => (
						<a
							{...props}
							className={cn(
								"underline underline-offset-4",
								"decoration-muted-foreground hover:decoration-foreground",
								aClassName,
							)}
							target="_blank"
							rel="noreferrer"
						/>
					),
					code: ({ className: codeClassName, children, ...props }) => {
						const isBlock = /\blanguage-/.test(codeClassName ?? "");

						if (!isBlock) {
							return (
								<code
									{...props}
									className={cn(
										"rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]",
										codeClassName,
									)}
								>
									{children}
								</code>
							);
						}

						return (
							<pre className="rounded-md border bg-muted/50 p-3 overflow-x-auto">
								<code
									{...props}
									className={cn("font-mono text-sm", codeClassName)}
								>
									{children}
								</code>
							</pre>
						);
					},
					hr: (props) => <hr {...props} className="my-4 border-muted" />,
					ul: ({ className: ulClassName, ...props }) => (
						<ul {...props} className={cn("my-2", ulClassName)} />
					),
					ol: ({ className: olClassName, ...props }) => (
						<ol {...props} className={cn("my-2", olClassName)} />
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
