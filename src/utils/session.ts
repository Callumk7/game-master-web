import { useSession } from "@tanstack/react-start/server";

type Session = {
	user: {
		id: number;
		email: string;
	};
	token: string;
};

export function useAppSession() {
	return useSession<Session>({
		password: "ChangeThisBeforeShippingToProdOrYouWillBeFired",
	});
}
