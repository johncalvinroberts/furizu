export type RegisterResponse = {
  id: string;
  token: {
    token: string;
    abilities: string[];
    type: string;
  };
};

export type LoginResponse = RegisterResponse;
