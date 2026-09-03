import path from "node:path";

export function journeyRoot(): string {
  return path.join(process.cwd(), "ruby_journey");
}

export function stagesDir(): string {
  return path.join(journeyRoot(), "stages");
}

export function workspaceDir(): string {
  return path.join(journeyRoot(), "workspace");
}

export function engineDir(): string {
  return path.join(journeyRoot(), "engine");
}

export function forgeDir(): string {
  return path.join(journeyRoot(), ".rubyforge");
}

export function runDir(): string {
  return path.join(forgeDir(), "run");
}

export function progressPath(): string {
  return path.join(forgeDir(), "progress.json");
}

export function stageFilePath(fileName: string): string {
  return path.join(stagesDir(), fileName);
}

export function padStage(id: number): string {
  return String(id).padStart(2, "0");
}
