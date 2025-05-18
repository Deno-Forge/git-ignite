// deno-lint-ignore-file require-await
import { assertEquals } from "@std/assert";
import {
   spy,
   assertSpyCalls,
   assertSpyCallArgs,
} from "@std/testing/mock";
import {getPlatformOpenCommand, printGitHubUrl} from "./print_github_url.ts";

Deno.test("prints and returns the GitHub repo creation URL", async () => {
   const logSpy = spy();
   // @ts-ignore - partial mock
   const run: typeof runShellCommand = spy(async () => ({ success: true }));
   const url = await printGitHubUrl(
       { owner: "octo", repo: "forge" },
       { log: logSpy, run },
   );

   assertEquals(
       url,
       "https://github.com/new?owner=octo&name=forge&description=Deno%20for%20the%20masses!&visibility=public",
   );
   assertSpyCalls(logSpy, 1);
   assertSpyCallArgs(logSpy, 0, [
      "🔗 Create your repo on GitHub: " + url,
   ]);
});

Deno.test("skips browser open if open: false", async () => {
   const logSpy = spy();
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy();
   const url = await printGitHubUrl(
       { owner: "a", repo: "b", open: false },
       { log: logSpy, run: runSpy },
   );

   assertSpyCalls(runSpy, 0); // no browser open
   assertEquals(url.includes("owner=a"), true);
});

Deno.test("uses injected getCmd to determine open command", async () => {
   // @ts-ignore - partial mock
   const runSpy: runShellCommand = spy(async () => ({ success: true }));
   const getCmd = () => "custom-open";
   const url = await printGitHubUrl(
       { owner: "a", repo: "b" },
       { run: runSpy, getCmd },
   );

   assertSpyCallArgs(runSpy, 0, [
      {
         cmd: ["custom-open", url],
         desc: "Open GitHub repo creation URL in default browser",
      },
   ]);
});

Deno.test("accepts custom description in URL", async () => {
   const logSpy = spy();
   // @ts-ignore - partial mock
   const runSpy: typeof runShellCommand = spy(async () => ({ success: true }));
   const description = "My cool module";
   const url = await printGitHubUrl(
       { owner: "x", repo: "y", description },
       { log: logSpy, run: runSpy },
   );

   assertEquals(
       url.includes(encodeURIComponent(description)),
       true,
   );
});


Deno.test("returns 'open' for darwin", () => {
   assertEquals(getPlatformOpenCommand("darwin"), "open");
});

Deno.test("returns 'start' for windows", () => {
   assertEquals(getPlatformOpenCommand("windows"), "start");
});

Deno.test("returns 'xdg-open' for other platforms", () => {
   assertEquals(getPlatformOpenCommand("linux"), "xdg-open");
   assertEquals(getPlatformOpenCommand("freebsd"), "xdg-open");
   assertEquals(getPlatformOpenCommand("sunos"), "xdg-open");
});

Deno.test("defaults to Deno.build.os if no platform provided", () => {
   const expected = getPlatformOpenCommand(Deno.build.os);
   assertEquals(getPlatformOpenCommand(), expected);
});

