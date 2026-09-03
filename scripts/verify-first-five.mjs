import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

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

const cases = [
  {
    id: 1,
    code: `hero_name = "Ash"\nhero_level = 1\nforge_ready = true\n`,
    tests: `
__expect("hero_name tanımlı", defined?(hero_name) != nil)
__expect("hero_name == \\"Ash\\"", defined?(hero_name) && hero_name == "Ash")
__expect("hero_level == 1 (Integer)", defined?(hero_level) && hero_level == 1 && hero_level.is_a?(Integer))
__expect("forge_ready == true", defined?(forge_ready) && forge_ready == true)
`,
  },
  {
    id: 2,
    code: `forge_title = "RubyForge"\nwelcome = "Crimson Path: #{forge_title}"\n`,
    tests: `
__expect("forge_title", defined?(forge_title) && forge_title == "RubyForge")
__expect("welcome String", defined?(welcome) && welcome.is_a?(String))
__expect("Crimson Path", welcome.include?("Crimson Path"))
__expect("RubyForge", welcome.include?("RubyForge"))
`,
  },
  {
    id: 3,
    code: `weapon = :crimson_blade\nlabel = "crimson_blade"\nsame_identity = weapon == label\n`,
    tests: `
__expect("symbol", weapon.is_a?(Symbol) && weapon == :crimson_blade)
__expect("label", label == "crimson_blade")
__expect("not equal", same_identity == false)
`,
  },
  {
    id: 4,
    code: `inventory = ["ruby_gem", "forgemap", "ember"]\nfirst_item = inventory[0]\n`,
    tests: `
__expect("array", inventory == ["ruby_gem", "forgemap", "ember"])
__expect("first", first_item == "ruby_gem")
`,
  },
  {
    id: 5,
    code: `hero = { name: "Ash", level: 1, job: :forgemancer }\n`,
    tests: `
__expect("hash", hero.is_a?(Hash) && hero[:name] == "Ash" && hero[:level] == 1 && hero[:job] == :forgemancer)
`,
  },
];

const dir = join(tmpdir(), "rubyforge-verify");
mkdirSync(dir, { recursive: true });

let failed = 0;
for (const item of cases) {
  const resultFile = join(dir, `result-${item.id}.json`).replace(/\\/g, "/");
  const harness = join(dir, `harness-${item.id}.rb`);
  const source = [
    PRELUDE,
    `require "json"`,
    `def __rf_flush`,
    `  File.write(${JSON.stringify(resultFile)}, JSON.generate({ "results" => $__results, "passed" => !$__results.empty? && $__results.all? { |r| r["passed"] } }))`,
    `end`,
    `at_exit { __rf_flush rescue nil }`,
    item.code,
    "begin",
    item.tests,
    "rescue Exception => e",
    `  __expect("runtime", false, "#{e.class}: #{e.message}")`,
    "end",
    "__rf_flush",
  ].join("\n");
  writeFileSync(harness, source, "utf8");
  const run = spawnSync("ruby", [harness], { encoding: "utf8", cwd: dir });
  let passed = false;
  try {
    passed = JSON.parse(readFileSync(join(dir, `result-${item.id}.json`), "utf8")).passed;
  } catch {
    passed = false;
  }
  if (!passed) {
    failed += 1;
    console.log(`FAIL step ${item.id}`, run.stdout, run.stderr);
  } else {
    console.log(`PASS step ${item.id}`);
  }
}

rmSync(dir, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
