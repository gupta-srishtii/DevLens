import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./workbench.css";
import { MotionProvider } from "@/components/motion-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: { default: "DevLens — See beyond the code", template: "%s · DevLens" },
  description:
    "Understand any public GitHub repository. Explore code, activity, contributors, and transparent health signals in one thoughtful workspace.",
  openGraph: {
    title: "DevLens — See beyond the code",
    description: "Public GitHub repository intelligence with transparent analytics.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "DevLens — See beyond the code" },
};
export const viewport: Viewport = { themeColor: "#080e1a", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
