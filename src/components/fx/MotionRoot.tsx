"use client";

import type { ReactNode } from "react";
import { LayoutGroup } from "framer-motion";

export function MotionRoot({ children }: { children: ReactNode }) {
  return <LayoutGroup id="rubyforge">{children}</LayoutGroup>;
}
