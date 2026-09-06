"use client";

import { Howler } from "howler";

let muted = false;
let ctx: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  return ctx;
}

function tone(freq: number, duration = 0.09, volume = 0.045, type: OscillatorType = "triangle") {
  const audio = context();
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.stop(audio.currentTime + duration + 0.02);
}

export function setMuted(next: boolean) {
  muted = next;
  Howler.mute(next);
}

export function playLaunch() {
  tone(392, 0.08, 0.04);
  setTimeout(() => tone(523, 0.1, 0.035), 70);
}

export function playSuccess() {
  tone(523, 0.07, 0.04);
  setTimeout(() => tone(659, 0.12, 0.04), 80);
}

export function playFail() {
  tone(196, 0.16, 0.05, "sawtooth");
}

export function playMentor(mood: "idle" | "teach" | "cheer" | "warn" = "idle") {
  if (mood === "cheer") {
    tone(523, 0.06, 0.03);
    setTimeout(() => tone(784, 0.09, 0.028), 70);
    return;
  }
  if (mood === "warn") {
    tone(247, 0.08, 0.03, "triangle");
    setTimeout(() => tone(196, 0.1, 0.025, "triangle"), 90);
    return;
  }
  tone(330, 0.05, 0.025);
  setTimeout(() => tone(392, 0.07, 0.022), 60);
}
