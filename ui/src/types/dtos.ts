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
