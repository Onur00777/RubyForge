import type { StageDef } from "@/lib/types";

export const PHASE_TWO: StageDef[] = [
  {
    id: 11,
    phase: 2,
    slug: "each",
    title: "Enumerable#each",
    subtitle: "The spirit of Ruby · blocks",
    fileName: "stage_11_each.rb",
    concept:
      "`.each` takes a block. `|item|` names the block parameters. `do...end` is multi-line; `{ ... }` is the one-liner. Prefer this rhythm over `for`.",
    bullets: [
      "`[1, 2, 3].each { |n| total += n }`",
      "A block is an anonymous function passed to a method",
      "`each` returns the original array; the work lives in the side effect",
    ],
    lore: "The forge strikes every ingot in turn. The total is born from the rhythm.",
    task: "`sum_gems` totals a numeric array with `.each`.",
    objectives: [
      "`sum_gems([1, 2, 3])` → `6`",
      "`sum_gems([])` → `0`",
      "Summation must use `.each`",
    ],
    starterCode: `# Stage 11 — each
# Block: each { |n| ... }

def sum_gems(values)
  total = 0
  # values.each ...
  total
end
`,
    testScript: `
begin
  __expect("sum_gems([2, 5, 3]) == 10", sum_gems([2, 5, 3]) == 10, sum_gems([2, 5, 3]).inspect)
  __expect("sum_gems([]) == 0", sum_gems([]) == 0)
  __expect("uses each", File.read("current.rb").include?(".each"), ".each block not found")
rescue NoMethodError => e
  __expect("sum_gems is defined", false, e.message)
end
`,
    hints: [
      "`values.each { |n| total += n }` then return `total`.",
      "Skip `for` — this stage is about each.",
    ],
    solution: `def sum_gems(values)
  total = 0
  values.each { |n| total += n }
  total
end
`,
    gems: 18,
    xp: 90,
  },
  {
    id: 12,
    phase: 2,
    slug: "map",
    title: "Enumerable#map",
    subtitle: "The spirit of Ruby · transform",
    fileName: "stage_12_map.rb",
    concept:
      "`map` transforms each element and returns a new array. It does not mutate the source. Damage multipliers, name formats, loot rolls — all map.",
    bullets: [
      "`[1, 2, 3].map { |n| n * 2 }` → `[2, 4, 6]`",
      "`map(&:to_s)` is the symbol-to-proc shortcut",
      "`collect` is an alias of `map`",
    ],
    lore: "Raw ore is not enough. Double every gem's worth.",
    task: "`double_gems` multiplies every number by two.",
    objectives: [
      "`double_gems([1, 4])` → `[2, 8]`",
      "The original array must stay unchanged",
      "Use `.map`",
    ],
    starterCode: `# Stage 12 — map

def double_gems(values)
end
`,
    testScript: `
begin
  __expect("double_gems([1, 4, 10])", double_gems([1, 4, 10]) == [2, 8, 20], double_gems([1, 4, 10]).inspect)
  original = [3]
  double_gems(original)
  __expect("source stays intact", original == [3], original.inspect)
  __expect("uses map", File.read("current.rb").include?(".map"))
rescue NoMethodError => e
  __expect("double_gems is defined", false, e.message)
end
`,
    hints: [
      "`values.map { |n| n * 2 }`",
      "Avoid `map!` — the bang mutates the original.",
    ],
    solution: `def double_gems(values)
  values.map { |n| n * 2 }
end
`,
    gems: 18,
    xp: 90,
  },
  {
    id: 13,
    phase: 2,
    slug: "select",
    title: "select / reject",
    subtitle: "The spirit of Ruby · filter",
    fileName: "stage_13_select.rb",
    concept:
      "`select` (aka `filter`) keeps elements whose block is truthy. `reject` does the inverse. This is how you pull rares from a loot table.",
    bullets: [
      "`[1, 2, 3, 4].select(&:even?)` → `[2, 4]`",
      "`reject` returns the discarded set",
      "The block should produce true/false",
    ],
    lore: "Only crystals of 10 or greater belong in the forge. The rest is dust.",
    task: "`rare_gems` keeps numbers greater than or equal to 10.",
    objectives: [
      "`rare_gems([3, 10, 25, 8])` → `[10, 25]`",
      "Empty input returns an empty array",
      "Use `.select`",
    ],
    starterCode: `# Stage 13 — select

def rare_gems(values)
end
`,
    testScript: `
begin
  __expect("rare_gems filter", rare_gems([3, 10, 25, 8]) == [10, 25], rare_gems([3, 10, 25, 8]).inspect)
  __expect("threshold includes 10", rare_gems([10]) == [10])
  __expect("empty", rare_gems([]) == [])
  __expect("uses select", File.read("current.rb").include?(".select"))
rescue NoMethodError => e
  __expect("rare_gems is defined", false, e.message)
end
`,
    hints: [
      "`values.select { |n| n >= 10 }`",
      "`find_all` works, but this stage requires select.",
    ],
    solution: `def rare_gems(values)
  values.select { |n| n >= 10 }
end
`,
    gems: 18,
    xp: 90,
  },
  {
    id: 14,
    phase: 2,
    slug: "reduce",
    title: "Enumerable Mastery",
    subtitle: ".map, .select & reduce",
    fileName: "stage_14_reduce.rb",
    concept:
      "`reduce` (aka `inject`) carries an accumulator. Products, merged hashes, longest names — one pass folds them down.",
    bullets: [
      "`[1, 2, 3].reduce(0) { |acc, n| acc + n }`",
      "`reduce(1, :*)` is the symbol form",
      "Without an initial value, the first element becomes the accumulator",
    ],
    lore: "Damage multipliers stack. One strike is the product of every crystal.",
    task: "`combo(values)` multiplies the numbers. Empty arrays return `1`.",
    objectives: [
      "`combo([2, 3, 4])` → `24`",
      "`combo([])` → `1`",
      "Use `.reduce` or `.inject`",
    ],
    starterCode: `# Stage 14 — reduce

def combo(values)
end
`,
    testScript: `
begin
  __expect("combo([2, 3, 4]) == 24", combo([2, 3, 4]) == 24, combo([2, 3, 4]).inspect)
  __expect("combo([7]) == 7", combo([7]) == 7)
  __expect("combo([]) == 1", combo([]) == 1)
  __expect("reduce/inject", File.read("current.rb").include?(".reduce") || File.read("current.rb").include?(".inject"))
rescue NoMethodError => e
  __expect("combo is defined", false, e.message)
end
`,
    hints: [
      "`values.reduce(1) { |acc, n| acc * n }`",
      "The initial value `1` is required for the empty array.",
    ],
    solution: `def combo(values)
  values.reduce(1) { |acc, n| acc * n }
end
`,
    gems: 20,
    xp: 95,
  },
  {
    id: 15,
    phase: 2,
    slug: "yield",
    title: "Blocks & yield",
    subtitle: "The spirit of Ruby · invocation",
    fileName: "stage_15_yield.rb",
    concept:
      "Your own method can accept a block. `yield` invokes it. `block_given?` asks whether one was passed. This is Ruby's inner architecture.",
    bullets: [
      "`def around; yield; end`",
      "`yield x` forwards an argument into the block",
      "`{ |n| n * 2 }` is the caller's half of the contract",
    ],
    lore: "The forge does not strike alone. It receives a ritual (the block) and applies it to steel.",
    task: "`temper(n)` yields `n` to the provided block.",
    objectives: [
      "`temper(10) { |x| x + 1 }` → `11`",
      "`temper(3) { |x| x * x }` → `9`",
      "Use `yield`",
    ],
    starterCode: `# Stage 15 — yield

def temper(n)
end
`,
    testScript: `
begin
  __expect("temper +1", temper(10) { |x| x + 1 } == 11)
  __expect("temper square", temper(3) { |x| x * x } == 9)
  __expect("uses yield", File.read("current.rb").include?("yield"))
rescue NoMethodError => e
  __expect("temper is defined", false, e.message)
end
`,
    hints: [
      "The body can be a single word: `yield n`.",
      "You do not write the block — the caller does. You yield.",
    ],
    solution: `def temper(n)
  yield n
end
`,
    gems: 25,
    xp: 100,
    commitTitle: "feat(stage-15): completed yield & blocks milestone",
  },
  {
    id: 16,
    phase: 2,
    slug: "procs",
    title: "Proc",
    subtitle: "The spirit of Ruby · object-block",
    fileName: "stage_16_procs.rb",
    concept:
      "A block is anonymous and single-use. `Proc` turns it into an object you can store, pass, and `.call`. `proc { |x| x * 2 }` or `Proc.new`.",
    bullets: [
      "`doubler = proc { |n| n * 2 }`",
      "`doubler.call(5)` → `10`",
      "A Proc is lenient about arity",
    ],
    lore: "If you will reuse the same spell, pour it into a seal (a Proc).",
    task: "Create `amplifier`, a Proc that multiplies by 3.",
    objectives: [
      "`amplifier` is a Proc",
      "`amplifier.call(4)` → `12`",
      "`amplifier.call(0)` → `0`",
    ],
    starterCode: `# Stage 16 — Proc

amplifier =
`,
    testScript: `
__expect("amplifier is a Proc", defined?(amplifier) && amplifier.is_a?(Proc), defined?(amplifier) ? amplifier.class.to_s : "missing")
begin
  __expect("call(4) == 12", amplifier.call(4) == 12)
  __expect("call(0) == 0", amplifier.call(0) == 0)
rescue StandardError => e
  __expect("amplifier.call", false, e.message)
end
`,
    hints: [
      "`amplifier = proc { |n| n * 3 }`",
      "A lambda is also a Proc, but `proc` is the intended constructor.",
    ],
    solution: `amplifier = proc { |n| n * 3 }
`,
    gems: 18,
    xp: 95,
  },
  {
    id: 17,
    phase: 2,
    slug: "lambdas",
    title: "Lambda",
    subtitle: "The spirit of Ruby · strict call",
    fileName: "stage_17_lambdas.rb",
    concept:
      "`lambda` (or `->`) enforces arity. `return` exits the lambda, not the enclosing method. A Proc's `return` can tear the method open — production code bleeds on that difference.",
    bullets: [
      "`gate = ->(xp) { xp >= 50 }`",
      "`lambda { |xp| xp >= 50 }`",
      "Wrong arity raises ArgumentError",
    ],
    lore: "The gatekeeper does not bargain. Either XP is enough, or it is not.",
    task: "`adept_gate` is a lambda that is true for XP >= 50.",
    objectives: [
      "`adept_gate` is a lambda/Proc",
      "`adept_gate.call(50)` → `true`",
      "`adept_gate.call(49)` → `false`",
    ],
    starterCode: `# Stage 17 — lambda

adept_gate =
`,
    testScript: `
__expect("adept_gate is defined", defined?(adept_gate) && adept_gate.respond_to?(:call))
begin
  __expect("is a lambda", adept_gate.lambda? == true, "use -> or lambda, not proc")
  __expect("call(50)", adept_gate.call(50) == true)
  __expect("call(49)", adept_gate.call(49) == false)
rescue StandardError => e
  __expect("adept_gate.call", false, e.message)
end
`,
    hints: [
      "`adept_gate = ->(xp) { xp >= 50 }`",
      "`proc` will fail this stage — `lambda?` must be true.",
    ],
    solution: `adept_gate = ->(xp) { xp >= 50 }
`,
    gems: 18,
    xp: 100,
  },
  {
    id: 18,
    phase: 2,
    slug: "file-read",
    title: "File.read",
    subtitle: "The spirit of Ruby · IO",
    fileName: "stage_18_file_read.rb",
    concept:
      "`File.read(path)` returns the whole file as a String. `File.foreach` streams line by line. Paths are relative to the working directory. The engine's lore lives on disk.",
    bullets: [
      '`File.read("lore.txt")`',
      "`File.exist?` is your guard",
      "Forward slashes work as separators even on Windows",
    ],
    lore: "A prophecy is carved into the wall. Read it — do not invent it.",
    task: "Read `lore.txt` into `prophecy`.",
    objectives: [
      "`prophecy` is a String",
      "It contains `The crimson path is forged, not found.`",
      "Use `File.read`",
    ],
    starterCode: `# Stage 18 — File.read
# lore.txt is in the working directory.

prophecy =
`,
    testScript: `
__expect("prophecy is a String", defined?(prophecy) && prophecy.is_a?(String))
__expect("prophecy text", defined?(prophecy) && prophecy.include?("The crimson path is forged, not found."), defined?(prophecy) ? prophecy.inspect : "missing")
__expect("File.read API", File.read("current.rb").include?("File.read"))
`,
    hints: [
      '`prophecy = File.read("lore.txt")`',
      "The runner writes the fixture into the workspace. Do not invent a path.",
    ],
    solution: `prophecy = File.read("lore.txt")
`,
    gems: 18,
    xp: 95,
    fixtures: [
      {
        path: "lore.txt",
        content: "The crimson path is forged, not found.\n",
      },
    ],
  },
  {
    id: 19,
    phase: 2,
    slug: "file-write",
    title: "File.write",
    subtitle: "The spirit of Ruby · persistence",
    fileName: "stage_19_file_write.rb",
    concept:
      "`File.write(path, content)` creates or overwrites. `File.open(path, \"a\")` appends. Saves, logs, gemspecs — they all rest on this.",
    bullets: [
      '`File.write("save.txt", "ASH-1")`',
      "`File.write` raises if the directory is missing",
      "Read the file back to verify",
    ],
    lore: "Until the hero's seal hits disk, the journey is a rumor.",
    task: 'Write exactly `ASH-1` to `save.txt`.',
    objectives: [
      "`save.txt` exists after execution",
      "Contents strip to `ASH-1`",
      "Use `File.write` or `File.open`",
    ],
    starterCode: `# Stage 19 — File.write

`,
    testScript: `
written = File.exist?("save.txt")
__expect("save.txt exists", written)
if written
  body = File.read("save.txt")
  __expect("contents are ASH-1", body.strip == "ASH-1", body.inspect)
end
__expect("write API", File.read("current.rb").include?("File.write") || File.read("current.rb").include?("File.open"))
`,
    hints: [
      '`File.write("save.txt", "ASH-1")`',
      "Printing to the terminal does not write a file.",
    ],
    solution: `File.write("save.txt", "ASH-1")
`,
    gems: 18,
    xp: 95,
  },
  {
    id: 20,
    phase: 2,
    slug: "chain",
    title: "Enumerable pipelines",
    subtitle: "The spirit of Ruby · flow",
    fileName: "stage_20_chain.rb",
    concept:
      "Ruby sentences chain: `select.map.reduce`. Each link yields a new collection (or a value). This is the data spine of the Crimson Path engine.",
    bullets: [
      "Filter, transform, and fold in one expression",
      "Intermediate locals are optional",
      "Break the chain across lines when readability demands it",
    ],
    lore: "Take only rare ore (10+), double it, then sum the power.",
    task: "`forge_power(values)` selects 10+, maps *2, then sums.",
    objectives: [
      "`forge_power([4, 10, 11])` → `42`  (20+22)",
      "`forge_power([1, 2])` → `0`",
      "The source should show select and map",
    ],
    starterCode: `# Stage 20 — chaining

def forge_power(values)
end
`,
    testScript: `
begin
  __expect("forge_power([4, 10, 11]) == 42", forge_power([4, 10, 11]) == 42, forge_power([4, 10, 11]).inspect)
  __expect("forge_power([1, 2]) == 0", forge_power([1, 2]) == 0)
  src = File.read("current.rb")
  __expect("select+map", src.include?("select") && src.include?("map"))
rescue NoMethodError => e
  __expect("forge_power is defined", false, e.message)
end
`,
    hints: [
      "`values.select { |n| n >= 10 }.map { |n| n * 2 }.sum` (or reduce)",
      "10 is inclusive.",
    ],
    solution: `def forge_power(values)
  values.select { |n| n >= 10 }.map { |n| n * 2 }.sum
end
`,
    gems: 25,
    xp: 110,
    commitTitle: "feat(stage-20): completed Enumerable & Blocks milestone",
  },
];
