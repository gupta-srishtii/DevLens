"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { compact, number } from "@/lib/utils";

export function Counter({ value, full = false }: { value: number; full?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible || reduced || !ref.current) return;
    const controls = animate(0, value, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current)
          ref.current.textContent = full ? number(Math.round(latest)) : compact(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, visible, reduced, full]);
  return (
    <>
      <span aria-hidden="true" ref={ref}>
        {full ? number(value) : compact(value)}
      </span>
      <span className="sr-only">{number(value)}</span>
    </>
  );
}
