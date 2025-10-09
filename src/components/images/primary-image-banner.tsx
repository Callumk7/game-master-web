import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import * as React from "react";
import type { Image } from "~/api";
import {
	getEntityPrimaryImageQueryKey,
	updateEntityImageMutation,
} from "~/api/@tanstack/react-query.gen";
import { Slider } from "~/components/ui/slider";
import { SERVER_URL } from "~/routes/__root";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface PrimaryImageBannerProps {
	image: Image;
	gameId: string;
}

export function PrimaryImageBanner({ image, gameId }: PrimaryImageBannerProps) {
	const [tempPosition, setTempPosition] = React.useState<number | null>(null);

	// Current position: temporary position during dragging, otherwise server data
	const currentPosition = tempPosition ?? image.position_y ?? 50;

	return (
		<ClientOnly>
			<div className="relative w-full space-y-3">
				<PositionControl
					image={image}
					gameId={gameId}
					currentPosition={currentPosition}
					setTempPosition={setTempPosition}
				/>
				<div className="w-full overflow-hidden rounded-lg">
					<img
						src={`${SERVER_URL}${image.file_url}`}
						alt={image.alt_text}
						className="max-h-64 w-full object-cover"
						style={{ objectPosition: `center ${currentPosition}%` }}
					/>
				</div>
			</div>
		</ClientOnly>
	);
}

interface PositionControlProps {
	image: Image;
	gameId: string;
	currentPosition: number;
	setTempPosition: (position: number | null) => void;
}

function PositionControl({
	image,
	gameId,
	currentPosition,
	setTempPosition,
}: PositionControlProps) {
	const queryClient = useQueryClient();
	const [isDebouncing, setIsDebouncing] = React.useState(false);

	const updatePositionMutation = useMutation({
		...updateEntityImageMutation(),
		onMutate: async (variables) => {
			const primaryImageQueryKey = getEntityPrimaryImageQueryKey({
				path: {
					game_id: gameId,
					entity_id: image.entity_id,
					entity_type: image.entity_type,
				},
			});

			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: primaryImageQueryKey });

			// Snapshot the previous value
			const previousData = queryClient.getQueryData(primaryImageQueryKey);

			// Optimistically update to the new value
			queryClient.setQueryData(
				primaryImageQueryKey,
				(old: { data?: Image } | undefined) => ({
					...old,
					data: {
						...old?.data,
						position_y:
							variables.body.image?.position_y ?? old?.data?.position_y,
					} as Image,
				}),
			);

			return { previousData };
		},
		onError: (_err, _variables, context) => {
			// Revert optimistic update on error
			if (context?.previousData) {
				const primaryImageQueryKey = getEntityPrimaryImageQueryKey({
					path: {
						game_id: gameId,
						entity_id: image.entity_id,
						entity_type: image.entity_type,
					},
				});
				queryClient.setQueryData(primaryImageQueryKey, context.previousData);
			}
		},
		// No onSuccess or onSettled - let the optimistic update stand
		// The server will persist the change and future queries will get the correct data
	});

	// Debounced position update
	const debouncedUpdateRef = React.useRef<NodeJS.Timeout | null>(null);

	const handleSliderChange = (value: number | readonly number[]) => {
		const values = Array.isArray(value) ? value : [value];
		const newPosition = values[0];

		// Set temporary position for immediate UI feedback
		setTempPosition(newPosition);
		setIsDebouncing(true);

		// Clear previous timeout
		if (debouncedUpdateRef.current) {
			clearTimeout(debouncedUpdateRef.current);
		}

		// Set new timeout for API call
		debouncedUpdateRef.current = setTimeout(() => {
			updatePositionMutation.mutate({
				path: {
					game_id: gameId,
					entity_type: image.entity_type,
					entity_id: image.entity_id,
					id: image.id,
				},
				body: {
					image: {
						position_y: newPosition,
					},
				},
			});
			setIsDebouncing(false);
			setTempPosition(null); // Clear temp position after save
		}, 500);
	};

	// Cleanup timeout on unmount
	React.useEffect(() => {
		return () => {
			if (debouncedUpdateRef.current) {
				clearTimeout(debouncedUpdateRef.current);
			}
		};
	}, []);

	const id = React.useId();

	return (
		<Popover>
			<PopoverTrigger
				className="absolute top-4 right-4"
				render={<Button size={"sm"} />}
			>
				Set Position
			</PopoverTrigger>
			<PopoverPositioner align="end">
				<PopoverContent className="min-w-lg">
					<div className="flex items-center gap-3">
						<Label htmlFor={id}>Position:</Label>
						<div className="flex-1 flex items-center gap-2">
							<span className="text-xs text-gray-500">Top</span>
							<Slider
								id={id}
								value={[currentPosition]}
								onValueChange={handleSliderChange}
								min={0}
								max={100}
								className="flex-1"
							/>
							<span className="text-xs text-gray-500">Bottom</span>
						</div>
						<div className="flex items-center gap-2 min-w-[5rem]">
							<span className="text-xs text-gray-600">
								{currentPosition}%
							</span>
							{(isDebouncing || updatePositionMutation.isPending) && (
								<span className="text-xs text-blue-500">Saving...</span>
							)}
							{updatePositionMutation.isError && (
								<span className="text-xs text-red-500">Error</span>
							)}
						</div>
					</div>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
