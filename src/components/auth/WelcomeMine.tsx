"use client";

const CRYSTALS = [
  { left: "4%", top: "14%", size: 72, rotate: -22, delay: "0s", dur: "6.4s" },
  { left: "88%", top: "10%", size: 58, rotate: 16, delay: "0.7s", dur: "7.2s" },
  { left: "2%", top: "48%", size: 44, rotate: 10, delay: "1.3s", dur: "5.6s" },
  { left: "90%", top: "52%", size: 86, rotate: -14, delay: "0.2s", dur: "8.1s" },
  { left: "7%", top: "76%", size: 36, rotate: 26, delay: "1.8s", dur: "6.8s" },
  { left: "84%", top: "78%", size: 40, rotate: -8, delay: "1s", dur: "5.9s" },
  { left: "12%", top: "28%", size: 28, rotate: 8, delay: "2.2s", dur: "7.4s" },
  { left: "80%", top: "32%", size: 24, rotate: -20, delay: "0.5s", dur: "6.1s" },
] as const;

const SPARKS = [
  { left: "12%", top: "22%", delay: "0s", dur: "2.8s" },
  { left: "28%", top: "14%", delay: "0.6s", dur: "3.4s" },
  { left: "48%", top: "8%", delay: "1.1s", dur: "2.6s" },
  { left: "64%", top: "18%", delay: "0.3s", dur: "3.1s" },
  { left: "78%", top: "28%", delay: "1.5s", dur: "2.9s" },
  { left: "18%", top: "68%", delay: "0.9s", dur: "3.6s" },
  { left: "82%", top: "72%", delay: "0.4s", dur: "3.2s" },
  { left: "8%", top: "42%", delay: "1.8s", dur: "2.7s" },
  { left: "93%", top: "44%", delay: "2.1s", dur: "3.5s" },
  { left: "40%", top: "86%", delay: "1.2s", dur: "3s" },
  { left: "56%", top: "90%", delay: "2.4s", dur: "2.5s" },
] as const;

const EMBERS = [
  { left: "18%", delay: "0s", dur: "9s" },
  { left: "32%", delay: "2.4s", dur: "11s" },
  { left: "50%", delay: "1.1s", dur: "8.5s" },
  { left: "67%", delay: "3.6s", dur: "10s" },
  { left: "81%", delay: "0.8s", dur: "9.4s" },
  { left: "8%", delay: "4.2s", dur: "12s" },
] as const;

const CODE = [
  { text: "def hello", left: "9%", top: "36%", delay: "0s", dur: "16s" },
  { text: "end", left: "76%", top: "42%", delay: "2s", dur: "18s" },
  { text: "class Gem", left: "11%", top: "60%", delay: "4s", dur: "20s" },
  { text: "puts", left: "70%", top: "22%", delay: "1.2s", dur: "17s" },
  { text: "#{ruby}", left: "82%", top: "64%", delay: "3.4s", dur: "19s" },
  { text: ":symbol", left: "5%", top: "50%", delay: "5s", dur: "15s" },
] as const;

export function WelcomeMine() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <CaveWalls />
      <div className="gate-shaft absolute inset-x-[6%] top-0 h-[48%] sm:inset-x-[16%]" />

      {CRYSTALS.map((crystal, index) => (
        <span
          key={index}
          className="absolute gate-float"
          style={{
            left: crystal.left,
            top: crystal.top,
            width: crystal.size,
            height: Math.round(crystal.size * 1.16),
            animationDelay: crystal.delay,
            animationDuration: crystal.dur,
          }}
        >
          <FacetedRuby gid={`c${index}`} rotate={crystal.rotate} />
        </span>
      ))}

      {SPARKS.map((spark, index) => (
        <span
          key={`s${index}`}
          className="gate-twinkle absolute h-1.5 w-1.5 rounded-full bg-[#ffd0dc] shadow-[0_0_12px_#ff1e56]"
          style={{
            left: spark.left,
            top: spark.top,
            animationDelay: spark.delay,
            animationDuration: spark.dur,
          }}
        />
      ))}

      {EMBERS.map((ember, index) => (
        <span
          key={`e${index}`}
          className="gate-ember absolute bottom-[4%] h-2 w-2 rounded-full bg-[#FF1E56] shadow-[0_0_14px_#ff1e56]"
          style={{
            left: ember.left,
            animationDelay: ember.delay,
            animationDuration: ember.dur,
          }}
        />
      ))}

      {CODE.map((mote) => (
        <span
          key={mote.text}
          className="gate-code absolute hidden font-mono text-xs tracking-[0.18em] text-neon/40 md:block"
          style={{
            left: mote.left,
            top: mote.top,
            animationDelay: mote.delay,
            animationDuration: mote.dur,
          }}
        >
          {mote.text}
        </span>
      ))}
    </div>
  );
}

export function HeroRuby({ size = 128, gid = "hero" }: { size?: number; gid?: string }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: Math.round(size * 1.16) }}>
      <span className="gate-hero-glow absolute left-1/2 top-[46%] h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="gate-float relative h-full w-full">
        <FacetedRuby gid={gid} />
      </div>
    </div>
  );
}

function FacetedRuby({ gid, rotate = 0 }: { gid: string; rotate?: number }) {
  const body = `${gid}-body`;
  const shine = `${gid}-shine`;
  const core = `${gid}-core`;
  return (
    <svg viewBox="0 0 120 140" className="h-full w-full drop-shadow-[0_12px_28px_rgba(255,30,86,0.45)]" style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <linearGradient id={body} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ff8aa8" />
          <stop offset="38%" stopColor="#FF1E56" />
          <stop offset="100%" stopColor="#3d0716" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={core} cx="48%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#ffd4e0" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#FF1E56" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#590d22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="128" rx="28" ry="6" fill="#000" opacity="0.35" />
      <polygon points="60,8 108,48 60,132 12,48" fill={`url(#${body})`} />
      <polygon points="60,8 88,48 60,132 32,48" fill="#ff4d78" opacity="0.55" />
      <polygon points="60,8 12,48 32,48" fill="#ffb3c6" opacity="0.55" />
      <polygon points="60,8 108,48 88,48" fill="#c4124d" opacity="0.7" />
      <polygon points="12,48 60,132 32,48" fill="#590d22" opacity="0.75" />
      <polygon points="88,48 60,132 108,48" fill="#7a0f32" opacity="0.65" />
      <path d="M60 8 L88 48 L60 58 L32 48 Z" fill="#fff" opacity="0.16" />
      <path d="M48 22 L60 12 L62 46 L44 40 Z" fill={`url(#${shine})`} />
      <polygon points="60,8 108,48 60,132 12,48" fill={`url(#${core})`} />
      <path d="M60 8 L108 48 L60 132 L12 48 Z" fill="none" stroke="rgba(255,210,220,0.35)" strokeWidth="1.2" />
    </svg>
  );
}

function CaveWalls() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gate-cave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a10" />
          <stop offset="45%" stopColor="#0a0408" />
          <stop offset="100%" stopColor="#040206" />
        </linearGradient>
        <linearGradient id="gate-vein" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF1E56" stopOpacity="0" />
          <stop offset="50%" stopColor="#FF1E56" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF1E56" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="gate-lantern" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb347" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#gate-cave)" />
      <ellipse cx="600" cy="-20" rx="460" ry="240" fill="#FF1E56" opacity="0.1" />

      <path d="M0 0 L360 0 L300 120 L390 250 L220 400 L340 540 L80 800 L0 800 Z" fill="#12060a" />
      <path d="M0 0 L220 0 L190 160 L260 280 L120 430 L200 600 L0 720 Z" fill="#1c0a10" />
      <path d="M1200 0 L840 0 L900 130 L790 270 L980 430 L880 590 L1120 800 L1200 800 Z" fill="#12060a" />
      <path d="M1200 0 L980 0 L1010 170 L920 300 L1080 430 L1000 600 L1200 740 Z" fill="#1c0a10" />

      <path className="gate-vein" d="M40 110 L130 200 L70 310 L180 400 L90 530 L150 660" fill="none" stroke="url(#gate-vein)" strokeWidth="4" strokeLinecap="round" />
      <path className="gate-vein" d="M1160 130 L1060 220 L1130 330 L1020 430 L1110 560 L1040 680" fill="none" stroke="url(#gate-vein)" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: "1.4s" }} />
      <path className="gate-vein" d="M90 560 L170 640 L120 730" fill="none" stroke="url(#gate-vein)" strokeWidth="2.6" strokeLinecap="round" style={{ animationDelay: "2.2s" }} />

      <ellipse cx="210" cy="210" rx="70" ry="50" fill="url(#gate-lantern)" />
      <ellipse cx="990" cy="250" rx="70" ry="50" fill="url(#gate-lantern)" />
      <path d="M200 188 h20 v34 h-20 z" fill="#3a2410" />
      <path d="M205 176 h10 l6 12 h-22 z" fill="#c47a1a" />
      <ellipse cx="210" cy="228" rx="9" ry="6" fill="#ffb347" opacity="0.9" />
      <path d="M980 228 h20 v34 h-20 z" fill="#3a2410" />
      <path d="M985 216 h10 l6 12 h-22 z" fill="#c47a1a" />
      <ellipse cx="990" cy="268" rx="9" ry="6" fill="#ffb347" opacity="0.9" />

      <g opacity="0.9">
        <polygon points="86,198 118,178 132,228 96,244" fill="#FF1E56" />
        <polygon points="118,178 148,204 132,228" fill="#ffb3c6" />
        <polygon points="1048,238 1084,214 1100,268 1060,286" fill="#E0115F" />
        <polygon points="1084,214 1118,244 1100,268" fill="#ff8aa8" />
        <polygon points="150,620 182,600 194,646 164,660" fill="#c4124d" />
        <polygon points="1020,600 1056,578 1072,628 1034,644" fill="#FF1E56" />
        <polygon points="240,480 262,466 270,502 248,512" fill="#ff4d78" />
        <polygon points="930,500 958,484 968,524 942,536" fill="#ff4d78" />
      </g>

      <path d="M0 680 Q300 640 600 700 T1200 660 L1200 800 L0 800 Z" fill="#070308" />
      <path d="M0 720 Q400 690 800 730 T1200 710 L1200 800 L0 800 Z" fill="#0e060a" />
    </svg>
  );
}
