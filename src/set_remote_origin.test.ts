// deno-lint-ignore-file require-await
import { assertRejects } from "@std/assert";
import {
   spy,
   assertSpyCalls,
   assertSpyCallArgs,
} from "@std/testing/mock";
import { setRemoteOrigin } from "./set_remote_origin.ts";
import { GitError } from "./errors.ts";
import { ShellCommandError } from "@anvil/run_shell_command";


Deno.test("throws if githubPath is missing", async () => {
   // @ts-ignore: testing invalid input
   await assertRejects(
       () => setRemoteOrigin({ githubPath: "" }),
       GitError,
       "Missing githubPath. Cannot set remote origin.",
   );
});

Deno.test("calls runShellCommand with expected args", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));

   await setRemoteOrigin(
       { githubPath: "octocat/hello-world" },
       { run: runSpy },
   );

   assertSpyCalls(runSpy, 1);
   assertSpyCallArgs(runSpy, 0, [{
      cmd: ["git", "remote", "add", "origin", "git@github.com:octocat/hello-world.git"],
      desc: "Set git remote origin to git@github.com:octocat/hello-world.git",
      dryRun: false,
   }]);
});

Deno.test("passes dryRun through to runShellCommand", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));

   await setRemoteOrigin(
       { githubPath: "octocat/hello-world", dryRun: true },
       { run: runSpy },
   );

   assertSpyCallArgs(runSpy, 0, [{
      cmd: ["git", "remote", "add", "origin", "git@github.com:octocat/hello-world.git"],
      desc: "Set git remote origin to git@github.com:octocat/hello-world.git",
      dryRun: true,
   }]);
});

Deno.test("wraps ShellCommandError in GitError", async () => {
   const run = async () => {
      throw new ShellCommandError(["boom"], { code: 1, stdout: "", stderr: "" });
   };

   await assertRejects(
       () => setRemoteOrigin({ githubPath: "fail/project" }, { run }),
       GitError,
       "boom",
   );
});

Deno.test("rethrows unexpected errors", async () => {
   const run = async () => {
      throw new Error("unexpected failure");
   };

   await assertRejects(
       () => setRemoteOrigin({ githubPath: "fail/project" }, { run }),
       Error,
       "unexpected failure",
   );
});
