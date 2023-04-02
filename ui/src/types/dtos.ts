import type { BlobItem } from "./types";

export type RefreshTokenDTO = {
	jwt: string;
};

export type TryWhoamiChallengeDTO = {
	jwt: string;
};

export type JWTPayload = {
	exp: number;
	email: string;
};

export type ListBlobsResponseDTO = {
	blobs: BlobItem[];
	count: number;
	balanceBytes: number;
};

export type UploadBlobRequestDTO = {
	crypString: string;
	title: string;
};
