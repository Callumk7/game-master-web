import * as React from "react";
import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";
import { Slider } from "~/components/ui/slider";
import { Label } from "../ui/label";

interface PrimaryImageBannerProps {
	image: Image;
}

export function PrimaryImageBanner({ image }: PrimaryImageBannerProps) {
	const [positionY, setPositionY] = React.useState([50]);

	const handleSliderChange = (value: number | readonly number[]) => {
		const values = Array.isArray(value) ? value : [value];
		setPositionY(values);
	};

	const id = React.useId();

	return (
		<div className="w-full space-y-3">
			<div className="flex items-center gap-3">
				<Label htmlFor={id}>Position:</Label>
				<div className="flex-1 flex items-center gap-2">
					<span className="text-xs text-gray-500">Top</span>
					<Slider
						id={id}
						value={positionY}
						onValueChange={handleSliderChange}
						min={0}
						max={100}
						className="flex-1"
					/>
					<span className="text-xs text-gray-500">Bottom</span>
				</div>
				<span className="text-xs text-gray-600 min-w-[3rem]">
					{positionY[0]}%
				</span>
			</div>
			<div className="w-full overflow-hidden rounded-lg">
				<img
					src={`${SERVER_URL}${image.file_url}`}
					alt={image.alt_text}
					className="max-h-64 w-full object-cover"
					style={{ objectPosition: `center ${positionY[0]}%` }}
				/>
			</div>
		</div>
	);
}
