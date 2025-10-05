import * as React from "react";

export interface KeyboardShortcutOptions {
	enabled?: boolean;
	preventDefault?: boolean;
	allowInInputs?: boolean;
	scope?: () => boolean;
}

export type ModifierKeys = {
	ctrl?: boolean;
	meta?: boolean;
	alt?: boolean;
	shift?: boolean;
};

export type KeyboardShortcut = {
	key: string;
	modifiers?: ModifierKeys;
	callback: () => void;
	options?: KeyboardShortcutOptions;
};

const getModifierKey = () => {
	const userAgent = navigator.userAgent.toLowerCase();
	return userAgent.includes("mac") ? "meta" : "ctrl";
};

const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
	if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
		return false;
	}

	const modifiers = shortcut.modifiers || {};

	if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) {
		return false;
	}
	if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) {
		return false;
	}
	if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) {
		return false;
	}
	if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) {
		return false;
	}

	return true;
};

const isInputElement = (target: EventTarget | null): boolean => {
	if (!target || !(target instanceof HTMLElement)) return false;

	const tagName = target.tagName.toLowerCase();
	const isInput = ["input", "textarea", "select"].includes(tagName);
	const isContentEditable = target.contentEditable === "true";

	return isInput || isContentEditable;
};

export const useKeyboardShortcut = (shortcuts: KeyboardShortcut[]) => {
	const handleKeyDown = React.useCallback(
		(event: KeyboardEvent) => {
			for (const shortcut of shortcuts) {
				const options = shortcut.options || {};

				if (options.enabled === false) continue;
				if (options.scope && !options.scope()) continue;
				if (!options.allowInInputs && isInputElement(event.target)) continue;
				if (!matchesShortcut(event, shortcut)) continue;

				if (options.preventDefault !== false) {
					event.preventDefault();
				}

				shortcut.callback();
				break;
			}
		},
		[shortcuts],
	);

	React.useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
};

export const createPlatformShortcut = (
	key: string,
	callback: () => void,
	options?: KeyboardShortcutOptions,
): KeyboardShortcut => {
	const modifierKey = getModifierKey();

	return {
		key,
		modifiers: { [modifierKey]: true },
		callback,
		options,
	};
};

export const createPlatformShiftShortcut = (
	key: string,
	callback: () => void,
	options?: KeyboardShortcutOptions,
): KeyboardShortcut => {
	const modifierKey = getModifierKey();

	return {
		key,
		modifiers: { [modifierKey]: true, shift: true },
		callback,
		options,
	};
};

export const usePlatformShortcut = (
	key: string,
	callback: () => void,
	options?: KeyboardShortcutOptions,
) => {
	const shortcut = createPlatformShortcut(key, callback, options);
	useKeyboardShortcut([shortcut]);
};
