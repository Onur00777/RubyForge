import { existsSync } from "node:fs";
import path from "node:path";
import { runCommand } from "./process";
import { journeyRoot } from "./paths";

function gitArgs(args: string[]): { args: string[]; cwd: string } {
  const root = journeyRoot();
  return { args: ["-C", root, ...args], cwd: root };
}

export async function gitStatus() {
  const { args, cwd } = gitArgs(["status", "--porcelain", "-b"]);
  return runCommand("git", args, { cwd, timeoutMs: 8000 });
}

export async function gitInit() {
  const root = journeyRoot();
  if (existsSync(path.join(root, ".git"))) {
    return { ok: true, created: false, stdout: "existing", stderr: "" };
  }
  const init = await runCommand("git", ["init", "-b", "main"], { cwd: root, timeoutMs: 8000 });
  return { ok: init.ok, created: init.ok, stdout: init.stdout, stderr: init.stderr };
}

export async function gitCommit(message: string) {
  const root = journeyRoot();
  await runCommand("git", ["-C", root, "add", "-A"], { cwd: root, timeoutMs: 8000 });
  const commit = await runCommand(
    "git",
    [
      "-C",
      root,
      "-c",
      "user.name=RubyForge",
      "-c",
      "user.email=rubyforge@local",
      "commit",
      "-m",
      message,
    ],
    { cwd: root, timeoutMs: 10000 },
  );
  const empty =
    commit.stderr.includes("nothing to commit") || commit.stdout.includes("nothing to commit");
  return { ...commit, empty };
}

export async function gitSetRemote(url: string) {
  const root = journeyRoot();
  const existing = await runCommand("git", ["-C", root, "remote"], { cwd: root, timeoutMs: 5000 });
  if (existing.stdout.split(/\s+/).includes("origin")) {
    return runCommand("git", ["-C", root, "remote", "set-url", "origin", url], {
      cwd: root,
      timeoutMs: 5000,
    });
  }
  return runCommand("git", ["-C", root, "remote", "add", "origin", url], {
    cwd: root,
    timeoutMs: 5000,
  });
}

export async function gitPush() {
  const root = journeyRoot();
  const branch = await runCommand("git", ["-C", root, "rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: root,
    timeoutMs: 5000,
  });
  const name = branch.stdout.trim() || "main";
  return runCommand("git", ["-C", root, "push", "-u", "origin", name], {
    cwd: root,
    timeoutMs: 30000,
  });
}
