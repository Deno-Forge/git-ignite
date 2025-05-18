import { runShellCommand } from '@anvil/run_shell_command'

/** Get platform-specific open command */
export function getPlatformOpenCommand(platform: string = Deno.build.os): string {
   switch (platform) {
      case 'darwin':
         return 'open'
      case 'windows':
         return 'start'
      default:
         return 'xdg-open'
   }
}

/** @internal */
type PrintGitHubUrlInjects = {
   run?: typeof runShellCommand
   log?: typeof console.log
   getCmd?: typeof getPlatformOpenCommand
}

/** Options for printing a GitHub URL. */
export type PrintGitHubUrlOptions = {
   /** Name of GitHub account owner. Required. */
   owner: string
   /** Name of Repo. Required. */
   repo: string
   /** Description of repo. Defaults to "Deno for the masses!". */
   description?: string
   /** Determines if link should auto open in default browser. Defaults to true. */
   open?: boolean
}

/**
 * Prints a GitHub URL to create a new repository.
 * Optionally opens it in the default browser.
 */
export async function printGitHubUrl(
   { owner, repo, description = 'Deno for the masses!', open = true }: PrintGitHubUrlOptions,
   {
      run = runShellCommand,
      log = console.log,
      getCmd = getPlatformOpenCommand,
   }: PrintGitHubUrlInjects = {},
): Promise<string> {
   const url = `https://github.com/new?owner=${owner}&name=${repo}&description=${
      encodeURIComponent(description)
   }&visibility=public`

   log(`🔗 Create your repo on GitHub: ${url}`)

   if (open) {
      const cmd = getCmd()
      await run({
         cmd: [cmd, url],
         desc: `Open GitHub repo creation URL in default browser`,
      })
   }

   return url
}
