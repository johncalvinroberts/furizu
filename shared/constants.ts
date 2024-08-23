export const PASSWORD_REGEX = new RegExp(
  "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$",
);

export const NEW_USER_DEFAULT_QUOTA_BYTES = 107_374_182_400;
