"use client";

export function Atmosphere() {
  return (
    <>
      <div className="void-breath pointer-events-none fixed inset-0 z-0" />
      <svg
        className="pointer-events-none fixed inset-0 z-[2] h-full w-full mix-blend-overlay"
        aria-hidden
      >
        <filter id="crimson-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#crimson-grain)" opacity="0.025" />
      </svg>
    </>
  );
}
