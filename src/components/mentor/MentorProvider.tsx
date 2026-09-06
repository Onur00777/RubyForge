"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { playMentor } from "@/lib/audio";
import {
  isMentorMuted,
  resolveMentorLine,
  setMentorMuted,
  type MentorEvent,
} from "@/lib/mentor";
import type { MentorLine } from "@/content/mentor";

interface MentorContextValue {
  line: MentorLine | null;
  open: boolean;
  muted: boolean;
  speak: (event: MentorEvent) => void;
  dismiss: () => void;
  toggleMuted: () => void;
}

const MentorContext = createContext<MentorContextValue | null>(null);

export function MentorProvider({ children }: { children: ReactNode }) {
  const [line, setLine] = useState<MentorLine | null>(null);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMentorMuted());
  }, []);

  const speak = useCallback((event: MentorEvent) => {
    const next = resolveMentorLine(event);
    if (!next) return;
    setLine(next);
    setOpen(true);
    if (!isMentorMuted()) playMentor(next.mood);
  }, []);

  const dismiss = useCallback(() => setOpen(false), []);

  const toggleMuted = useCallback(() => {
    const next = !isMentorMuted();
    setMentorMuted(next);
    setMuted(next);
  }, []);

  const value = useMemo(
    () => ({ line, open, muted, speak, dismiss, toggleMuted }),
    [line, open, muted, speak, dismiss, toggleMuted],
  );

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>;
}

export function useMentor() {
  const ctx = useContext(MentorContext);
  if (!ctx) throw new Error("useMentor must be used within MentorProvider");
  return ctx;
}
