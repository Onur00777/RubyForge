export interface OracleReport {
  score: number;
  headline: string;
  notes: { severity: "info" | "warn" | "good"; title: string; detail: string }[];
}

export function reviewRuby(code: string): OracleReport {
  const notes: OracleReport["notes"] = [];
  const trimmed = code.trim();

  if (!trimmed) {
    return {
      score: 0,
      headline: "Empty buffer. There is nothing to review.",
      notes: [{ severity: "warn", title: "Empty file", detail: "No Ruby expressions to inspect." }],
    };
  }

  if (/\b[a-z]+[A-Z][A-Za-z0-9]*\s*=/.test(code)) {
    notes.push({
      severity: "warn",
      title: "camelCase identifier",
      detail: "Idiomatic Ruby uses snake_case: hero_name, not heroName.",
    });
  } else if (/\b[a-z]+_[a-z]+\s*=/.test(code)) {
    notes.push({
      severity: "good",
      title: "snake_case",
      detail: "Local names follow the community convention.",
    });
  }

  if (code.includes(' + "') || code.includes(" + '")) {
    notes.push({
      severity: "warn",
      title: "String concatenation",
      detail: 'Prefer `"Hello, #{name}"` over `"Hello, " + name`.',
    });
  }

  if (/\bfor\s+\w+\s+in\b/.test(code)) {
    notes.push({
      severity: "warn",
      title: "for loop",
      detail: "`for` is rare in Ruby. Enumerable#each, map, and select carry the idiom.",
    });
  }

  if (/\.each\s*(do|\{\s*\|)/.test(code) || /\.map\s*(do|\{)/.test(code)) {
    notes.push({
      severity: "good",
      title: "Enumerable",
      detail: "Block-based iteration is the heart of Ruby. This is the right grain.",
    });
  }

  if (/"[a-z_]+"\s*=>/.test(code) && !/:[a-z_]+\s*=>/.test(code) && !/[a-z_]+:\s/.test(code)) {
    notes.push({
      severity: "info",
      title: "Hash keys",
      detail: 'Symbol keys (`name: "Ash"` or `:name =>`) are more idiomatic than string keys.',
    });
  }

  if (/\bdef\s+[A-Z]/.test(code)) {
    notes.push({
      severity: "warn",
      title: "Method name",
      detail: "Methods start lowercase in snake_case. Constants use uppercase.",
    });
  }

  if (/\bputs\b/.test(code) && /\bprint\b/.test(code)) {
    notes.push({
      severity: "good",
      title: "Output discipline",
      detail: "Knowing puts (newline) versus print (raw stream) is terminal control.",
    });
  }

  if (/\bbegin\b[\s\S]*\brescue\b/.test(code)) {
    notes.push({
      severity: "good",
      title: "Exception handling",
      detail: "A begin/rescue block keeps the engine standing. Prefer `rescue StandardError`.",
    });
  }

  if (notes.length === 0) {
    notes.push({
      severity: "info",
      title: "Clean surface",
      detail: "No obvious smells. Deeper stages will inspect yield, mixins, and frozen strings.",
    });
  }

  const warns = notes.filter((n) => n.severity === "warn").length;
  const goods = notes.filter((n) => n.severity === "good").length;
  const score = Math.max(35, Math.min(99, 78 + goods * 7 - warns * 14));

  const headline =
    score >= 90
      ? "Idiomatic. This belongs on the Crimson Path."
      : score >= 70
        ? "Solid forging. A few cuts and it reaches mastery."
        : "It runs, but the Ruby grain is not fully seated.";

  return { score, headline, notes };
}
