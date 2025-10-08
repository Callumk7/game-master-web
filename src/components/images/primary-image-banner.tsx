import type { Image } from "~/api";
import { SERVER_URL } from "~/routes/__root";

interface PrimaryImageBannerProps {
	image: Image;
}

export function PrimaryImageBanner({ image }: PrimaryImageBannerProps) {
	return (
		<div className="mx-auto max-w-fit overflow-hidden rounded-lg">
			<img
				src={`${SERVER_URL}${image.file_url}`}
				alt={image.alt_text}
				className="max-h-64 w-full object-cover"
			/>
		</div>
	);
}
