import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import type { GameParams } from "~/api";
import { createGameMutation, listGamesQueryKey } from "~/api/@tanstack/react-query.gen";
import { parseApiError } from "~/utils/parse-errors";

export function CreateGameForm() {
	const context = useRouteContext({ from: "/_auth/games/" });
	const createGame = useMutation({
		...createGameMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({ queryKey: listGamesQueryKey() });
		},
	});
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			setting: "",
		} satisfies GameParams,
		onSubmit: async ({ value }) => {
			createGame.mutate({ body: { game: value } });
		},
	});

	return (
		<div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* Name field (required) */}
				<form.Field
					name="name"
					validators={{
						onChange: ({ value }) =>
							!value ? "Game name is required" : undefined,
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Game Name{" "}
								<span className="text-red-500 dark:text-red-400">*</span>
							</label>
							<input
								id="name"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Enter game name"
								disabled={createGame.isPending}
								className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
									field.state.meta.errors.length > 0
										? "border-red-500 focus:ring-red-500 focus:border-red-500"
										: "border-gray-300 dark:border-gray-600"
								}`}
							/>
							{field.state.meta.errors.length > 0 && (
								<div className="text-red-500 dark:text-red-400 text-sm">
									{field.state.meta.errors[0]}
								</div>
							)}
						</div>
					)}
				</form.Field>

				{/* Description field (optional) */}
				<form.Field name="description">
					{(field) => (
						<div className="space-y-2">
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Game Description
							</label>
							<textarea
								id="description"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Describe your game..."
								rows={4}
								disabled={createGame.isPending}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
							/>
						</div>
					)}
				</form.Field>

				{/* Setting field (optional) */}
				<form.Field name="setting">
					{(field) => (
						<div className="space-y-2">
							<label
								htmlFor="setting"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Game Setting
							</label>
							<input
								id="setting"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="e.g., Fantasy, Sci-Fi, Modern..."
								disabled={createGame.isPending}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
							/>
						</div>
					)}
				</form.Field>

				{/* Error display */}
				{createGame.error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400 dark:text-red-300"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium">Error</h3>
								<div className="mt-1 text-sm">
									{parseApiError(createGame.error.errors!).message}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Success message */}
				{createGame.isSuccess && (
					<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-green-400 dark:text-green-300"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium">Success</h3>
								<div className="mt-1 text-sm">
									Game created successfully!
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Submit button */}
				<button
					type="submit"
					disabled={createGame.isPending || !form.state.canSubmit}
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
				>
					{createGame.isPending ? (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Creating Game...
						</>
					) : (
						"Create Game"
					)}
				</button>
			</form>
		</div>
	);
}
