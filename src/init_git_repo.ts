import { GitAlreadyInitializedError, GitError } from './errors.ts'
import { runShellCommand, ShellCommandError } from '@anvil/run_shell_command'
import { createGitIgnore as defaultCreateGitIgnore } from './create_gitignore.ts'
import { exists } from '@std/fs/exists'

/** Options for initGitRepo */
export type InitGitRepoOptions = {
   /** The name of the branch to create. Defaults to 'main'. */
   branchName?: string
   /** Whether to run in dry-run mode. Defaults to false. */
   dryRun?: boolean
   /** Whether to skip committing files. Defaults to false. */
   noCommit?: boolean
}

/** @internal */
type InitGitRepoInjects = {
   run?: typeof runShellCommand
   createGitIgnore?: typeof defaultCreateGitIgnore
   existsFn?: typeof exists
}
/**
 * Initializes a Git repository with a default branch and optional commit.
 *
 * Throws if Git is already initialized or if a shell command fails.
 */
export async function initGitRepo(
   { branchName = 'main', dryRun = false, noCommit = false }: InitGitRepoOptions = {},
   {
      run = runShellCommand,
      createGitIgnore = defaultCreateGitIgnore,
      existsFn = exists,
   }: InitGitRepoInjects = {},
): Promise<void> {
   if (await existsFn('.git')) {
      throw new GitAlreadyInitializedError('Git already initialized. .git directory exists')
   }

   const runOptions = { dryRun }
   try {
      // 1. Init if .git doesn't exist
      await run({ ...runOptions, cmd: ['git', 'init'], desc: 'Initialized Git repository' })

      // 2. Set the initial branch
      await run({
         ...runOptions,
         cmd: ['git', 'branch', '-M', branchName],
         desc: `Set default branch to ${branchName}`,
      })

      // 3. Write .gitignore
      await createGitIgnore({ dryRun })

      // 4. Stage and optionally commit
      await run({ ...runOptions, cmd: ['git', 'add', '.'], desc: 'Staged all files' })
      if (!noCommit) {
         await run({
            ...runOptions,
            cmd: ['git', 'commit', '-m', 'Initial commit via deno-forge'],
            desc: 'Committed files with default message',
         })
      }
   } catch (err) {
      if (err instanceof ShellCommandError) {
         throw new GitError(err.message)
      }
      throw err
   }
}
