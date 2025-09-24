import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./server/schema/swagger.json",
	output: "src/api",
	
	plugins: [
		{ 
			name: "@tanstack/react-query",
			queryOptions: true,
			useQuery: true,
		},
	],
});
