import { GitError } from './errors.ts'
import { runShellCommand, ShellCommandError } from "@anvil/run_shell_command";

/** @internal */
type SetRemoteOriginInjects = {
   run?: typeof runShellCommand
}

/** Options for setRemoteOrigin() */
export type SetRemoteOriginOptions = {
   /** Path to GitHub Repository. (ex. ower/path). Required. */
   githubPath: string
   /** Print the add origin command but do not execute. Defaults to false. */
   dryRun?: boolean
}

/**
 * Adds a remote origin to the local Git repository using the provided GitHub path.
 *
 * Uses SSH (git@github.com:owner/repo.git). Throws if git command fails.
 */
export async function setRemoteOrigin(
   { githubPath, dryRun = false }: SetRemoteOriginOptions,
   { run = runShellCommand }: SetRemoteOriginInjects = {},
): Promise<void> {
   if (!githubPath) {
      throw new GitError('Missing githubPath. Cannot set remote origin.')
   }

   const remoteUrl = `git@github.com:${githubPath}.git`;
   try {
      await run({
         cmd: ["git", "remote", "add", "origin", remoteUrl],
         desc: `Set git remote origin to ${remoteUrl}`,
         dryRun,
      });
   } catch (err) {
      if (err instanceof ShellCommandError) {
         throw new GitError(err.message);
      }
      throw err;
   }
}
