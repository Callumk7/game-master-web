import * as React from "react";
import { Button } from "./button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./dialog";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	entityName?: string;
	entityType?: string;
	isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	entityName,
	entityType = "item",
	isDeleting = false,
}: DeleteConfirmationDialogProps) {
	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Confirm Deletion</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						{entityName ? (
							<>
								<strong>{entityName}</strong>
							</>
						) : (
							`this ${entityType}`
						)}
						? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isDeleting}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
