import { get } from "svelte/store";
import { THEME_LOCAL_STORAGE_KEY } from "../constants";
import type {
	MaybeError,
	DisplayState,
	Theme,
	DisplayMessageLevel,
	DisplayMessage,
} from "../../types/types";
import BaseStore from "./base";
import { browser } from "$app/environment";

const initialState: DisplayState = {
	theme: "light",
	isAuthModalOpen: false,
	messages: [],
};

class DisplayStore extends BaseStore<DisplayState> {
	constructor() {
		super(initialState);
	}

	public init() {
		let initialTheme = localStorage.getItem(THEME_LOCAL_STORAGE_KEY);
		if (!initialTheme) {
			initialTheme = "light";
		}
		this.setTheme(<Theme>initialTheme);
	}

	public setTheme(nextTheme: Theme) {
		localStorage.setItem(THEME_LOCAL_STORAGE_KEY, nextTheme);
		this.dispatch({ theme: nextTheme });
		if (browser) {
			const toRemove = nextTheme === "dark" ? "light" : "dark";
			document.documentElement.classList.remove(toRemove);
			document.documentElement.classList.add(nextTheme);
		}
	}

	public toggleTheme() {
		const { theme } = get(this.store);
		const nextTheme = theme === "dark" ? "light" : "dark";
		this.setTheme(nextTheme);
	}

	public toggleAuthModal() {
		const { isAuthModalOpen } = get(this.store);
		this.dispatch({ isAuthModalOpen: !isAuthModalOpen });
	}

	public enqueueMessage(msg: string | DisplayMessage, level: DisplayMessageLevel = "success") {
		const { messages } = get(this.store);
		let message: DisplayMessage;
		if (typeof msg === "string") {
			message = {
				message: msg,
				level,
			};
		} else {
			message = msg;
		}

		this.dispatch({ messages: [...messages, message] });
	}

	public dequeueMessage(): MaybeError {
		const { messages } = get(this.store);
		const [err, ...rest] = messages;
		this.dispatch({ messages: rest });
		return err;
	}
}

export const display = new DisplayStore();
