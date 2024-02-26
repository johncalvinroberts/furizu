import type { BlobItem } from "./types";

export type RawBlobItem = Omit<BlobItem, "publicURL">;

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
	blobs: RawBlobItem[];
	count: number;
};

export type UploadBlobRequestDTO = {
	crypString: string;
	title: string;
};
