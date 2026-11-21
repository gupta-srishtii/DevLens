import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4", {
  variants: { variant: {
    default: "bg-primary text-[#071c23] hover:bg-[#a0f2ec]",
    outline: "border border-border bg-[#111b2b] text-foreground hover:border-[#52627b] hover:bg-[#172337]",
    ghost: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
  }, size: { default: "py-2.5", sm: "min-h-9 px-3 py-1.5", icon: "size-11 p-0" } },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };
