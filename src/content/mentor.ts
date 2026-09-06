export type MentorMood = "idle" | "teach" | "cheer" | "warn";

export interface MentorLine {
  id: string;
  text: string;
  mood: MentorMood;
}

export const MENTOR_NAME = "Ember";

export const STAGE_WHISPERS: Record<number, string> = {
  1: "Three blanks on the right. Quotes for the name, a number for the level, the word true for ready. You type it — I just watch.",
  2: "Double quotes run a tiny program — #{...} stamps a live value into the banner. Single quotes are a photograph. Fill welcome. Do not leave it nil.",
  3: "A Symbol is a label. A String is copyable text. :crimson_blade is not \"crimson_blade\". Prove they are unequal.",
  4: "An Array is a belt with numbered pockets. Index zero is the first tool. Build the three-string inventory, then read the head.",
  5: "A Hash is a labelled card, not a list. Use symbol keys — name:, level:, job:. Read with hero[:name].",
  6: "def opens a recipe. The last expression returns. banner must interpolate the argument — do not hardcode Ash.",
  7: "puts shouts and breaks the line. print whispers and stays. FORGE, then OK. No third cry.",
  8: "Every value is an object. 0.75 needs a decimal. nil is absence — not empty quotes. Bind the four essences.",
  9: "Check the highest gate first or a master will be called adept. Return symbols, not strings.",
  10: "Constants live in the rafters. Locals die at the method door. tag must interpolate FORGE_NAME and the suffix.",
  11: "each is the rhythm. Add every number into total, then return it. Empty arrays never enter the block — zero is the identity.",
  12: "map builds a new list. Double each gem. Return the map itself — do not reinvent it with each and shovel.",
  13: "select keeps what the block blesses. Keep numbers at 10 or above. The predicate is the whole method.",
  14: "inject folds a list into one value. The identity of multiplication is 1 — that is why empty arrays return 1.",
  15: "yield hands the hammer to the caller. Do not double the number yourself. Yield n. The block is the strategy.",
  16: "A Proc is a block you can hold. amplifier is an object, not a method. Multiply by three.",
  17: "Lambda is the strict cousin. adept_gate must be a lambda. True at 50. False below.",
  18: "Disk is just another object. File.read(\"lore.txt\") into prophecy. Do not invent the words — take them from the file.",
  19: "File.write is the inverse. Exactly ASH-1. No stray newline. The suite will read it back.",
  20: "Chain the verbs: select 10+, map times two, then sum. That is a Ruby sentence.",
  21: "A class is a mold. Hero.new mints an instance. declare is a message. Answer: I am Ash.",
  22: "initialize is birth. Store name and level in @ivars or they vanish. inspect_card interpolates both.",
  23: "attr_reader for name — identity is not writable. attr_accessor for hp — combat must drain it.",
  24: "Mage is-a Hero. Inherit, then give the child a vocation. job returns :forgemancer.",
  25: "A module is a namespace. CrimsonPath::VERSION and a sigil method. No instance required.",
  26: "include copies verbs into a class. Put strike on Combat. Hero includes it. Do not define strike only on Hero.",
  27: "begin / rescue is a seatbelt. Yield the block. If it raises, return :recover. Do not swallow into nil.",
  28: "Class methods are messages to the class. from_hash unpacks the save and calls new. The instance never loads itself.",
  29: "The engine ticks. Store name and xp. tick adds and returns self so the chain lives. Status is Ash · 10 XP.",
  30: "A gemspec is a passport. name crimson_path, version 0.1.0, and a real summary. Then the path ends as a library.",
};

export const MAP_INTRO: MentorLine = {
  id: "map-intro",
  mood: "teach",
  text: "I am Ember. I roost on this path. Light a stage when it glows — I will speak when the iron needs a word. Tap me if you want the next nudge.",
};

export const MAP_RETURN: string[] = [
  "The winding road is still here. The lit orb is the one that wants you.",
  "Gems are not gifts. They are proof a suite went green. Walk the curve.",
  "I remember the last strike. The next node is waiting. Go.",
  "Thirty stations. One local runtime. I will not leave the perch.",
];

export const BAZAAR_LINES: string[] = [
  "The stall keeps tools and vanities. Hints cost heat. Colors are for after the suite is green.",
  "Spend carefully. Diagnostic Hint is the honest buy when a stage has you pinned.",
  "Nicknames and banners do not write Ruby. They do make the forge look like yours.",
];

export const RUN_LINES: string[] = [
  "The runtime is local. Eight seconds. I will watch the assertions with you.",
  "Ctrl+Enter next time. The hammer does not need a long wind-up.",
  "Good. Let the suite speak. If it fails, I will name the wound.",
];

export const PASS_LINES: string[] = [
  "Green. The file is real now — it lives under stages/. Keep walking.",
  "The forge accepted the heat. Gems are yours. Do not linger unless you want to.",
  "Clean suite. That is the only praise that matters here.",
];

export const MILESTONE_LINES: string[] = [
  "A fifth-station seal. Extra gems. The path just marked you.",
  "Milestone. The journey folder just grew heavier. Wear it.",
  "Five more behind you. The trail remembers. I do too.",
];

export const IDLE_LINES: string[] = [
  "The briefing on the left is the lesson. I am only the spark that points.",
  "snake_case. Double quotes when you interpolate. Return the last expression. That is half of Ruby.",
  "If stdout is empty, you did not print. If a name is missing, you did not assign.",
  "I am not the test suite. The red lines in the terminal are. Read them twice.",
  "Tap a glowing node. Locked iron will not open because you asked nicely.",
];

export const FAIL_GENERIC: string[] = [
  "The suite refused. Read the assertion name — it is the contract, not a riddle.",
  "Failed heat. Diff first, pride second. Then run again.",
  "Not yet. The terminal is telling you which claim broke. Start there.",
];
