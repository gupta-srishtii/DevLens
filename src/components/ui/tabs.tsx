"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { useId } from "react";

export function Tabs({
  value,
  onValueChange,
  items,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string; icon?: React.ReactNode }[];
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange}>
      <TabsPrimitive.List className="tab-list" aria-label="Repository analysis sections">
        {items.map((item) => (
          <TabsPrimitive.Trigger key={item.value} value={item.value} className="tab-trigger">
            {item.icon}
            {item.label}
            {value === item.value && (
              <motion.span
                className="tab-indicator"
                layoutId={`tab-${id}`}
                transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
              />
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}
export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsPrimitive.Content value={value} className="tab-content">
      {children}
    </TabsPrimitive.Content>
  );
}
