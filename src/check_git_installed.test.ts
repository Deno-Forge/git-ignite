// deno-lint-ignore-file require-await
import { assertEquals, assertRejects } from '@std/assert'
import { checkGitInstalled } from './check_git_installed.ts'
import { GitError } from './errors.ts'
import { type runShellCommand } from '@anvil/run_shell_command'
import { assertSpyCallAsync, assertSpyCalls, spy } from '@std/testing/mock'

Deno.test('checkGitInstalled throws helpful error if git is not installed', async () => {
   await assertRejects(
      () =>
         checkGitInstalled({
            run: async () => {
               throw new Deno.errors.NotFound('git not found')
            },
         }),
      GitError,
      'Git is not installed or not available in your PATH. Please install Git before proceeding.',
   )
})

Deno.test('checkGitInstalled throws when unexpected error encountered', async () => {
   await assertRejects(
      () =>
         checkGitInstalled({
            run: async () => {
               throw new Error('unexpected error')
            },
         }),
      Error,
      'unexpected error',
   )
})

Deno.test('checkGitInstalled returns true if git is installed', async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => {
      return { success: true }
   })

   const result = await checkGitInstalled({ run: runSpy })

   assertEquals(result, true)
   assertSpyCalls(runSpy, 1)
   assertSpyCallAsync(runSpy, 0, { args: [{ cmd: ['git', '--version'] }] })
})
