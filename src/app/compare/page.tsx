import type { Metadata } from "next";
import { Comparison } from "@/components/comparison";

export const metadata: Metadata = { title: "Compare repositories" };
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ left?: string | string[]; right?: string | string[] }> }) {
  const params = await searchParams;
  return <Comparison initialLeft={typeof params.left === "string" ? params.left.slice(0, 300) : ""} initialRight={typeof params.right === "string" ? params.right.slice(0, 300) : ""} />;
}
