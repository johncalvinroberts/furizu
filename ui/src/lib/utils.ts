import type { MaybeError } from "../types/types";
import { CRYP_DELIMITER, CRYP_FILE_EXTENSION } from "./constants";

const MAX_NAME_LENGTH = 100;

export const getEncryptedFilename = (files: File[]) => {
	let concatenatedNames = "";
	const accepted = files || [];
	for (const file of accepted) {
		const name = file.name?.substring(0, file?.name.lastIndexOf("."));
		concatenatedNames = `${concatenatedNames}${concatenatedNames?.length ? "+" : ""}${name}`;
		if (concatenatedNames.length >= MAX_NAME_LENGTH) {
			concatenatedNames = `${concatenatedNames.substring(0, 97)}...`;
			break;
		}
	}
	return `${concatenatedNames}${CRYP_FILE_EXTENSION}`;
};

export const formatCrypString = (ciphertext: string, hint: string) =>
	`${CRYP_DELIMITER}${ciphertext}${CRYP_DELIMITER}${hint}`;

export const parseCrypString = (crypString: string) => {
	const [, ciphertext, hint] = crypString.split(CRYP_DELIMITER);
	return { ciphertext, hint };
};

export const getRandomUnicodeString = (length: number): string => {
	const array = new Uint16Array(length);
	window.crypto.getRandomValues(array);
	let str = "";
	for (let i = 0; i < array.length; i++) {
		str += String.fromCharCode(array[i]);
	}
	return str;
};

export const clone = (obj: unknown) => JSON.parse(JSON.stringify(obj));

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const noop = () => undefined;

export const extractErrorMessageString = (err: MaybeError): string => {
	let msg = "An unknown error occured";
	if (typeof err == "string") msg = err;
	if (err instanceof Error) msg = err.message;
	return msg;
};

export const formatDate = (when: number): string => {
  const date = new Date(when);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Intl.DateTimeFormat('default', options).format(date);
};
