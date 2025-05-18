/** General errors thrown by methods in this module */
export class GitError extends Error {}
/** Error thrown when attempting to initialize a git repository that already exists */
export class GitAlreadyInitializedError extends Error {}
