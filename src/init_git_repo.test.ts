// deno-lint-ignore-file require-await
import { assertEquals, assertRejects } from "@std/assert";
import {
   spy,
   assertSpyCalls,
   assertSpyCallArgs,
} from "@std/testing/mock";
import { initGitRepo } from "./init_git_repo.ts";
import {
   GitAlreadyInitializedError,
   GitError,
} from "./errors.ts";
import { exists } from '@std/fs/exists'
import { ShellCommandError, type runShellCommand } from "@anvil/run_shell_command";

Deno.test("throws if .git directory already exists", async () => {
   // @ts-ignore - partial mock
   const existsFn: typeof exists = async (_: string) => true;

   await assertRejects(
       () => initGitRepo({}, { existsFn }),
       GitAlreadyInitializedError,
       "Git already initialized. .git directory exists",
   );
});

Deno.test("runs full git setup sequence", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));
   const createGitIgnore = spy(async () => {});
   const existsFn = async () => false;

   await initGitRepo(
       { branchName: "dev" },
       { run: runSpy, createGitIgnore, existsFn },
   );

   assertSpyCalls(runSpy, 4);
   assertSpyCallArgs(runSpy, 0, [{
      dryRun: false,
      cmd: ["git", "init"],
      desc: "Initialized Git repository",
   }]);
   assertSpyCallArgs(runSpy, 1, [{
      dryRun: false,
      cmd: ["git", "branch", "-M", "dev"],
      desc: "Set default branch to dev",
   }]);
   assertSpyCallArgs(runSpy, 2, [{
      dryRun: false,
      cmd: ["git", "add", "."],
      desc: "Staged all files",
   }]);
   assertSpyCallArgs(runSpy, 3, [{
      dryRun: false,
      cmd: ["git", "commit", "-m", "Initial commit via deno-forge"],
      desc: "Committed files with default message",
   }]);

   assertSpyCalls(createGitIgnore, 1);
});

Deno.test("skips commit if noCommit is true", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));
   const createGitIgnore = spy(async () => {});
   const existsFn = async () => false;

   await initGitRepo(
       { noCommit: true },
       { run: runSpy, createGitIgnore, existsFn },
   );

   assertSpyCalls(runSpy, 3); // init, branch, add
   assertSpyCalls(createGitIgnore, 1);
});

Deno.test("passes dryRun to run and createGitIgnore", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));
   const createGitIgnore = spy(async () => {});
   const existsFn = async () => false;

   await initGitRepo(
       { dryRun: true },
       { run: runSpy, createGitIgnore, existsFn },
   );

   for (let i = 0; i < runSpy.calls.length; i++) {
      assertEquals(runSpy.calls[i].args[0].dryRun, true);
   }

   assertSpyCallArgs(createGitIgnore, 0, [{ dryRun: true }]);
});

Deno.test("wraps ShellCommandError in GitError", async () => {
   const run = async () => {
      throw new ShellCommandError(["mock shell fail"],{code: 128, stdout: "", stderr: ""});
   };

   await assertRejects(
       () => initGitRepo({}, { run, existsFn: async () => false }),
       GitError,
       "mock shell fail",
   );
});

Deno.test("throws unknown error from runShellCommand", async () => {
   const run = async () => {
      throw new Error('unknown error');
   };

   await assertRejects(
       () => initGitRepo({}, { run, existsFn: async () => false }),
       Error,
       "unknown error",
   );
});

