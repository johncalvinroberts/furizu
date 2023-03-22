import type { MessagePayload, HexEncodedFile, EncrypterState } from "../types/types";
import { encrypt, decrypt, hexEncode, hexDecode } from "./crypto";
import { MESSAGE, STATE, FALLBACK_FILE_NAME } from "./constants";
import { formatCrypString } from "./utils";

// alias self to ctx and give it our newly created type
const ctx: Worker = self as unknown as Worker;

// main class wrapper for the worker
class CryptoWorker {
	encrypt = async (encrypterState: EncrypterState) => {
		try {
			const { files, password = "", hint = "" } = encrypterState;
			const accepted = await Promise.all(files?.map((item) => item.arrayBuffer()) || []);
			const hexEncodedFiles: HexEncodedFile[] = accepted.map((item, index) => ({
				hex: hexEncode(item),
				name: files?.[index].name || FALLBACK_FILE_NAME,
			}));
			// the plaintext is a stringified JSON array of files
			const plaintext = JSON.stringify(hexEncodedFiles);
			const ciphertext = await encrypt(password, plaintext);
			const crypString = formatCrypString(ciphertext, hint);
			const payload = { ciphertext, crypString, state: STATE.DONE };
			ctx.postMessage({ payload, type: MESSAGE.ENCRYPTED });
		} catch (error) {
			const payload = {
				state: STATE.FAILURE,
				error,
			};
			ctx.postMessage({ payload, type: MESSAGE.FAILURE });
		}
	};

	decrypt = async (encrypterState: EncrypterState) => {
		try {
			const { ciphertext = "", password = "" } = encrypterState;
			const plaintext = await decrypt(password, ciphertext);
			const hexEncodedFiles: HexEncodedFile[] = JSON.parse(plaintext);
			const decryptedFiles = hexEncodedFiles.map((item) => {
				const blob = new Blob([hexDecode(item.hex)]);
				return new File([blob], item.name);
			});
			const payload = { decryptedFiles, state: STATE.DONE };
			ctx.postMessage({ payload, type: MESSAGE.DECRYPTED });
		} catch (error) {
			ctx.postMessage({
				state: STATE.FAILURE,
				error,
			});
		}
	};

	handleMessage = (msg: MessageEvent<MessagePayload>) => {
		const { type, payload } = msg.data;
		switch (type) {
			case MESSAGE.ENCRYPT:
				this.encrypt(payload);
				break;
			case MESSAGE.DECRYPT:
				this.decrypt(payload);
				break;
			default:
				throw new Error("Unknown Message Type");
		}
	};
}

// instantiate a worker
const cryptoWorker = new CryptoWorker();
// add listener to the worker global scope
ctx.addEventListener("message", cryptoWorker.handleMessage);
