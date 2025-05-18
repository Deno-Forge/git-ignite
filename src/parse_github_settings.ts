import { parseDenoConfig } from '@anvil/parse_deno_config'

export interface GithubSettings {
   path: string
   owner: string
   repo: string
   description?: string
}

/** @internal */
type ParseGithubSettingsInjects = {
   parseConfig?: typeof parseDenoConfig
}

/** Parses the Github settings from deno.json(c) */
export async function parseGithubSettings(
   { parseConfig = parseDenoConfig }: ParseGithubSettingsInjects = {},
): Promise<GithubSettings | null> {
   try {
      const config = await parseConfig()
      const githubPath: string = config.githubPath?.toString() ?? ''
      const description: string = config.description?.toString() ?? ''
      if (!githubPath) {
         return null
      }
      const [owner, repo] = githubPath.split('/')
      return {
         path: githubPath,
         owner,
         repo,
         description,
      }
   } catch (_e) {
      return null
   }
}
