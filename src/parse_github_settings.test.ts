import { assertEquals, assertRejects } from '@std/assert'
import { parseGithubSettings } from './parse_github_settings.ts'
function mockParseConfig(config: Record<string, unknown> = {}) {
   return {
      parseConfig: async () => {
         return config
      },
   }
}

Deno.test('parseGithubSettings returns null if githubPath is missing', async () => {
   const result = await parseGithubSettings(mockParseConfig({ 'name': 'my-module' }))

   assertEquals(result, null)
})

Deno.test('parseGithubSettings returns GithubSettings object if githubPath is present', async () => {
   const result = await parseGithubSettings(mockParseConfig({
      'githubPath': 'deno-forge/init-git',
      'description': 'My awesome module',
   }))

   assertEquals(result, {
      path: 'deno-forge/init-git',
      owner: 'deno-forge',
      repo: 'init-git',
      description: 'My awesome module',
   })
})

Deno.test('parseGithubSettings handles missing description', async () => {
   const result = await parseGithubSettings(mockParseConfig({
      'githubPath': 'deno-forge/init-git',
   }))

   assertEquals(result, {
      path: 'deno-forge/init-git',
      owner: 'deno-forge',
      repo: 'init-git',
      description: '',
   })
})

Deno.test('parseGithubSettings returns null if config cannot be parsed', async () => {
   const result = await parseGithubSettings({
      parseConfig: async () => {
         throw new Error('bad json')
      },
   })

   assertEquals(result, null)
})
