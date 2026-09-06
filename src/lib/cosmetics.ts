export type CosmeticSlot = "nickname" | "banner" | "avatar";

export interface CosmeticDef {
  id: string;
  slot: CosmeticSlot;
  title: string;
  copy: string;
  price: number;
  swatch: string;
  glow: string;
}

export const COSMETICS: CosmeticDef[] = [
  {
    id: "nick-ruby",
    slot: "nickname",
    title: "Ruby Neon",
    copy: "Paint your handle in primary forge crimson.",
    price: 14,
    swatch: "#FF1E56",
    glow: "0 0 18px rgba(255,30,86,0.45)",
  },
  {
    id: "nick-amber",
    slot: "nickname",
    title: "Amber Script",
    copy: "A gold-ink byline for streak nights.",
    price: 16,
    swatch: "#f5b942",
    glow: "0 0 18px rgba(245,185,66,0.4)",
  },
  {
    id: "nick-emerald",
    slot: "nickname",
    title: "Sage Line",
    copy: "Cool green for passing suites and clean diffs.",
    price: 16,
    swatch: "#34d399",
    glow: "0 0 18px rgba(52,211,153,0.4)",
  },
  {
    id: "nick-frost",
    slot: "nickname",
    title: "Frost Glyph",
    copy: "Ice-cyan lettering — quiet, sharp, late-night.",
    price: 18,
    swatch: "#7dd3fc",
    glow: "0 0 18px rgba(125,211,252,0.4)",
  },
  {
    id: "nick-violet",
    slot: "nickname",
    title: "Myth Violet",
    copy: "A rare-drop purple reserved for architects.",
    price: 20,
    swatch: "#c084fc",
    glow: "0 0 18px rgba(192,132,252,0.45)",
  },
  {
    id: "nick-gilded",
    slot: "nickname",
    title: "Gilded Title",
    copy: "Warm metallic sheen across the rank line.",
    price: 26,
    swatch: "#fde68a",
    glow: "0 0 20px rgba(253,230,138,0.45)",
  },
  {
    id: "banner-ember",
    slot: "banner",
    title: "Ember Trail",
    copy: "A low orange bloom behind the world gem.",
    price: 22,
    swatch: "#fb7185",
    glow: "radial-gradient(circle 640px at 50% 18%, rgba(251,113,133,0.22), transparent 72%)",
  },
  {
    id: "banner-bloodwine",
    slot: "banner",
    title: "Bloodwine Silk",
    copy: "Deep wine light — the original forge dusk.",
    price: 26,
    swatch: "#9f1239",
    glow: "radial-gradient(circle 720px at 50% 12%, rgba(159,18,57,0.28), transparent 75%)",
  },
  {
    id: "banner-aurora",
    slot: "banner",
    title: "Aurora Forge",
    copy: "Magenta-to-cyan halo across the overworld.",
    price: 36,
    swatch: "#e879f9",
    glow: "radial-gradient(circle 700px at 38% 16%, rgba(232,121,249,0.2), transparent 58%), radial-gradient(circle 640px at 68% 24%, rgba(34,211,238,0.14), transparent 62%)",
  },
  {
    id: "banner-obsidian",
    slot: "banner",
    title: "Obsidian Rim",
    copy: "Cool silver edge light. Quiet luxury.",
    price: 30,
    swatch: "#cbd5e1",
    glow: "radial-gradient(circle 680px at 50% 20%, rgba(203,213,225,0.14), transparent 70%)",
  },
  {
    id: "banner-solar",
    slot: "banner",
    title: "Solar Flare",
    copy: "A gold pillar behind the map — hard to miss.",
    price: 44,
    swatch: "#fbbf24",
    glow: "radial-gradient(circle 760px at 50% 8%, rgba(251,191,36,0.2), transparent 68%)",
  },
  {
    id: "banner-voidpulse",
    slot: "banner",
    title: "Void Pulse",
    copy: "Tighter crimson spotlight, closer to the gem.",
    price: 24,
    swatch: "#FF1E56",
    glow: "radial-gradient(circle 520px at 50% 22%, rgba(255,30,86,0.26), transparent 70%)",
  },
  {
    id: "avatar-ruby",
    slot: "avatar",
    title: "Ruby Core",
    copy: "A faceted crimson mark in the HUD.",
    price: 16,
    swatch: "#FF1E56",
    glow: "Gem",
  },
  {
    id: "avatar-flame",
    slot: "avatar",
    title: "Streak Flame",
    copy: "Wear the streak as a crest.",
    price: 18,
    swatch: "#f97316",
    glow: "Flame",
  },
  {
    id: "avatar-hammer",
    slot: "avatar",
    title: "Forge Hammer",
    copy: "A smith's mark — tools over trophies.",
    price: 20,
    swatch: "#e7e5e4",
    glow: "Hammer",
  },
  {
    id: "avatar-raven",
    slot: "avatar",
    title: "Night Raven",
    copy: "A dark-wing badge for late sessions.",
    price: 22,
    swatch: "#a1a1aa",
    glow: "Bird",
  },
  {
    id: "avatar-crystal",
    slot: "avatar",
    title: "Oracle Crystal",
    copy: "The bazaar seer's orb, miniaturised.",
    price: 24,
    swatch: "#c084fc",
    glow: "Sparkles",
  },
  {
    id: "avatar-wolf",
    slot: "avatar",
    title: "Pack Wolf",
    copy: "A silver wolf head for the long path.",
    price: 26,
    swatch: "#94a3b8",
    glow: "Swords",
  },
  {
    id: "avatar-phoenix",
    slot: "avatar",
    title: "Phoenix Sigil",
    copy: "Rare crest. Burns gold on the HUD.",
    price: 48,
    swatch: "#fbbf24",
    glow: "Sun",
  },
];

export const COSMETIC_BY_ID = Object.fromEntries(COSMETICS.map((item) => [item.id, item])) as Record<
  string,
  CosmeticDef
>;

export function isCosmeticId(id: string): boolean {
  return id in COSMETIC_BY_ID;
}

export function cosmeticsBySlot(slot: CosmeticSlot): CosmeticDef[] {
  return COSMETICS.filter((item) => item.slot === slot);
}

export function equippedId(
  player: { equippedNickname: string | null; equippedBanner: string | null; equippedAvatar: string | null },
  slot: CosmeticSlot,
): string | null {
  if (slot === "nickname") return player.equippedNickname;
  if (slot === "banner") return player.equippedBanner;
  return player.equippedAvatar;
}

export function applyEquip(
  player: {
    equippedNickname: string | null;
    equippedBanner: string | null;
    equippedAvatar: string | null;
  },
  def: CosmeticDef,
) {
  if (def.slot === "nickname") player.equippedNickname = def.id;
  else if (def.slot === "banner") player.equippedBanner = def.id;
  else player.equippedAvatar = def.id;
}
