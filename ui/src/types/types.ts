export type StateKey =
	| "INITIAL"
	| "SHOULD_AUTHENTICATE"
	| "SHOULD_ENCRYPT"
	| "SHOULD_DECRYPT"
	| "PROCESSING"
	| "DONE"
	| "FAILURE";

export type MessageKey = "ENCRYPT" | "DECRYPT" | "ENCRYPTED" | "DECRYPTED" | "FAILURE";

export type MessagePayload = {
	type: MessageKey;
	payload: EncrypterState;
};

export type HexEncodedFile = {
	hex: string;
	name: string;
};

export type EncrypterState = {
	isProcessing: boolean;
	files: File[] | undefined;
	ciphertext: string | undefined;
	state: StateKey;
	password: string | undefined;
	hint: string | undefined;
	error: Error | undefined;
	crypString: string | undefined;
	decryptedFiles: File[] | undefined;
	totalFileBytes: number | undefined;
	isCrypFile: boolean;
};

export type APIClientState = {
	isRefreshingToken: boolean;
	token: string | undefined;
	email: string | undefined;
	isAuthenticated: boolean;
	isChallengeSent: boolean;
	isAuthLoading: boolean;
};

export type DisplayMessageLevel = "error" | "info" | "success";
export type DisplayMessage = {
	level: DisplayMessageLevel;
	message: string;
};
export type DisplayState = {
	theme: Theme;
	isAuthModalOpen: boolean;
	messages: DisplayMessage[];
};

export type ApiResponse<T> = {
	success: boolean;
	data: T;
	error: string | undefined;
};

export type HTTPMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH";

export type HTTPRequestBody = Record<string, unknown> | Blob | File;

export type Theme = "dark" | "light";

export type MaybeError = Error | string | unknown;
