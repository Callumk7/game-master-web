import { useSession } from "@tanstack/react-start/server";

type Session = {
	user: {
		id: number;
		email: string;
	};
	token: string;
};

export function getAppSession() {
	return useSession<Session>({
		password: "ChangeThisBeforeShippingToProdOrYouWillBeFired",
	});
}
