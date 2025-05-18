# @deno-forge/git-ignite

Initializes a Git repository and configures it for GitHub based on your deno.json(c) settings.

## Usage

```bash
deno run --allow-read --allow-write --allow-run jsr:@deno-forge/git-ignite
```

### Options

- `--branch=<name>` – specify a branch name (default: main)
- `--dry-run` – print commands instead of executing them
- `--no-commit` – skip initial commit
- `--open` – open the GitHub repository creation page (default: true)

### Permissions

This CLI requires:

- `--allow-read` - required for parsing the deno.json(c) file
- `--allow-write` - required for writing the .gitignore file
- `--allow-run` - required for running `git` commands via shell


## Advanced Usage

```ts
import { runGitSetup } from "jsr:@deno-forge/git-ignite"

await runGitSetup({
  dryRun: true,
  branchName: "main",
  noCommit: false,
  open: true,
})
```

## 📁 Requirements

- Git must be installed and available in your system path.
- Your project must include a `deno.json` or `deno.jsonc` file with a valid `githubPath` (e.g., `"owner/repo"`).
- Optionally include a `description` field to prefill the GitHub repo creation page.

---

![Deno Forge Principles](https://deno-forge.github.io/Deno-Forge/images/deno-forge-principles.png)

> Learn more about our philosophy in the [Deno Forge Manifest](https://github.com/Deno-Forge/Deno-Forge#-the-deno-forge-manifest).