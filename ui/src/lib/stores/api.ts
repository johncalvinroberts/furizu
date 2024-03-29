import decodeJwt from "jwt-decode";
import { get } from "svelte/store";
import type { APIClientState, HTTPMethod, HTTPRequestBody } from "../../types/types";
import type { RefreshTokenDTO, TryWhoamiChallengeDTO, JWTPayload } from "../../types/dtos";
import HTTPClient from "../http";
import {
	JWT_LOCAL_STORAGE_KEY,
	API_BASE_URL,
	GET,
	POST,
	PUT,
	DELETE,
	PATCH,
	JWT_AUTH_HEADER,
} from "../constants";
import { delay, extractErrorMessageString } from "../utils";
import BaseStore from "./base";
import { display } from "./display";
import { encrypter } from "./encrypter";
import { browser } from "$app/environment";

const MIN_TOKEN_REFRESH_MS = 1000 * 60; // 1 min
const TOKEN_REFRESH_BACKOFF_MS = 700;

const initialState: APIClientState = {
	isRefreshingToken: false,
	token: undefined,
	isAuthenticated: false,
	email: undefined,
	isChallengeSent: false,
	isAuthLoading: false,
};

/**
 * This API client is essentially a wrapper around the HTTPClient,
 * but with stateful handling of auth state.
 * Using the Svelte store to track the state of the jwt.
 */

class APIClientStore extends BaseStore<APIClientState> {
	constructor(private readonly httpClient: HTTPClient = new HTTPClient(API_BASE_URL)) {
		super(initialState);
		let initialToken;
		if (browser) {
			initialToken = localStorage.getItem(JWT_LOCAL_STORAGE_KEY) ?? undefined;
		}
		if (initialToken != null) {
			this.handleToken(initialToken);
		}
	}

	public handleToken(token: string) {
		if (browser) {
			try {
				localStorage.setItem(JWT_LOCAL_STORAGE_KEY, token);
				const isValid = this.checkIsJWTValid(token);
				if (!isValid) throw new Error("Invalid Token");
				const decoded: JWTPayload = decodeJwt(token);
				const { email } = decoded;
				this.dispatch({ token, email, isAuthenticated: true });
			} catch (error) {
				localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
				this.reset();
			}
		}
	}

	public async refreshToken(token: string) {
		try {
			const headers = { [JWT_AUTH_HEADER]: token };
			const res = await this.httpClient.post<RefreshTokenDTO>("api/whoami/refresh", {}, headers);
			this.handleToken(res.jwt);
		} catch (error) {
			display.enqueueMessage(extractErrorMessageString(error), "error");
			this.reset();
			throw error;
		}
	}

	public async startWhoamiChallenge(email: string) {
		try {
			this.dispatch({ isAuthLoading: true });
			await this.post("api/whoami/start", { email });
			this.dispatch({ isChallengeSent: true });
			display.enqueueMessage("Code sent to email");
		} catch (error) {
			display.enqueueMessage(extractErrorMessageString(error), "error");
			throw error;
		} finally {
			this.dispatch({ isAuthLoading: false });
		}
	}

	public async tryWhoamiChallenge(email: string, otp: string) {
		try {
			this.dispatch({ isAuthLoading: true });
			const res = await this.post<TryWhoamiChallengeDTO>("api/whoami/try", { email, otp });
			this.handleToken(res.jwt);
			display.enqueueMessage("Successfully Authenticated");
		} catch (error) {
			display.enqueueMessage(extractErrorMessageString(error), "error");
			throw error;
		} finally {
			this.dispatch({ isAuthLoading: false });
		}
	}

	private async fetch<T>(
		path: string,
		method: HTTPMethod,
		body?: HTTPRequestBody,
		givenHeaders?: Record<string, string>,
	): Promise<T> {
		const { token, isRefreshingToken, isAuthenticated } = get(this.store);
		if (isRefreshingToken) {
			await delay(TOKEN_REFRESH_BACKOFF_MS);
			return this.fetch<T>(path, method, body);
		}
		if (!this.isTokenValid && isAuthenticated && token) {
			await this.refreshToken(token);
		}
		let headers: Record<string, string> = {};
		if (token) {
			headers = { [JWT_AUTH_HEADER]: token, ...givenHeaders };
		}
		return this.httpClient.fetch<T>(path, method, body, headers);
	}

	private get isTokenValid(): boolean {
		const { token } = get(this.store);
		if (!token) return false;
		const isValid = this.checkIsJWTValid(token);
		return isValid;
	}

	private checkIsJWTValid(token: string): boolean {
		const { exp }: JWTPayload = decodeJwt(token);
		const isValid = exp != null && exp * 1000 - Date.now() > MIN_TOKEN_REFRESH_MS;
		return isValid;
	}

	public checkJWTAndEndSessionIfInvalid(): void {
		const { isAuthenticated } = get(this.store);
		if (!this.isTokenValid && isAuthenticated) {
			this.reset();
			display.enqueueMessage("Session has expired. Please authenticate again.", "error");
		}
	}

	public endSession() {
		localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
		this.reset();
		encrypter.reset();
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

export const apiClient = new APIClientStore();
