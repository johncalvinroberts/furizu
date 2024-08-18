import { arrayBufferToBase64String, base64StringToArrayBuffer } from './utils';
export const SYMMETRIC_ENCRYPT_ALGO = 'AES-GCM';
export const ASYMMETRIC_ENCRYPT_ALGO = 'RSA-OAEP';
export const KEY_ALGO = 'PBKDF2';

export type ExportedAsymmetricKeypair = { publicKey: string; privateKey: string };
export type ExportedIV = { iv: Uint8Array; base64: string };

export const getRandomBytes = (size = 16): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(size));
};

export async function generateAsymmetricKeyPair(): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: ASYMMETRIC_ENCRYPT_ALGO,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt'],
  );
  return keyPair;
}

export async function generateSymmetricKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    {
      name: SYMMETRIC_ENCRYPT_ALGO,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  return key;
}

/**
 * Exports a crypto key to a raw array buffer. Good for e.g., encrypting a symmetric key using public key encryption.
 */
export const exportSymmetricKey = (symmetricKey: CryptoKey): Promise<ArrayBuffer> => {
  return crypto.subtle.exportKey('raw', symmetricKey);
};
/**
 * Exports an asymmetric key. Note:
 * * Public key is exported using SPKI - Subject Public Key Info, a standard for encoding public keys.
 * * Private key is exported using PKCS#8 - Public Key Cryptography Standards #8, a standard format for storing private key information, including the key itself and information about the algorithm used to generate it.
 */
export const exportAsymmetricKey = async (
  keyPair: CryptoKeyPair,
): Promise<ExportedAsymmetricKeypair> => {
  const [publicRaw, privateRaw] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);
  const [publicKey, privateKey] = await Promise.all([
    arrayBufferToBase64String(publicRaw),
    arrayBufferToBase64String(privateRaw),
  ]);
  return { publicKey, privateKey };
};

/**
 * Imports a symmetric key, for e.g., importing an encrypted symmetric key into memory
 */
export const importSymmetricKey = async (rawKey: ArrayBuffer): Promise<CryptoKey> => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: SYMMETRIC_ENCRYPT_ALGO,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );

  return cryptoKey;
};

/**
 * Imports an asymmetric keypair, for e.g., pulling public/private keypair from localstorage into memory
 */
export const importAsymmetricKeyPair = async (
  publicKey: string,
  privateKey: string,
): Promise<CryptoKeyPair> => {
  const [publicRaw, privateRaw] = await Promise.all([
    base64StringToArrayBuffer(publicKey),
    base64StringToArrayBuffer(privateKey),
  ]);

  const [publicCryptoKey, privateCryptoKey] = await Promise.all([
    crypto.subtle.importKey(
      'spki',
      publicRaw,
      {
        name: ASYMMETRIC_ENCRYPT_ALGO,
        hash: 'SHA-256',
      },
      true,
      ['encrypt'],
    ),
    crypto.subtle.importKey(
      'pkcs8',
      privateRaw,
      {
        name: ASYMMETRIC_ENCRYPT_ALGO,
        hash: 'SHA-256',
      },
      true,
      ['decrypt'],
    ),
  ]);

  return { publicKey: publicCryptoKey, privateKey: privateCryptoKey };
};

export async function encryptAsymmetricallyWithPublicKey(
  data: BufferSource,
  publicKey: CryptoKey,
  iv: Uint8Array,
) {
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ASYMMETRIC_ENCRYPT_ALGO,
      iv,
    },
    publicKey,
    data,
  );
  return encryptedData;
}

export async function decryptAsymmetricallyWithPublicKey(
  data: BufferSource,
  privateKey: CryptoKey,
  iv: Uint8Array,
) {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: ASYMMETRIC_ENCRYPT_ALGO,
      iv,
    },
    privateKey,
    data,
  );
  return decryptedData;
}

export async function encryptSymmetrically(data: BufferSource, key: CryptoKey, iv: Uint8Array) {
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: SYMMETRIC_ENCRYPT_ALGO,
      iv,
    },
    key,
    data,
  );
  return encryptedData;
}

export async function decryptSymmetrically(data: BufferSource, key: CryptoKey, iv: Uint8Array) {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: SYMMETRIC_ENCRYPT_ALGO,
      iv,
    },
    key,
    data,
  );
  return decryptedData;
}

export function createIv(): ExportedIV {
  const iv = getRandomBytes();
  const base64 = btoa(String.fromCharCode(...iv));
  return { iv, base64 };
}

export function importIv(base64Iv: string): Uint8Array {
  return new Uint8Array(
    atob(base64Iv)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );
}
