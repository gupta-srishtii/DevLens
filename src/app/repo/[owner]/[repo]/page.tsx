import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { repositorySchema } from "@/lib/repository";
import { Dashboard } from "@/components/dashboard";

type Props = { params: Promise<{ owner: string; repo: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  return { title: `${owner}/${repo} — Repository intelligence` };
}
export default async function RepositoryPage({ params }: Props) {
  const { owner, repo } = await params;
  const result = repositorySchema.safeParse(`${owner}/${repo}`);
  if (!result.success) notFound();
  return <Dashboard key={result.data.fullName} fullName={result.data.fullName} />;
}
