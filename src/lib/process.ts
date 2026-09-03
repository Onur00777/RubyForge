import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

export interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

export function runCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    timeoutMs?: number;
    env?: NodeJS.ProcessEnv;
    input?: string;
  } = {},
): Promise<CommandResult> {
  const timeoutMs = options.timeoutMs ?? 10_000;

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const child: ChildProcessWithoutNullStreams = spawn(command, args, {
      cwd: options.cwd,
      windowsHide: true,
      env: options.env ?? process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!settled) child.kill("SIGKILL");
      }, 800);
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > 80_000) stdout = stdout.slice(-80_000);
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
      if (stderr.length > 80_000) stderr = stderr.slice(-80_000);
    });

    if (options.input) {
      child.stdin.write(options.input);
    }
    child.stdin.end();

    const finish = (exitCode: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        ok: !timedOut && exitCode === 0,
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        exitCode,
        timedOut,
      });
    };

    child.on("error", (error) => {
      stderr = stderr ? `${stderr}\n${error.message}` : error.message;
      finish(1);
    });

    child.on("close", (code) => finish(code));
  });
}

export async function commandVersion(bin: string): Promise<{ ok: boolean; version: string; error?: string }> {
  const result = await runCommand(bin, ["-v"], { timeoutMs: 5000 });
  if (!result.ok) {
    return {
      ok: false,
      version: "",
      error:
        result.stderr ||
        result.stdout ||
        `${bin} was not found. Confirm '${bin}' is on PATH.`,
    };
  }
  return { ok: true, version: result.stdout.split("\n")[0]?.trim() ?? "" };
}
