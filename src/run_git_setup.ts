import { parseArgs } from '@std/cli/parse-args'
import { checkGitInstalled as defaultCheckGitInstalled } from './check_git_installed.ts'
import { initGitRepo as defaultInitGitRepo } from './init_git_repo.ts'
import { setRemoteOrigin as defaultSetRemoteOrigin } from './set_remote_origin.ts'
import { printGitHubUrl as defaultPrintGithubUrl } from './print_github_url.ts'
import {GitError} from "./errors.ts";

/** @internal */
type RunGitSetupInjects = {
   checkGitInstalled?: typeof defaultCheckGitInstalled
   initRepoIfNeeded?: typeof defaultInitGitRepo
   setRemoteOrigin?: typeof defaultSetRemoteOrigin
   printGitHubUrl?: typeof defaultPrintGithubUrl
}

/** Options for runGitSetup */
export type RunGitSetupOptions = {
   /** The name of the branch to create. Defaults to 'main'. */
   branchName?: string
   /** GitHub repository path in the form "owner/repo". Required to set remote or print GitHub URL. */
   githubRepo?: string;
   /** Description of repository (pre-filled for GitHub) */
   description?: string;
   /** Whether to run in dry-run mode. Defaults to false. */
   dryRun?: boolean
   /** Whether to skip committing files. Defaults to false. */
   noCommit?: boolean
   /** Whether to open the GitHub URL in the browser. Defaults to true. */
   open?: boolean
}

/** Runs all steps of the git setup process */
export async function runGitSetup(
   {branchName = 'main', dryRun = false, noCommit = false, open = true, githubRepo, description }: RunGitSetupOptions = {},
   {
      checkGitInstalled = defaultCheckGitInstalled,
      initRepoIfNeeded = defaultInitGitRepo,
      setRemoteOrigin = defaultSetRemoteOrigin,
      printGitHubUrl = defaultPrintGithubUrl,
   }: RunGitSetupInjects = {},
): Promise<void> {
   // Step 1: Ensure Git is installed
   await checkGitInstalled()

   // Step 2: Init repo if needed (creates .gitignore)
   await initRepoIfNeeded({ branchName, dryRun, noCommit })

   // Step 3: Set remote origin and print URL
   if (githubRepo) {
      await setRemoteOrigin({ githubPath: githubRepo, dryRun })
      const [owner, repo] = githubRepo.split('/')
      if (!owner || !repo) throw new GitError(`Invalid githubRepo format: "${githubRepo}". Expected "owner/repo".`);
      await printGitHubUrl({
         owner, repo, description,
         open: dryRun ? false : open,
      })
   }
}

/** Parses options for RunGitSetupOptions */
export function parseRunGitSetupOptions(
   denoArgs: typeof Deno.args = Deno.args,
): RunGitSetupOptions {
   const args = parseArgs(denoArgs, {
      boolean: ['dry-run', 'no-commit', 'open'],
      string: ['branch','repo', 'description'],
      default: {
         branch: 'main',
         dryRun: false,
         noCommit: false,
         open: false,
      },
   })

   return {
      branchName: args['branch'],
      dryRun: args['dry-run'],
      noCommit: args['no-commit'],
      open: args['open'],
      githubRepo: args['repo'],
      description: args['description'],
   }
}
