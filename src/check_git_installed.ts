import { GitError } from './errors.ts'
import { runShellCommand } from '@anvil/run_shell_command'

/** @internal */
type CheckGitInstalledInjects = {
   run?: typeof runShellCommand
}

/**
 * Checks if Git is installed and available in the PATH.
 *
 * @returns `true` if Git is available.
 * @throws {GitError} if Git is not found.
 */
export async function checkGitInstalled(
   { run = runShellCommand }: CheckGitInstalledInjects = {},
): Promise<true> {
   try {
      await run({cmd: ['git', '--version']})
      return true
   } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
         throw new GitError(
            'Git is not installed or not available in your PATH. Please install Git before proceeding.',
         )
      }
      throw err
   }
}
