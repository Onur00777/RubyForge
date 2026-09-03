import type { StageDef } from "@/lib/types";

export const PHASE_THREE: StageDef[] = [
  {
    id: 21,
    phase: 3,
    slug: "classes",
    title: "Classes",
    subtitle: "OOP · the mold",
    fileName: "stage_21_classes.rb",
    concept:
      "`class Hero` is a mold. `Hero.new` mints an instance. Instance variables live as `@name`. Methods are messages: `hero.declare`.",
    bullets: [
      "`class ... end`",
      "`@name` is an instance variable",
      "Class names use ConstantCase",
    ],
    lore: "The hero is no longer a hash. The hero is a type.",
    task: "`Hero#declare` returns `\"I am Ash\"`.",
    objectives: [
      "`Hero` is a Class",
      '`Hero.new.declare` → `"I am Ash"`',
    ],
    starterCode: `# Stage 21 — class

class Hero
  def declare
  end
end
`,
    testScript: `
__expect("Hero is a class", defined?(Hero) && Hero.is_a?(Class))
begin
  __expect("declare", Hero.new.declare == "I am Ash", Hero.new.declare.inspect)
rescue StandardError => e
  __expect("Hero.new.declare", false, e.message)
end
`,
    hints: [
      'Return `"I am Ash"` from `declare`.',
      "You do not call `Hero.new` — the suite does.",
    ],
    solution: `class Hero
  def declare
    "I am Ash"
  end
end
`,
    gems: 18,
    xp: 100,
  },
  {
    id: 22,
    phase: 3,
    slug: "initialize",
    title: "initialize",
    subtitle: "OOP · construction",
    fileName: "stage_22_initialize.rb",
    concept:
      "`initialize` is the constructor fired by `new`. Arguments land in `@ivars` here. A hero is not born nameless.",
    bullets: [
      "`def initialize(name, level)`",
      "`@name = name`",
      "`new`'s arguments flow into initialize",
    ],
    lore: "Every forging begins with a name and a level.",
    task: "`Hero#initialize(name, level)` stores state; `inspect_card` formats `\"Ash Lv.3\"`.",
    objectives: [
      '`Hero.new("Ash", 3).inspect_card` → `"Ash Lv.3"`',
      '`Hero.new("Ruby", 1).inspect_card` → `"Ruby Lv.1"`',
    ],
    starterCode: `# Stage 22 — initialize

class Hero
  def initialize(name, level)
  end

  def inspect_card
  end
end
`,
    testScript: `
begin
  a = Hero.new("Ash", 3)
  b = Hero.new("Ruby", 1)
  __expect("Ash Lv.3", a.inspect_card == "Ash Lv.3", a.inspect_card.inspect)
  __expect("Ruby Lv.1", b.inspect_card == "Ruby Lv.1", b.inspect_card.inspect)
rescue StandardError => e
  __expect("Hero initialize", false, e.message)
end
`,
    hints: [
      "`@name = name` and `@level = level`",
      '`"#{@name} Lv.#{@level}"`',
    ],
    solution: `class Hero
  def initialize(name, level)
    @name = name
    @level = level
  end

  def inspect_card
    "#{@name} Lv.#{@level}"
  end
end
`,
    gems: 18,
    xp: 105,
  },
  {
    id: 23,
    phase: 3,
    slug: "attr-accessor",
    title: "attr_accessor",
    subtitle: "OOP · gates",
    fileName: "stage_23_attr_accessor.rb",
    concept:
      "`attr_reader`, `attr_writer`, and `attr_accessor` open gates to instance variables. Prefer the macros over hand-written getters.",
    bullets: [
      "`attr_accessor :hp`",
      "Produces both reader and writer",
      "Callers write `hero.hp = 80`",
    ],
    lore: "The health bar must be visible — readable and writable, because combat drains it.",
    task: "`Hero` exposes `name` as a reader and `hp` as an accessor.",
    objectives: [
      '`Hero.new("Ash", 100).name` → `"Ash"`',
      "`hp` can be read and written",
      "`name=` must not exist (reader only)",
    ],
    starterCode: `# Stage 23 — attr_*

class Hero
  def initialize(name, hp)
    @name = name
    @hp = hp
  end
end
`,
    testScript: `
begin
  h = Hero.new("Ash", 100)
  __expect("name reader", h.name == "Ash")
  __expect("hp reader", h.hp == 100)
  h.hp = 70
  __expect("hp writer", h.hp == 70)
  __expect("no name writer", !h.respond_to?(:name=))
rescue StandardError => e
  __expect("attr", false, e.message)
end
`,
    hints: [
      "Add `attr_reader :name` and `attr_accessor :hp` in the class body.",
      "Keep initialize.",
    ],
    solution: `class Hero
  attr_reader :name
  attr_accessor :hp

  def initialize(name, hp)
    @name = name
    @hp = hp
  end
end
`,
    gems: 18,
    xp: 105,
  },
  {
    id: 24,
    phase: 3,
    slug: "inheritance",
    title: "Inheritance",
    subtitle: "OOP · lineage",
    fileName: "stage_24_inheritance.rb",
    concept:
      "`class Mage < Hero` is inheritance. Subclasses call `super` to extend the parent. `is_a?` walks the chain upward.",
    bullets: [
      "`class Mage < Hero`",
      "`super` extends initialize",
      "`Mage.new.is_a?(Hero)` → true",
    ],
    lore: "A Forgemancer is a hero — fire is simply a different bloodline.",
    task: "`Mage` inherits from `Hero` and `job` returns `:forgemancer`.",
    objectives: [
      "`Mage < Hero`",
      '`Mage.new("Ash", 1).name` comes from the parent',
      "`job` → `:forgemancer`",
    ],
    starterCode: `# Stage 24 — inheritance

class Hero
  attr_reader :name, :level
  def initialize(name, level)
    @name = name
    @level = level
  end
end

class Mage
end
`,
    testScript: `
__expect("Mage < Hero", defined?(Mage) && Mage < Hero)
begin
  m = Mage.new("Ash", 1)
  __expect("inherited name", m.name == "Ash")
  __expect("job", m.job == :forgemancer, m.respond_to?(:job) ? m.job.inspect : "job missing")
rescue StandardError => e
  __expect("Mage.new", false, e.message)
end
`,
    hints: [
      "`class Mage < Hero`",
      "`def job; :forgemancer; end` is enough. You do not need to rewrite initialize.",
    ],
    solution: `class Hero
  attr_reader :name, :level
  def initialize(name, level)
    @name = name
    @level = level
  end
end

class Mage < Hero
  def job
    :forgemancer
  end
end
`,
    gems: 20,
    xp: 110,
  },
  {
    id: 25,
    phase: 3,
    slug: "modules",
    title: "Modules",
    subtitle: "OOP · namespace",
    fileName: "stage_25_modules.rb",
    concept:
      "`module` cannot be instantiated. It is a namespace or a mixin source. Constants such as `CrimsonPath::VERSION` live here.",
    bullets: [
      "`module CrimsonPath; end`",
      "`CrimsonPath::VERSION`",
      "You do not call `Module.new` in ordinary use",
    ],
    lore: "The engine's name is not a class. It is a banner.",
    task: "`CrimsonPath` defines `VERSION = \"0.1.0\"` and `sigil` → `\"CRIMSON\"`.",
    objectives: [
      '`CrimsonPath::VERSION == "0.1.0"`',
      '`CrimsonPath.sigil == "CRIMSON"` (module method)',
    ],
    starterCode: `# Stage 25 — module

module CrimsonPath
end
`,
    testScript: `
__expect("module", defined?(CrimsonPath) && CrimsonPath.is_a?(Module) && !CrimsonPath.is_a?(Class))
__expect("VERSION", defined?(CrimsonPath::VERSION) && CrimsonPath::VERSION == "0.1.0")
begin
  __expect("sigil", CrimsonPath.sigil == "CRIMSON")
rescue StandardError => e
  __expect("CrimsonPath.sigil", false, e.message)
end
`,
    hints: [
      '`def self.sigil; "CRIMSON"; end` defines a module method.',
      "Declare `VERSION` inside the module in uppercase.",
    ],
    solution: `module CrimsonPath
  VERSION = "0.1.0"

  def self.sigil
    "CRIMSON"
  end
end
`,
    gems: 25,
    xp: 110,
    commitTitle: "feat(stage-25): completed modules milestone",
  },
  {
    id: 26,
    phase: 3,
    slug: "mixins",
    title: "Mixins",
    subtitle: "OOP · include",
    fileName: "stage_26_mixins.rb",
    concept:
      "`include Combat` mixes methods into the instance. `extend` mixes into the class. Ruby prefers mixins over multiple inheritance. `ancestors` tells the truth.",
    bullets: [
      "`module Combat; def strike; end; end`",
      "`class Hero; include Combat; end`",
      "`Hero.new.strike`",
    ],
    lore: "Combat is not a bloodline. It is a skill bolted onto the hero.",
    task: "`Combat#strike` returns 12 and `Hero` includes it.",
    objectives: [
      "`Hero.ancestors` includes `Combat`",
      "`Hero.new.strike == 12`",
    ],
    starterCode: `# Stage 26 — mixin

module Combat
end

class Hero
end
`,
    testScript: `
__expect("include", defined?(Hero) && defined?(Combat) && Hero.ancestors.include?(Combat))
begin
  __expect("strike", Hero.new.strike == 12)
rescue StandardError => e
  __expect("Hero.new.strike", false, e.message)
end
`,
    hints: [
      "`include Combat` in the class body.",
      "`def strike; 12; end` inside the module.",
    ],
    solution: `module Combat
  def strike
    12
  end
end

class Hero
  include Combat
end
`,
    gems: 20,
    xp: 115,
  },
  {
    id: 27,
    phase: 3,
    slug: "exceptions",
    title: "Exception Handling",
    subtitle: "OOP · begin/rescue",
    fileName: "stage_27_exceptions.rb",
    concept:
      "`begin/rescue/end` is controlled failure. `raise` throws. `rescue StandardError => e` captures the message. The engine must bind wounds without crashing.",
    bullets: [
      "`raise \"broken\"`",
      "`rescue StandardError => e`",
      "`ensure` always runs",
    ],
    lore: "Reading a broken save is not death. Bind the wound and return `:recover`.",
    task: "`safe_load` returns the block's value, or `:recover` if it raises.",
    objectives: [
      "`safe_load { 7 }` → `7`",
      '`safe_load { raise "x" }` → `:recover`',
    ],
    starterCode: `# Stage 27 — rescue

def safe_load
end
`,
    testScript: `
begin
  __expect("success path", safe_load { 7 } == 7)
  __expect("recovery path", safe_load { raise "broken" } == :recover)
  __expect("uses rescue", File.read("current.rb").include?("rescue"))
rescue StandardError => e
  __expect("safe_load", false, e.message)
end
`,
    hints: [
      "`begin; yield; rescue StandardError; :recover; end`",
      "Return the symbol `:recover` — not a string.",
    ],
    solution: `def safe_load
  yield
rescue StandardError
  :recover
end
`,
    gems: 20,
    xp: 115,
  },
  {
    id: 28,
    phase: 3,
    slug: "class-methods",
    title: "Class methods",
    subtitle: "OOP · self",
    fileName: "stage_28_class_methods.rb",
    concept:
      "`def self.load` is a class method. Factories, parsers, and singletons live here. `Hero.load(hash)` resurrects an instance.",
    bullets: [
      "`def self.from_hash(h)`",
      "Class methods do not require an instance",
      "Call `Hero.from_hash(...)`",
    ],
    lore: "Raising a hero from a save file is not an instance's job. It is the class's.",
    task: "`Hero.from_hash` builds an instance whose `inspect_card` matches the payload.",
    objectives: [
      '`Hero.from_hash({ name: "Ash", level: 2 }).inspect_card` → `"Ash Lv.2"`',
    ],
    starterCode: `# Stage 28 — self.

class Hero
  attr_reader :name, :level

  def initialize(name, level)
    @name = name
    @level = level
  end

  def inspect_card
    "#{@name} Lv.#{@level}"
  end
end
`,
    testScript: `
begin
  h = Hero.from_hash({ name: "Ash", level: 2 })
  __expect("from_hash", h.is_a?(Hero) && h.inspect_card == "Ash Lv.2", h.inspect_card.inspect)
rescue StandardError => e
  __expect("Hero.from_hash", false, e.message)
end
`,
    hints: [
      "`def self.from_hash(h); new(h[:name], h[:level]); end`",
      "Hash keys are symbols.",
    ],
    solution: `class Hero
  attr_reader :name, :level

  def initialize(name, level)
    @name = name
    @level = level
  end

  def inspect_card
    "#{@name} Lv.#{@level}"
  end

  def self.from_hash(h)
    new(h[:name], h[:level])
  end
end
`,
    gems: 20,
    xp: 115,
  },
  {
    id: 29,
    phase: 3,
    slug: "engine",
    title: "Mini-project: Engine",
    subtitle: "OOP · assembly",
    fileName: "stage_29_engine.rb",
    concept:
      "The parts lock together. `CrimsonPath::Engine` holds a hero, prints `status`, and `tick`s XP. This file is the heart of the portfolio.",
    bullets: [
      "A class nested in a module",
      "State plus behavior",
      "Chainable methods can return `self`",
    ],
    lore: "The forge is no longer a toy. The engine is running.",
    task: '`CrimsonPath::Engine.new("Ash").tick(10).status` → `"Ash · 10 XP"`.',
    objectives: [
      "`Engine` lives inside `CrimsonPath`",
      "`tick` adds XP and returns self (chainable)",
      '`status` format is `"Ash · 10 XP"`',
    ],
    starterCode: `# Stage 29 — Engine assembly

module CrimsonPath
  class Engine
  end
end
`,
    testScript: `
__expect("namespace", defined?(CrimsonPath::Engine))
begin
  e = CrimsonPath::Engine.new("Ash")
  __expect("chain", e.tick(10).equal?(e))
  __expect("status", e.status == "Ash · 10 XP", e.status.inspect)
  e.tick(5)
  __expect("accumulation", e.status == "Ash · 15 XP", e.status.inspect)
rescue StandardError => err
  __expect("Engine", false, err.message)
end
`,
    hints: [
      "`initialize` sets @name and @xp=0. `tick(n)` adds to @xp and returns self. `status` interpolates.",
      "The separator is ` · ` (space-dot-space) — the suite matches it exactly.",
    ],
    solution: `module CrimsonPath
  class Engine
    def initialize(name)
      @name = name
      @xp = 0
    end

    def tick(amount)
      @xp += amount
      self
    end

    def status
      "#{@name} · #{@xp} XP"
    end
  end
end
`,
    gems: 22,
    xp: 140,
  },
  {
    id: 30,
    phase: 3,
    slug: "gemspec",
    title: "Gemspec & packaging",
    subtitle: "OOP · delivery",
    fileName: "stage_30_gemspec.rb",
    concept:
      "RubyGems expects a `Gem::Specification`: name, version, summary, authors. This is the lock on the portfolio — the code is now a library.",
    bullets: [
      "`Gem::Specification.new do |s|`",
      "`s.name`, `s.version`, `s.summary`",
      "A deliverable artifact",
    ],
    lore: "When the path ends, a gem remains. Its name is crimson_path.",
    task: "`spec` is a Gem::Specification named `crimson_path` at version `0.1.0`.",
    objectives: [
      '`spec.name == "crimson_path"`',
      "`spec.version.to_s` starts with `0.1.0`",
      "`spec.summary` is a non-empty String",
    ],
    starterCode: `# Stage 30 — Gemspec
require "rubygems"

spec = Gem::Specification.new do |s|
  # s.name / s.version / s.summary / s.authors
end
`,
    testScript: `
__expect("spec is Gem::Specification", defined?(spec) && spec.is_a?(Gem::Specification), defined?(spec) ? spec.class.to_s : "missing")
if defined?(spec) && spec.is_a?(Gem::Specification)
  __expect("name", spec.name == "crimson_path", spec.name.inspect)
  __expect("version", spec.version.to_s.start_with?("0.1.0"), spec.version.to_s)
  __expect("summary", spec.summary.is_a?(String) && !spec.summary.strip.empty?)
  __expect("authors", spec.authors.is_a?(Array) && spec.authors.any?)
end
`,
    hints: [
      '`s.name = "crimson_path"` · `s.version = "0.1.0"`',
      '`s.authors = ["Ash"]` plus a short `s.summary`.',
    ],
    solution: `require "rubygems"

spec = Gem::Specification.new do |s|
  s.name = "crimson_path"
  s.version = "0.1.0"
  s.summary = "CLI RPG engine forged in RubyForge"
  s.authors = ["Ash"]
  s.files = ["stages/stage_29_engine.rb"]
end
`,
    gems: 30,
    xp: 180,
    commitTitle: "feat(stage-30): packaged Crimson Path engine with gemspec",
  },
];
