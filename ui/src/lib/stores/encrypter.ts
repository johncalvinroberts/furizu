import { get } from "svelte/store";
import { parseCrypString } from "../utils";
import { CRYP_FILE_EXTENSION, STATE, MESSAGE } from "../constants";
import type { EncrypterState, MessageKey, MessagePayload } from "../../types/types";
import IsomorphicWorker from "../isomorphic-worker";
import BaseStore from "./base";
import { apiClient } from "./api";
import { display } from "./display";

const initialState: EncrypterState = {
	isProcessing: false,
	files: undefined,
	ciphertext: undefined,
	password: undefined,
	hint: undefined,
	state: STATE.INITIAL,
	error: undefined,
	crypString: undefined,
	decryptedFiles: undefined,
	totalFileBytes: undefined,
	isCrypFile: false,
};

class EncrypterStore extends BaseStore<EncrypterState> {
	constructor(
		private worker: Worker = new IsomorphicWorker(new URL("../crypto.worker.ts", import.meta.url), {
			type: "module",
		}),
	) {
		super(initialState);
		this.worker.onmessage = this.handleMessage;
		this.worker.onerror = this.handleWorkerError;
		this.worker.onmessageerror = this.handleWorkerError;
	}

	private handleMessage = (msg: MessageEvent<MessagePayload>) => {
		const { payload } = msg.data;
		this.dispatch(payload);
	};

	private postMessage = (type: MessageKey) => {
		const payload = get(this.store);
		this.worker.postMessage({ type, payload });
	};

	private handleWorkerError = (err: ErrorEvent | MessageEvent) => {
		if (err instanceof ErrorEvent) {
			this.dispatch({
				state: STATE.FAILURE,
				error: err.error,
			});
		}
	};

	public handleFiles = async (files: File[]) => {
		const isCrypFile = files?.[0]?.name?.trim()?.endsWith(CRYP_FILE_EXTENSION);
		console.log({ files });
		if (!isCrypFile) {
			const { files: currentFiles = [] } = get(this.store);
			const nextFiles = [...currentFiles, ...files];
			console.log({ nextFiles });
			const totalFileBytes = files.reduce((memo, current) => {
				return memo + current.size;
			}, 0);
			this.dispatch({ files: nextFiles, state: STATE.SHOULD_ENCRYPT, totalFileBytes, isCrypFile });
		}
		if (isCrypFile) {
			const arrayBuffer = await files?.[0].arrayBuffer();
			const crypString = new TextDecoder().decode(arrayBuffer);
			const { ciphertext, hint } = parseCrypString(crypString);
			this.dispatch({
				ciphertext,
				hint,
				crypString,
				state: STATE.SHOULD_DECRYPT,
				isCrypFile,
				files,
			});
		}
	};

	public handleEncrypt = async (password: string, hint?: string) => {
		const { isAuthenticated } = get(apiClient.store);
		const nextState = isAuthenticated ? STATE.PROCESSING : STATE.SHOULD_AUTHENTICATE;
		this.dispatch({
			password,
			hint,
			state: nextState,
		});
		if (isAuthenticated) {
			this.postMessage(MESSAGE.ENCRYPT);
		}
	};

	public handleDecrypt = async (password: string) => {
		const { isAuthenticated } = get(apiClient.store);
		const nextState = isAuthenticated ? STATE.PROCESSING : STATE.SHOULD_AUTHENTICATE;
		this.dispatch({
			password,
			state: nextState,
		});
		if (isAuthenticated) {
			this.postMessage(MESSAGE.DECRYPT);
		}
	};

	public handleAuthSuccess() {
		const { isCrypFile, password, files, hint } = get(this.store);
		if (isCrypFile && password) {
			this.handleDecrypt(password);
		}

		if (isCrypFile && !password && files) {
			this.handleFiles(files);
		}
		if (isCrypFile && !password && !files) {
			display.enqueueMessage("No password or files. Unable to decrypt.", "error");
		}
		if (!isCrypFile && password) {
			this.handleEncrypt(password, hint);
		}
		if (!isCrypFile && !password && files) {
			this.handleFiles(files);
		}
		if (!isCrypFile && !password && !files) {
			display.enqueueMessage("No password or files. Unable to encrypt.", "error");
		}
	}
}

export const encrypter = new EncrypterStore();
