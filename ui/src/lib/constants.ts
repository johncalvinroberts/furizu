import type { StateKey, MessageKey } from "../types/types";
import { PUBLIC_API_BASE_URL } from "$env/static/public";

export const ENCRYPT_ALGO = "AES-GCM";
export const KEY_ALGO = "PBKDF2";
export const CRYP_DELIMITER = "@CRYP@";
export const CIPHERTEXT_DELIMITER = "::";
export const CRYP_FILE_EXTENSION = ".cryp";
export const FALLBACK_FILE_NAME = "file";
export const THEME_LOCAL_STORAGE_KEY = "theme";

export const STATE: Record<string, StateKey> = {
	INITIAL: "INITIAL",
	SHOULD_ENCRYPT: "SHOULD_ENCRYPT",
	SHOULD_AUTHENTICATE: "SHOULD_AUTHENTICATE",
	SHOULD_DECRYPT: "SHOULD_DECRYPT",
	PROCESSING: "PROCESSING",
	DONE: "DONE",
	FAILURE: "FAILURE",
};

export const MESSAGE: Record<string, MessageKey> = {
	ENCRYPT: "ENCRYPT",
	DECRYPT: "DECRYPT",
	ENCRYPTED: "ENCRYPTED",
	DECRYPTED: "DECRYPTED",
	FAILURE: "FAILURE",
};

export const JWT_AUTH_HEADER = "x-jwt";
export const JWT_LOCAL_STORAGE_KEY = "furizu-jwt";
export const API_BASE_URL = PUBLIC_API_BASE_URL || "/";
export const IS_PROD = import.meta.env.PROD;

export const GET = "GET";
export const HEAD = "HEAD";
export const POST = "POST";
export const PUT = "PUT";
export const DELETE = "DELETE";
export const PATCH = "PATCH";
