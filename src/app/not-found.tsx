import Link from "next/link";
import { Header } from "@/components/navigation";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return <><Header /><main id="main" className="analysis-failure"><p className="eyebrow">404 / OFF THE MAP</p><h1>This view doesn’t exist.</h1><p>Return to the workspace and start with a public repository.</p><Button asChild><Link href="/">Explore repositories</Link></Button></main></>;
}
