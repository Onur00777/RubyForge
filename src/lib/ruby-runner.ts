import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { runCommand } from "./process";
import { runDir, workspaceDir } from "./paths";
import type { StageDef, TestCaseResult } from "./types";

const PRELUDE = `# frozen_string_literal: true
$__stdout = +""
module Kernel
  alias_method :__rf_puts, :puts
  alias_method :__rf_print, :print
  def puts(*args)
    text = args.map { |a| a.nil? ? "nil" : a.to_s }.join("\\n")
    $__stdout << text << "\\n"
    __rf_puts(*args)
  end
  def print(*args)
    text = args.map { |a| a.nil? ? "nil" : a.to_s }.join
    $__stdout << text
    __rf_print(*args)
  end
end

$__results = []
def __expect(name, passed, detail = nil)
  $__results << { "name" => name.to_s, "passed" => !!passed, "detail" => detail }
end
`;

function flushRuby(resultFile: string): string {
  const escaped = resultFile.replace(/\\/g, "/");
  return `
def __rf_flush
  payload = {
    "results" => $__results,
    "passed" => !$__results.empty? && $__results.all? { |r| r["passed"] },
    "stdout" => $__stdout
  }
  File.write(${JSON.stringify(escaped)}, JSON.generate(payload))
end
at_exit { __rf_flush rescue nil }
`;
}

export interface RubyRunOutcome {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  results: TestCaseResult[];
  passed: boolean;
}

export async function executeStep(step: StageDef, code: string): Promise<RubyRunOutcome> {
  await mkdir(runDir(), { recursive: true });
  await mkdir(workspaceDir(), { recursive: true });

  if (step.fixtures) {
    for (const fixture of step.fixtures) {
      const target = path.isAbsolute(fixture.path)
        ? fixture.path
        : path.join(workspaceDir(), fixture.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, fixture.content, "utf8");
    }
  }

  const resultFile = path.join(runDir(), "result.json");
  const harnessFile = path.join(runDir(), "harness.rb");
  const currentFile = path.join(workspaceDir(), "current.rb");

  await writeFile(currentFile, code, "utf8");

  const harness = [
    PRELUDE,
    `require "json"`,
    flushRuby(resultFile),
    "# --- USER CODE ---",
    code,
    "# --- TESTS ---",
    "begin",
    step.testScript,
    "rescue Exception => e",
    `  __expect("Runtime error", false, "#{e.class}: #{e.message}")`,
    "end",
    "__rf_flush",
  ].join("\n");

  await writeFile(harnessFile, harness, "utf8");

  try {
    await writeFile(resultFile, "", "utf8");
  } catch {
    /* ignore */
  }

  const run = await runCommand("ruby", [harnessFile], {
    cwd: workspaceDir(),
    timeoutMs: 8000,
    env: {
      ...process.env,
      RUBYOPT: "-EUTF-8",
      RUBYFORGE_RESULT: resultFile,
    },
  });

  let results: TestCaseResult[] = [];
  let passed = false;

  try {
    const raw = await readFile(resultFile, "utf8");
    if (raw.trim()) {
      const parsed = JSON.parse(raw) as {
        results?: TestCaseResult[];
        passed?: boolean;
      };
      results = parsed.results ?? [];
      passed = Boolean(parsed.passed) && results.length > 0 && results.every((r) => r.passed);
    }
  } catch {
    passed = false;
  }

  if (!results.length && (run.stderr || run.timedOut || run.exitCode !== 0)) {
    results = [
      {
        name: run.timedOut ? "Timed out" : "Ruby interpreter",
        passed: false,
        detail: run.timedOut
          ? "The process did not finish in 8 seconds. Check for infinite loops or a blocking gets."
          : run.stderr || "Syntax error or unexpected exit.",
      },
    ];
  }

  return {
    stdout: run.stdout,
    stderr: run.stderr,
    exitCode: run.exitCode,
    timedOut: run.timedOut,
    results,
    passed,
  };
}
