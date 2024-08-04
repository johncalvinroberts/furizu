export const JobCommands = [
  "provisional_user_created",
  "signup",
  "file_created",
  "create_download",
] as const;

export const FileStates = [
  "created",
  "encrypting",
  "propagating",
  "done",
  "error",
  "propagation_backlogged",
] as const;

export type FileState = (typeof FileStates)[number];

export const ProviderTypes = ["s3like_object_storage", "opfs"] as const;
