import type { ApiResponse, HTTPMethod, HTTPRequestBody } from "../types/types";
import { GET, POST, PUT, DELETE, PATCH } from "./constants";

/**
 * Mostly generic wrapper around fetch + HTTP
 * Some non-generic behavior: this wrapper will check for an `error` field on the response, and throw
 * an error even if the response was a 2xx
 */

class HTTPClient {
	constructor(private baseURL: string) {}

	public async fetch<T>(
		path: string,
		method: HTTPMethod,
		body?: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		const headers: Headers = new Headers({
			"content-type": "application/json",
			...givenHeaders,
		});
		const res = await fetch(`${this.baseURL}/${path}`, {
			headers,
			method,
			body: JSON.stringify(body),
		});
		const duplicate = res.clone();
		const json: ApiResponse<T> = await res.json();
		if (!res.ok || json.error) {
			let message = json.error;
			if (!message) {
				message = await duplicate.text();
			}
			throw new Error(message);
		}
		return json.data;
	}

	public get<T>(path: string, givenHeaders?: Record<string, string>): Promise<T> {
		return this.fetch(path, GET, givenHeaders);
	}

	public post<T>(
		path: string,
		body: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		return this.fetch(path, POST, body, givenHeaders);
	}

	public delete<T>(
		path: string,
		body: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		return this.fetch(path, DELETE, body, givenHeaders);
	}

	public patch<T>(
		path: string,
		body: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		return this.fetch(path, PATCH, body, givenHeaders);
	}

	public put<T>(
		path: string,
		body: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		return this.fetch(path, PUT, body, givenHeaders);
	}
}

export default HTTPClient;
