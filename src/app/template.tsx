"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(14px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}
