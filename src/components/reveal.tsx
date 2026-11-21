"use client";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "30px" }} transition={{ duration: .45, delay }}>{children}</motion.div>;
}
