export interface LessonStep {
  title: string;
  body: string;
  code?: string;
}

export const WALKTHROUGHS: Record<number, LessonStep[]> = {
  1: [
    {
      title: "A variable is a nickname",
      body: "No `var`. No type. Write a name, an equals sign, and a value — Ruby creates it on the spot. Try this pattern in your head, then use it on the right.",
      code: 'snack = "pretzel"',
    },
    {
      title: "Text, numbers, true / false",
      body: "Quotes make a String. A bare number is an Integer. `true` and `false` are special words — not `\"true\"`. Names use snake_case: `hero_name`, never `heroName`.",
      code: 'pet = "Ember"\nlives = 9\nsleepy = true',
    },
    {
      title: "Now you type it",
      body: "On the right, finish `hero_name`, `hero_level`, and `forge_ready`. The checklist below tells you the values. Copy-paste is for later — this one is yours.",
    },
  ],
  2: [
    {
      title: "Why interpolation exists",
      body: "A banner is not a frozen slogan. It is a template that must stamp a live value — the forge title — into a sentence at runtime. Ruby's idiomatic way is double-quoted interpolation: the `#{...}` pocket is evaluated, then spliced into the surrounding text. Concatenation with `+` works, but it is noisier and easy to miss a space.",
    },
    {
      title: "Double quotes vs single quotes",
      body: "Double quotes are a tiny program: they run interpolation and escape sequences (`\\n`). Single quotes are a photograph of the characters you typed. If you write `'Crimson Path: #{forge_title}'`, the banner will contain the literal characters `#{forge_title}` and the tests will fail.",
      code: 'forge_title = "RubyForge"\n"Crimson Path: #{forge_title}"  # => "Crimson Path: RubyForge"\n\'Crimson Path: #{forge_title}\'  # => "Crimson Path: #{forge_title}"',
    },
    {
      title: "What the editor already gave you",
      body: "`forge_title` is already bound. Your job is `welcome`. Build a String that contains the words `Crimson Path` and also contains whatever `forge_title` currently holds. The tests do not require a specific punctuation — they only `include?` those two fragments — but a readable banner is the point of the stage.",
      code: 'welcome = "Crimson Path: #{forge_title}"',
    },
    {
      title: "How the suite will judge you",
      body: "`welcome` must be a String. It must include `Crimson Path` and `RubyForge`. If `welcome` is still `nil` (the blank assignment), Ruby will raise `NoMethodError: undefined method 'include?' for nil` — that is the suite asking a missing object if it contains text. Fill the right-hand side.",
    },
  ],
  3: [
    {
      title: "Two kinds of name",
      body: "A String is copyable text: you can concatenate it, interpolate it, mutate it. A Symbol (`:crimson_blade`) is an interned label — one object in memory, used as a hash key, a state, a catalogue id. Same characters, different job.",
    },
    {
      title: "Equality does not cross the wall",
      body: "`:idle == \"idle\"` is false. Ruby will not silently coerce. That is a feature: a key and a caption stay distinct. Convert with `to_sym` / `to_s` only when you mean to.",
      code: 'weapon = :crimson_blade\nlabel = "crimson_blade"\nsame_identity = weapon == label  # false',
    },
  ],
  4: [
    {
      title: "An ordered belt",
      body: "An Array is a numbered row. Index `0` is the first slot. You build one with square brackets and commas. The tests want three strings in a fixed order — gems, map, ember — because inventories are sequences, not bags.",
    },
    {
      title: "Reading the head",
      body: "`inventory[0]` and `inventory.first` open the same pocket. Assign that value to `first_item` so later stages can talk about \"the thing in slot zero\" without rewriting the list.",
      code: 'inventory = ["ruby_gem", "forgemap", "ember"]\nfirst_item = inventory[0]',
    },
  ],
  5: [
    {
      title: "A labelled card, not a list",
      body: "A Hash maps keys to values. You look up by name, not by position. Modern Ruby writes `{ name: \"Ash\" }` — that key is the Symbol `:name`. Read it with `hero[:name]`. A missing key returns `nil`; it does not explode.",
    },
    {
      title: "What the sigil must hold",
      body: "Three fields: a String name, an Integer level, a Symbol job. Keep the keys unquoted in the `name:` form. Quoting them (`\"name\" => ...`) builds string keys, and `hero[:name]` would then be `nil`.",
      code: 'hero = {\n  name: "Ash",\n  level: 1,\n  job: :forgemancer\n}',
    },
  ],
  6: [
    {
      title: "Behavior is a method",
      body: "`def` opens a named recipe. Parameters are local to the body. Ruby returns the last evaluated expression — you rarely need `return`. The suite will call `banner(\"Ash\")` and `banner(\"Ruby\")`, so the name must come from the argument, not a hardcoded string.",
    },
    {
      title: "Stamp the argument into a sentence",
      body: "Reuse interpolation from Stage 02. The template is fixed; only `name` changes. If you write `\"Ash enters the forge\"` literally, the Ruby call will fail.",
      code: 'def banner(name)\n  "#{name} enters the forge"\nend',
    },
  ],
  7: [
    {
      title: "Two mouths, one stream",
      body: "`puts` writes text and then a newline. `print` writes text and stops. The runner captures stdout as a single tape. Order matters: FORGE on its own line, then OK with no extra break after it.",
    },
    {
      title: "Do not add a third shout",
      body: "No `p`, no extra `puts`. Two calls, that order. Windows may insert `\\r`; the suite strips it. Your job is the FORGE line followed immediately by OK.",
      code: 'puts "FORGE"\nprint "OK"',
    },
  ],
  8: [
    {
      title: "Everything is an object, including absence",
      body: "`100` is an Integer. `0.75` must be written with a decimal or it is `0` (Integer). `nil` is the only instance of NilClass — not `\"\"`, not `0`. `true` is TrueClass. `.class` is how you ask.",
    },
    {
      title: "Falsy is a short list",
      body: "In conditions, only `nil` and `false` are falsy. `0`, `\"\"`, and `[]` are truthy. Bind the four names exactly: hp, ratio, empty_slot, alive.",
      code: "hp = 100\nratio = 0.75\nempty_slot = nil\nalive = true",
    },
  ],
  9: [
    {
      title: "A ladder of thresholds",
      body: "`if` / `elsif` / `else` walks top to bottom and stops at the first true branch. If you test `xp >= 50` before `xp >= 100`, a master will be labelled adept. Check the highest gate first.",
    },
    {
      title: "Return symbols, not strings",
      body: "The suite compares to `:initiate`, `:adept`, `:master`. `\"master\"` is a different object. The method's last expression is the return value.",
      code: "def rank(xp)\n  if xp >= 100\n    :master\n  elsif xp >= 50\n    :adept\n  else\n    :initiate\n  end\nend",
    },
  ],
  10: [
    {
      title: "Constants live in the rafters",
      body: "`FORGE_NAME` starts with an uppercase letter. It is visible to methods defined in the same file. A local created outside a method does not automatically appear inside one — methods open a new scope. Pass data in, or read a constant.",
    },
    {
      title: "Build a tagged id",
      body: "`tag` receives a suffix and must interpolate the constant plus a hyphen plus the suffix. The constant is the stable identity; the suffix is the variant.",
      code: 'FORGE_NAME = "RubyForge"\n\ndef tag(suffix)\n  "#{FORGE_NAME}-#{suffix}"\nend',
    },
  ],
  11: [
    {
      title: "each is a rhythm, not a for-loop",
      body: "`.each` hands every element to a block. `|n|` names the current item. The method returns the original array; the running total is your side effect. Rubyists reach for `each` before `for`.",
    },
    {
      title: "Accumulate, then return",
      body: "Start at `0`. Add each number. Return `total` after the loop — if you return inside the block you exit early. An empty array never enters the block, so `0` is the correct identity.",
      code: "def sum_gems(values)\n  total = 0\n  values.each { |n| total += n }\n  total\nend",
    },
  ],
  12: [
    {
      title: "map builds a new list",
      body: "`map` is a transformer: one output per input. It does not mutate the source. `[1, 4].map { |n| n * 2 }` → `[2, 8]`. Use this whenever the shape stays a list but the values change.",
    },
    {
      title: "Return the mapped array",
      body: "The method's last expression should be the `map` call itself. If you `each` and `<<` into a new array you are reinventing `map` — the suite also greps for `.map`.",
      code: "def double_gems(values)\n  values.map { |n| n * 2 }\nend",
    },
  ],
  13: [
    {
      title: "select keeps, reject drops",
      body: "`select` (alias `find_all`) keeps elements for which the block is truthy. `reject` is the inverse. Filtering loot, XP, or rare gems is this one idea.",
    },
    {
      title: "The predicate is the rule",
      body: "Keep numbers `>= 10`. The block's last expression is the boolean. Do not `if` inside and `<<` — return `values.select { ... }`.",
      code: "def rare_gems(values)\n  values.select { |n| n >= 10 }\nend",
    },
  ],
  14: [
    {
      title: "reduce / inject folds a list into one value",
      body: "`inject` (also `reduce`) carries an accumulator through every element. For a product, the identity of multiplication is `1` — that is why an empty array should return `1`, not `0`.",
    },
    {
      title: "Write the fold",
      body: "Start the memo at `1`, multiply by each number. `values.inject(1) { |acc, n| acc * n }` is the whole method.",
      code: "def combo(values)\n  values.inject(1) { |acc, n| acc * n }\nend",
    },
  ],
  15: [
    {
      title: "yield hands control to the caller",
      body: "A method that `yield`s pauses and runs the block the caller passed. `temper(5) { |n| n * 2 }` yields `5` into `|n|`. This is how `each` itself is built.",
    },
    {
      title: "Yield the argument, return the block's result",
      body: "`yield n` passes `n` to the block and the method returns whatever the block returned. Do not compute the doubling yourself — the block is the strategy.",
      code: "def temper(n)\n  yield n\nend",
    },
  ],
  16: [
    {
      title: "A Proc is a block you can hold",
      body: "`Proc.new` or `proc { ... }` boxes a block into an object. You call it with `.call` or `.()`. Unlike a method, it is a value you can store, pass, and keep.",
    },
    {
      title: "Amplifier multiplies by three",
      body: "`amplifier` should be a Proc, not a method. `amplifier.call(4)` → `12`. Use `{ |n| n * 3 }`.",
      code: "amplifier = proc { |n| n * 3 }",
    },
  ],
  17: [
    {
      title: "Lambda is a strict cousin of Proc",
      body: "`lambda` (or `->`) checks arity and returns from itself, not from the surrounding method. Use it for gates and policies. `->(xp) { xp >= 50 }` is a predicate object.",
    },
    {
      title: "adept_gate is a callable boolean",
      body: "It must be a lambda. `adept_gate.call(50)` is true; `49` is false. Create it with `lambda` or `->`, not `proc`.",
      code: "adept_gate = ->(xp) { xp >= 50 }",
    },
  ],
  18: [
    {
      title: "Disk is just another object",
      body: "`File.read(path)` returns the whole file as a String. The fixture `lore.txt` already sits in the workspace. You do not open/close by hand for this stage.",
    },
    {
      title: "Bind the prophecy",
      body: "Assign the file contents to `prophecy`. Do not strip unless the tests ask — they want the file as written.",
      code: 'prophecy = File.read("lore.txt")',
    },
  ],
  19: [
    {
      title: "Write is the inverse of read",
      body: "`File.write(path, string)` creates or replaces the file. No extra newline unless you put one in the string. The suite will read `save.txt` back.",
    },
    {
      title: "Exactly ASH-1",
      body: "Write that four-and-two character payload, nothing else. A trailing `puts` would pollute stdout, not the file — but a stray `\\n` in the string would fail the exact match.",
      code: 'File.write("save.txt", "ASH-1")',
    },
  ],
  20: [
    {
      title: "Pipelines are Enumerable sentences",
      body: "Chain `select`, `map`, and `sum` (or `inject`) left to right. Each step's output is the next step's input. This is the Ruby accent: small verbs, composed.",
    },
    {
      title: "The spec in three beats",
      body: "Keep values `>= 10`, double them, then add them up. `[10, 3, 20]` → `[10, 20]` → `[20, 40]` → `60`.",
      code: "def forge_power(values)\n  values.select { |n| n >= 10 }.map { |n| n * 2 }.sum\nend",
    },
  ],
  21: [
    {
      title: "A class is a mold",
      body: "`class Hero` defines a type. `Hero.new` mints an instance. Methods on the class become messages you send to that instance: `hero.declare`. Class names are ConstantCase.",
    },
    {
      title: "declare is a message",
      body: "For this stage the hero always answers `\"I am Ash\"`. Later stages will store `@name`. Return that string from `declare`.",
      code: 'class Hero\n  def declare\n    "I am Ash"\n  end\nend',
    },
  ],
  22: [
    {
      title: "initialize is construction",
      body: "`Hero.new(\"Ash\", 3)` calls `initialize(name, level)`. Store those arguments in instance variables (`@name`, `@level`) so other methods can read them later. Without `@`, the values vanish when initialize ends.",
    },
    {
      title: "inspect_card reads the stored state",
      body: "Interpolate both ivars. Two different `new` calls must produce two different cards — proof that state is per-instance, not a global.",
      code: 'def initialize(name, level)\n  @name = name\n  @level = level\nend\n\ndef inspect_card\n  "#{@name} Lv.#{@level}"\nend',
    },
  ],
  23: [
    {
      title: "attr_* writes the boring methods",
      body: "`attr_reader :name` defines `name` (get `@name`). `attr_accessor :hp` defines both `hp` and `hp=`. You still initialize `@hp` yourself if you want a default.",
    },
    {
      title: "What the suite will poke",
      body: "Initialize already stores `@name` and `@hp`. Add `attr_reader :name` and `attr_accessor :hp`. The suite writes `hero.hp = 70` and asserts `name=` does not exist — health is mutable, identity is not.",
      code: "class Hero\n  attr_reader :name\n  attr_accessor :hp\n\n  def initialize(name, hp)\n    @name = name\n    @hp = hp\n  end\nend",
    },
  ],
  24: [
    {
      title: "Inheritance is \"is-a\"",
      body: "`class Mage < Hero` means a Mage is a Hero: it receives initialize, readers, and methods unless it overrides them. Use this for specialisation, not for sharing a pile of unrelated helpers (that is mixins).",
    },
    {
      title: "job is the subclass voice",
      body: "Define `job` on `Mage` so it returns `:forgemancer`. The parent stays generic; the child names its vocation.",
      code: "class Mage < Hero\n  def job\n    :forgemancer\n  end\nend",
    },
  ],
  25: [
    {
      title: "A module is a namespace (and later a mixin)",
      body: "`module CrimsonPath` groups constants and functions without being constructed. `CrimsonPath::VERSION` is a namespaced constant. `::` is the scope operator.",
    },
    {
      title: "VERSION and sigil",
      body: "Set `VERSION` to `\"0.1.0\"`. Define `sigil` as a module method (`def self.sigil` or `module_function`) that returns `\"CRIMSON\"`.",
      code: 'module CrimsonPath\n  VERSION = "0.1.0"\n  def self.sigil\n    "CRIMSON"\n  end\nend',
    },
  ],
  26: [
    {
      title: "include copies behaviour into a class",
      body: "A mixin module defines instance methods. `class Hero; include Combat; end` makes `hero.strike` work. This is how Ruby shares verbs across types that are not a hierarchy.",
    },
    {
      title: "strike returns 12",
      body: "Put `strike` on `Combat`, include it from `Hero`. Do not define `strike` only on Hero — the suite wants the mixin relationship.",
      code: "module Combat\n  def strike\n    12\n  end\nend\n\nclass Hero\n  include Combat\nend",
    },
  ],
  27: [
    {
      title: "begin / rescue is a seatbelt",
      body: "Code in `begin` runs until something raises. `rescue` catches, then you decide: re-raise, log, or return a fallback. `safe_load` must return the block's value when it succeeds, and `:recover` when it raises.",
    },
    {
      title: "Yield inside the belt",
      body: "`yield` runs the caller's block. If that block raises, rescue and return `:recover`. Do not catch with an empty rescue that swallows and returns nil.",
      code: "def safe_load\n  yield\nrescue StandardError\n  :recover\nend",
    },
  ],
  28: [
    {
      title: "Class methods are messages to the class",
      body: "`def self.from_hash(payload)` is called as `Hero.from_hash(...)`. Factory methods like this keep `new` simple and give you a named constructor for hashes, JSON, or save files.",
    },
    {
      title: "Unpack, then initialize",
      body: "Read the hash keys, pass them into `new` (or set ivars). `inspect_card` should match the payload's name and level. The suite will not call your factory with extra keys you must ignore — keep it honest.",
      code: 'def self.from_hash(payload)\n  new(payload[:name], payload[:level])\nend',
    },
  ],
  29: [
    {
      title: "The engine is a small object with a pulse",
      body: "Namespace it: `CrimsonPath::Engine`. `initialize(name)` stores the hero. `tick(xp)` adds experience and returns `self` so you can chain. `status` interpolates the current card.",
    },
    {
      title: "Chain, then read",
      body: '`CrimsonPath::Engine.new("Ash").tick(10).status` must equal `"Ash · 10 XP"`. Returning `self` from `tick` is what makes the chain legal.',
      code: 'def tick(xp)\n  @xp += xp\n  self\nend\n\ndef status\n  "#{@name} · #{@xp} XP"\nend',
    },
  ],
  30: [
    {
      title: "A gemspec is a passport",
      body: "`Gem::Specification` is the object RubyGems reads: name, version, summary. You are not publishing — you are constructing the spec the way a real library would.",
    },
    {
      title: "Name and version",
      body: "`spec.name` must be `\"crimson_path\"` and `spec.version` `\"0.1.0\"` (or a Gem::Version of that). Require `\"rubygems\"` if the constant is missing in the sandbox.",
      code: 'spec = Gem::Specification.new do |s|\n  s.name = "crimson_path"\n  s.version = "0.1.0"\nend',
    },
  ],
};
