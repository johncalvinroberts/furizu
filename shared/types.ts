export const JobCommands = [
  "provisional_user_created",
  "signup",
  "file_created",
] as const;

export const FileStates = [
  "created",
  "encrypting",
  "propagating",
  "done",
  "error",
  "propagation_backlogged",
] as const;

export type LocationPointer = {
  providerName: string;
  providerType: "s3like_object_storage" | "opfs";
  key: string;
  bucketName: string;
};
