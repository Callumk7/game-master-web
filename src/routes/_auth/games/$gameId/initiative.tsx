import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { useListCharactersQuery } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { FormField } from "~/components/ui/composite/form-field";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Spinner } from "~/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { useInitiativeActions, useInitiativeUnits } from "~/state/initiative";

export const Route = createFileRoute("/_auth/games/$gameId/initiative")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const actions = useInitiativeActions();
	return (
		<Container className="space-y-4">
			<h1 className="text-2xl font-bold">Initiative Tracker</h1>
			<div className="flex gap-2 items-center">
				<SelectCharacterDialog gameId={gameId} />
				<AddUnitDialog />
				<Button onClick={actions.sortUnits}>Sort</Button>
				<Button variant={"destructive"} onClick={actions.clear}>
					Clear
				</Button>
			</div>
			<ClientOnly fallback={<Spinner />}>
				<UnitsTable />
			</ClientOnly>
		</Container>
	);
}

function UnitsTable() {
	const units = useInitiativeUnits();
	const actions = useInitiativeActions();
	return (
		<Table className="border">
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Health</TableHead>
					<TableHead>AC</TableHead>
					<TableHead>Initiative</TableHead>
					<TableHead>Dead</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{units.map((unit) => (
					<TableRow key={unit.id}>
						<TableCell
							className={
								unit.dead ? "text-red-400 line-through" : undefined
							}
						>
							{unit.name}
						</TableCell>
						<TableCell>
							<input
								className="w-20"
								value={unit.health}
								onInput={(e) =>
									actions.setUnitHealth(
										unit.id,
										Number(e.currentTarget.value),
									)
								}
							/>
						</TableCell>
						<TableCell>
							<input
								className="w-20"
								value={unit.ac}
								onInput={(e) =>
									actions.setUnitAC(
										unit.id,
										Number(e.currentTarget.value),
									)
								}
							/>
						</TableCell>
						<TableCell>
							<input
								className="w-20"
								value={unit.initiative}
								onInput={(e) =>
									actions.setUnitInitiative(
										unit.id,
										Number(e.currentTarget.value),
									)
								}
							/>
						</TableCell>
						<TableCell>
							<input
								type="checkbox"
								checked={unit.dead}
								onChange={() => actions.toggleDead(unit.id)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

interface SelectCharacterDialogProps {
	gameId: string;
}
function SelectCharacterDialog({ gameId }: SelectCharacterDialogProps) {
	const { data: characterData } = useListCharactersQuery({
		path: { game_id: gameId },
	});
	const { addUnit } = useInitiativeActions();
	const characters = characterData?.data || [];
	return (
		<Dialog>
			<DialogTrigger render={<Button />}>Add Character</DialogTrigger>
			<DialogContent>
				<div>
					{characters.map((char) => (
						<div key={char.id}>
							<Button
								variant={"ghost"}
								onClick={() =>
									addUnit({
										id: char.id,
										name: char.name,
										health: 10,
										ac: 10,
										initiative: 10,
									})
								}
							>
								{char.name}
							</Button>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

function AddUnitDialog() {
	const [name, setName] = React.useState("");
	const [health, setHealth] = React.useState("");
	const [ac, setAc] = React.useState("");
	const [initiative, setInitiative] = React.useState("");
	const [idNumber, setIdNumber] = React.useState(0);
	const { addUnit } = useInitiativeActions();
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		addUnit({
			id: `${name}-${String(idNumber)}`,
			name,
			health: Number(health),
			ac: Number(ac),
			initiative: Number(initiative),
		});
		setIdNumber(idNumber + 1);
	};
	return (
		<Dialog>
			<DialogTrigger render={<Button />}>Add Custom Unit</DialogTrigger>
			<DialogContent>
				<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
					<FormField
						label="Name"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
					/>
					<FormField
						label="Health"
						value={health}
						onChange={(e) => setHealth(e.currentTarget.value)}
					/>
					<FormField
						label="AC"
						value={ac}
						onChange={(e) => setAc(e.currentTarget.value)}
					/>
					<FormField
						label="Initiative"
						value={initiative}
						onChange={(e) => setInitiative(e.currentTarget.value)}
					/>
					<Button type="submit">Add</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
