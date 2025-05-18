## 0.1.1 – Forge Automation

- Implemented CI/CD pipeline
- Added missing JSDoc to exported method

## 0.1.0 – First spark

Initial release of `@deno-forge/git-ignite`.

- 🔥 Initializes a local Git repository from a Deno project
- 🧾 Creates a `.gitignore` file with Deno/IDE defaults
- 🪪 Parses `githubPath` and `description` from `deno.json(c)`
- 🌐 Sets the GitHub remote origin
- 🧭 Prints and opens a GitHub repo creation URL
- 🔧 Supports `--dry-run`, `--no-commit`, `--branch`, `--open`
- 🧪 100% test coverage across all modules
- 🛠️ Built with composable functions for use via CLI or API
- 💚 No dependencies on non-Forge modules beyond `@std` and `@anvil`

> This marks the official first strike of the Git tooling suite within the Deno Forge ecosystem.
