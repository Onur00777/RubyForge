import type { StageDef } from "@/lib/types";

export const PHASE_ONE: StageDef[] = [
  {
    id: 1,
    phase: 1,
    slug: "variables",
    title: "Variables",
    subtitle: "Core syntax · assignment",
    fileName: "stage_01_variables.rb",
    concept:
      "Ruby does not declare variables with a keyword. The moment you assign a value, the name exists. Type travels with the value — you never lock it in.",
    bullets: [
      "Assignment (`=`) is not comparison (`==`).",
      "Names use snake_case: `hero_name`, never `heroName`.",
      "Classes resolve at runtime: `\"Ash\"` is a String, `1` is an Integer.",
    ],
    lore: "The first spark in the forge is a name. Summon the hero; the iron comes later.",
    task: "Bind three locals: the hero's name, their level, and whether the forge is ready.",
    objectives: [
      '`hero_name` must equal `"Ash"`',
      "`hero_level` must be the Integer `1`",
      "`forge_ready` must be `true`",
    ],
    starterCode: `# Stage 01 — Variables
# Bind name, level, and readiness.

hero_name =
hero_level =
forge_ready =
`,
    testScript: `
__expect("hero_name is defined", defined?(hero_name) != nil)
__expect("hero_name == \\"Ash\\"", defined?(hero_name) && hero_name == "Ash", defined?(hero_name) ? hero_name.inspect : "missing")
__expect("hero_level == 1 (Integer)", defined?(hero_level) && hero_level == 1 && hero_level.is_a?(Integer), defined?(hero_level) ? hero_level.inspect : "missing")
__expect("forge_ready == true", defined?(forge_ready) && forge_ready == true, defined?(forge_ready) ? forge_ready.inspect : "missing")
`,
    hints: [
      "Three assignments are enough: `name = value`. Quotes make a String; bare `true` is a boolean.",
      '`hero_name = "Ash"` · `hero_level = 1` · `forge_ready = true`',
    ],
    solution: `hero_name = "Ash"
hero_level = 1
forge_ready = true
`,
    gems: 15,
    xp: 70,
  },
  {
    id: 2,
    phase: 1,
    slug: "strings",
    title: "Strings & Interpolation",
    subtitle: "Core syntax · text",
    fileName: "stage_02_strings.rb",
    concept:
      "Double-quoted strings evaluate `#{...}` interpolation. Single-quoted strings stay literal. This is how a CLI engine stamps names into banners.",
    bullets: [
      '`"Crimson #{forge_title}"` embeds the variable at runtime.',
      "`+` concatenation works; interpolation is the idiomatic path.",
      "Messages such as `upcase`, `downcase`, and `length` are sent to the object.",
    ],
    lore: "A name is not enough. The gate needs a title — written in crimson.",
    task: "Build a welcome banner that interpolates the forge title.",
    objectives: [
      '`forge_title` equals `"RubyForge"`',
      "`welcome` includes both `Crimson Path` and `RubyForge`",
      "`welcome` is a String produced by interpolation",
    ],
    starterCode: `# Stage 02 — String interpolation
# Double quotes + #{...}

forge_title = "RubyForge"
welcome =
`,
    testScript: `
__expect("forge_title == \\"RubyForge\\"", defined?(forge_title) && forge_title == "RubyForge")
__expect("welcome is a String", defined?(welcome) && welcome.is_a?(String))
__expect("welcome includes Crimson Path", defined?(welcome) && welcome.include?("Crimson Path"), defined?(welcome) ? welcome.inspect : "missing")
__expect("welcome includes RubyForge", defined?(welcome) && welcome.include?("RubyForge"), defined?(welcome) ? welcome.inspect : "missing")
`,
    hints: [
      "Use double quotes and `#{forge_title}`. Single quotes will not interpolate.",
      '`welcome = "Crimson Path: #{forge_title}"`',
    ],
    solution: `forge_title = "RubyForge"
welcome = "Crimson Path: #{forge_title}"
`,
    gems: 15,
    xp: 75,
  },
  {
    id: 3,
    phase: 1,
    slug: "symbols",
    title: "Symbols",
    subtitle: "Core syntax · identity",
    fileName: "stage_03_symbols.rb",
    concept:
      "A Symbol (`:idle`) is not a String. Strings are copyable text; symbols are interned labels — hash keys and state machines live on them.",
    bullets: [
      "`:crimson_blade` is a Symbol; `\"crimson_blade\"` is a String.",
      "`symbol != string` even when the characters match.",
      "`to_sym` / `to_s` convert; they do not make values equal.",
    ],
    lore: "Naming the blade is not enough. Catalogue it as `:crimson_blade`.",
    task: "Mark the weapon as a Symbol and prove it is not equal to its String twin.",
    objectives: [
      "`weapon` equals `:crimson_blade` (Symbol)",
      '`label` equals `"crimson_blade"` (String)',
      "`same_identity` stores `weapon == label` (false)",
    ],
    starterCode: `# Stage 03 — Symbols
# :label is identity. "label" is text.

weapon =
label =
same_identity =
`,
    testScript: `
__expect("weapon is a Symbol", defined?(weapon) && weapon.is_a?(Symbol), defined?(weapon) ? "#{weapon.class}: #{weapon.inspect}" : "missing")
__expect("weapon == :crimson_blade", defined?(weapon) && weapon == :crimson_blade)
__expect("label == \\"crimson_blade\\"", defined?(label) && label == "crimson_blade")
__expect("same_identity == false", defined?(same_identity) && same_identity == false, defined?(same_identity) ? same_identity.inspect : "missing")
`,
    hints: [
      "Symbols start with a colon: `:crimson_blade`.",
      "`same_identity = weapon == label` — Ruby will not treat them as equal.",
    ],
    solution: `weapon = :crimson_blade
label = "crimson_blade"
same_identity = weapon == label
`,
    gems: 15,
    xp: 80,
  },
  {
    id: 4,
    phase: 1,
    slug: "arrays",
    title: "Arrays",
    subtitle: "Core syntax · collections",
    fileName: "stage_04_arrays.rb",
    concept:
      "An Array is an ordered list. Indexes start at 0. `<<` appends; `[0]` reads the first crystal. Inventories, parties, and loot tables are Arrays.",
    bullets: [
      '`["ruby_gem", "forgemap", "ember"]` is a three-element list.',
      "`inventory.first` and `inventory[0]` open the same slot.",
      "`length` (or `size`) reports cardinality.",
    ],
    lore: "Clip three tools to the belt: a gem, a map, an ember.",
    task: "Build a three-string `inventory` and extract the first item.",
    objectives: [
      "`inventory` is an Array of length 3",
      'Elements are `"ruby_gem"`, `"forgemap"`, `"ember"` in that order',
      "`first_item` is the first element",
    ],
    starterCode: `# Stage 04 — Arrays
# Ordered inventory. Index 0.

inventory =
first_item =
`,
    testScript: `
__expect("inventory is an Array", defined?(inventory) && inventory.is_a?(Array))
__expect("inventory length is 3", defined?(inventory) && inventory.length == 3, defined?(inventory) ? inventory.inspect : "missing")
__expect("order: ruby_gem, forgemap, ember", defined?(inventory) && inventory == ["ruby_gem", "forgemap", "ember"], defined?(inventory) ? inventory.inspect : "missing")
__expect("first_item is the head", defined?(first_item) && defined?(inventory) && first_item == inventory[0] && first_item == "ruby_gem")
`,
    hints: [
      "Write a bracketed list: `inventory = [\"a\", \"b\", \"c\"]`.",
      "`first_item = inventory[0]` or `inventory.first`.",
    ],
    solution: `inventory = ["ruby_gem", "forgemap", "ember"]
first_item = inventory[0]
`,
    gems: 15,
    xp: 80,
  },
  {
    id: 5,
    phase: 1,
    slug: "hashes",
    title: "Hashes",
    subtitle: "Core syntax · maps",
    fileName: "stage_05_hashes.rb",
    concept:
      "A Hash maps keys to values. Modern Ruby prefers symbol keys: `{ name: \"Ash\", level: 1 }`. Read with `hero[:name]`.",
    bullets: [
      "`{ name: \"Ash\" }` is sugar for `{ :name => \"Ash\" }`.",
      "A missing key returns `nil` — it does not raise.",
      "Hero cards, item stats, and save files are Hashes.",
    ],
    lore: "Name, level, vocation — seal them in a single sigil.",
    task: "Write a symbol-keyed `hero` hash: name, level, job.",
    objectives: [
      "`hero` is a Hash",
      '`hero[:name] == "Ash"`',
      "`hero[:level] == 1` and `hero[:job] == :forgemancer`",
    ],
    starterCode: `# Stage 05 — Hashes
# key: value. Symbol keys are the pulse of Ruby.

hero = {
  # name, level, job
}
`,
    testScript: `
__expect("hero is a Hash", defined?(hero) && hero.is_a?(Hash), defined?(hero) ? hero.class.to_s : "missing")
__expect("hero[:name] == \\"Ash\\"", defined?(hero) && hero[:name] == "Ash", defined?(hero) ? hero.inspect : "missing")
__expect("hero[:level] == 1", defined?(hero) && hero[:level] == 1)
__expect("hero[:job] == :forgemancer", defined?(hero) && hero[:job] == :forgemancer, defined?(hero) ? hero[:job].inspect : "missing")
`,
    hints: [
      "Write `{ name: \"Ash\", level: 1, job: :forgemancer }`.",
      "Do not quote the keys — use the `name:` symbol form.",
    ],
    solution: `hero = {
  name: "Ash",
  level: 1,
  job: :forgemancer
}
`,
    gems: 25,
    xp: 90,
    commitTitle: "feat(stage-05): completed Hashes milestone",
  },
  {
    id: 6,
    phase: 1,
    slug: "methods",
    title: "Methods",
    subtitle: "Core syntax · behavior",
    fileName: "stage_06_methods.rb",
    concept:
      "`def` defines behavior. The last evaluated expression is the return value; `return` is optional. Call with parentheses or Ruby's whitespace style.",
    bullets: [
      "`def forge(item)` ... `end`",
      "The last line is the return value.",
      "`forge(\"ruby\")` and `forge \"ruby\"` are both valid.",
    ],
    lore: "The forge no longer just knows a name. It must act.",
    task: "`banner(name)` must return `\"<name> enters the forge\"`.",
    objectives: [
      "Define a method named `banner`",
      '`banner("Ash")` → `"Ash enters the forge"`',
      '`banner("Ruby")` uses the same template',
    ],
    starterCode: `# Stage 06 — Methods
# def ... end. Last expression returns.

def banner(name)
  # interpolate
end
`,
    testScript: `
__expect("banner method exists", respond_to?(:banner, true) || defined?(banner) == "method")
begin
  __expect("banner(\\"Ash\\")", banner("Ash") == "Ash enters the forge", banner("Ash").inspect)
  __expect("banner(\\"Ruby\\")", banner("Ruby") == "Ruby enters the forge", banner("Ruby").inspect)
rescue NoMethodError => e
  __expect("banner is callable", false, e.message)
end
`,
    hints: [
      'Return `"#{name} enters the forge"` from the method body.',
      "`return` is unnecessary — the last expression is enough.",
    ],
    solution: `def banner(name)
  "#{name} enters the forge"
end
`,
    gems: 15,
    xp: 85,
  },
  {
    id: 7,
    phase: 1,
    slug: "puts-print",
    title: "puts vs print",
    subtitle: "Core syntax · output",
    fileName: "stage_07_puts_print.rb",
    concept:
      "`puts` appends a newline. `print` does not. `p` writes `inspect` for debugging. A terminal RPG breathes through this trio.",
    bullets: [
      '`puts "FORGE"` → `FORGE\\n`',
      '`print "OK"` → `OK` (no line break)',
      "The runner captures stdout; order matters.",
    ],
    lore: "The forge speaks. Sometimes a shout (puts), sometimes a whisper (print).",
    task: 'Call `puts "FORGE"` then `print "OK"`.',
    objectives: [
      "Stdout contains a FORGE line",
      "The same stream then writes OK with no trailing newline",
      "`puts` supplies the break; `print` does not",
    ],
    starterCode: `# Stage 07 — puts vs print
# puts breaks the line. print does not.

`,
    testScript: `
__expect("stdout contains a FORGE line", $__stdout.include?("FORGE\\n") || $__stdout.start_with?("FORGE\\r\\n"), $__stdout.inspect)
__expect("stdout ends with OK (no newline)", $__stdout.gsub("\\r", "").end_with?("OK"), $__stdout.inspect)
__expect("FORGE then OK", $__stdout.gsub("\\r", "").include?("FORGE\\nOK"), $__stdout.inspect)
`,
    hints: [
      "Two lines: puts first, then print. No extra output in between.",
      '`puts "FORGE"` and `print "OK"`',
    ],
    solution: `puts "FORGE"
print "OK"
`,
    gems: 15,
    xp: 70,
  },
  {
    id: 8,
    phase: 1,
    slug: "types",
    title: "Types & nil",
    subtitle: "Core syntax · classes",
    fileName: "stage_08_types.rb",
    concept:
      "Every value is an object. `nil` is the sole instance of NilClass — the object of absence. `true`/`false` are booleans; `10.5` is a Float. `.class` reports identity.",
    bullets: [
      "`100.class` → Integer",
      "`nil` is not an empty string (`\"\"`)",
      "In conditions, only `nil` and `false` are falsy",
    ],
    lore: "Hit points, ratio, empty slot, living spark — four essences, four classes.",
    task: "Bind `hp`, `ratio`, `empty_slot`, and `alive` to the correct types.",
    objectives: [
      "`hp` is Integer `100`",
      "`ratio` is Float `0.75`",
      "`empty_slot` is nil and `alive` is true",
    ],
    starterCode: `# Stage 08 — Types
# Integer, Float, nil, Boolean.

hp =
ratio =
empty_slot =
alive =
`,
    testScript: `
__expect("hp Integer 100", defined?(hp) && hp == 100 && hp.is_a?(Integer))
__expect("ratio Float 0.75", defined?(ratio) && ratio == 0.75 && ratio.is_a?(Float), defined?(ratio) ? "#{ratio.inspect} (#{ratio.class})" : "missing")
__expect("empty_slot is nil", defined?(empty_slot) && empty_slot.nil?)
__expect("alive is true", defined?(alive) && alive == true)
`,
    hints: [
      "A Float needs a decimal: `0.75`. `nil` is a keyword.",
      "`hp = 100` · `ratio = 0.75` · `empty_slot = nil` · `alive = true`",
    ],
    solution: `hp = 100
ratio = 0.75
empty_slot = nil
alive = true
`,
    gems: 15,
    xp: 75,
  },
  {
    id: 9,
    phase: 1,
    slug: "conditionals",
    title: "Conditionals",
    subtitle: "Core syntax · if / unless",
    fileName: "stage_09_conditionals.rb",
    concept:
      "`if` / `elsif` / `else` select a branch. `unless` is inverted `if`. Modifier form (`puts x if ready`) fits one line. Ternary `cond ? a : b` is a sharp knife.",
    bullets: [
      "Compare with `>=`, `==`, `!=`",
      "An `elsif` chain stops at the first true branch",
      "Return values may be Symbols: `:master`",
    ],
    lore: "The forge ranks its smiths. XP decides whether you remain an initiate.",
    task: "`rank(xp)` returns `:initiate`, `:adept`, or `:master` by threshold.",
    objectives: [
      "`xp < 50` → `:initiate`",
      "`50 <= xp < 100` → `:adept`",
      "`xp >= 100` → `:master`",
    ],
    starterCode: `# Stage 09 — Conditionals
# if / elsif / else

def rank(xp)
  # thresholds: 50 and 100
end
`,
    testScript: `
begin
  __expect("rank(0) :initiate", rank(0) == :initiate, rank(0).inspect)
  __expect("rank(49) :initiate", rank(49) == :initiate)
  __expect("rank(50) :adept", rank(50) == :adept, rank(50).inspect)
  __expect("rank(99) :adept", rank(99) == :adept)
  __expect("rank(100) :master", rank(100) == :master, rank(100).inspect)
rescue NoMethodError => e
  __expect("rank is defined", false, e.message)
end
`,
    hints: [
      "Test `xp >= 100` first or 100 will fall into adept.",
      "Return symbols (`:master`), not strings.",
    ],
    solution: `def rank(xp)
  if xp >= 100
    :master
  elsif xp >= 50
    :adept
  else
    :initiate
  end
end
`,
    gems: 18,
    xp: 90,
  },
  {
    id: 10,
    phase: 1,
    slug: "scope",
    title: "Scope",
    subtitle: "Core syntax · visibility",
    fileName: "stage_10_scope.rb",
    concept:
      "Locals live in the scope that created them. A method opens a new scope — an outer `temp` does not leak in. CONSTANTS (`FORGE_NAME`) and `$globals` follow different rules.",
    bullets: [
      "`FORGE_NAME = \"RubyForge\"` is a constant visible in the file",
      "A method-local `n` does not escape",
      "Pass outer data into methods as arguments",
    ],
    lore: "The name is carved into the rafters (a constant). The spark exists only while the hammer falls.",
    task: "Define a constant and a `tag(suffix)` method that uses it.",
    objectives: [
      '`FORGE_NAME` equals `"RubyForge"`',
      '`tag("01")` → `"RubyForge-01"`',
      "Interpolation must read the constant",
    ],
    starterCode: `# Stage 10 — Scope
# Constants outside, locals inside.

FORGE_NAME =

def tag(suffix)
end
`,
    testScript: `
__expect("FORGE_NAME == \\"RubyForge\\"", defined?(FORGE_NAME) && FORGE_NAME == "RubyForge")
begin
  __expect("tag(\\"01\\")", tag("01") == "RubyForge-01", tag("01").inspect)
  __expect("tag(\\"blocks\\")", tag("blocks") == "RubyForge-blocks")
rescue NoMethodError => e
  __expect("tag is defined", false, e.message)
end
`,
    hints: [
      "Constants start with an uppercase letter: `FORGE_NAME = \"RubyForge\"`.",
      'Inside `tag`, return `"#{FORGE_NAME}-#{suffix}"`.',
    ],
    solution: `FORGE_NAME = "RubyForge"

def tag(suffix)
  "#{FORGE_NAME}-#{suffix}"
end
`,
    gems: 25,
    xp: 95,
    commitTitle: "feat(stage-10): completed Ruby Core Syntax milestone",
  },
];
