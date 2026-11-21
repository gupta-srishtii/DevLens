import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workbench.css";
import { MotionProvider } from "@/components/motion-provider";

export const metadata: Metadata = {
  title: { default: "DevLens — See beyond the code", template: "%s · DevLens" },
  description: "Understand any public GitHub repository. Explore code, activity, contributors, and transparent health signals in one thoughtful workspace.",
};
export const viewport: Viewport = { themeColor: "#080e1a", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a><MotionProvider>{children}</MotionProvider></body></html>;
}
