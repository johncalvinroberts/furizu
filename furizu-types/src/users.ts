export type RegisterResponse = {
  token: {
    token: string;
    abilities: string[];
    type: string;
  };
};

export type LoginResponse = RegisterResponse;
