import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
