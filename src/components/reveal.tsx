"use client";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "30px" }}
      transition={{ duration: 0.45, delay }}
    >
      {children}
    </motion.div>
  );
}
