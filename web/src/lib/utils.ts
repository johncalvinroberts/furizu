import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { dbName } from './electric';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessageString(error: unknown): string {
  // If the error is an instance of the Error class, return its message
  if (error instanceof Error) {
    return error.message;
  }

  // If the error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // If the error is an object that might have a message property, attempt to use that
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // If the error is a plain object, attempt to stringify it
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      // If the error cannot be stringified, fall back to a default message
    }
  }

  // For numbers or boolean types, or if all else fails, return a generic message
  return 'An unknown error occurred.';
}

export function deleteDB() {
  console.log("Deleting DB as schema doesn't match server's");
  const DBDeleteRequest = window.indexedDB.deleteDatabase(dbName);
  DBDeleteRequest.onsuccess = function () {
    console.log('Database deleted successfully');
  };
  // the indexedDB cannot be deleted if the database connection is still open,
  // so we need to reload the page to close any open connections.
  // On reload, the database will be recreated.
  window.location.reload();
}
export const formatFileSize = (
  size: number | bigint,
  format: 'long' | 'short' | 'none',
): string => {
  const unitsLong = [
    'Bytes',
    'Kilobytes',
    'Megabytes',
    'Gigabytes',
    'Terabytes',
    'Petabytes',
    'Exabytes',
    'Zettabytes',
    'Yottabytes',
  ];
  const unitsShort = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  let units;
  if (format === 'long') {
    units = unitsLong;
  } else if (format === 'short') {
    units = unitsShort;
  }

  const bytes: number = typeof size === 'bigint' ? Number(size) : size; // Convert BigInt to number if necessary
  if (bytes === 0) {
    if (format === 'none') return '0';
    return `0 ${format === 'long' ? 'Bytes' : 'B'}`; // Handle the 0 case
  }
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const suffix = format === 'none' ? '' : units?.[i] || '';
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${suffix}`;
};

export const sleep = async (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
};

export const arrayBufferToBase64String = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const base64StringToArrayBuffer = (base64String: string): ArrayBuffer => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export async function fetchByteRange(url: string, start: number, end: number) {
  const response = await fetch(url, {
    headers: {
      Range: `bytes=${start}-${end}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch byte range: ${response.statusText}`);
  }

  const blob = await response.blob();
  return blob;
}
