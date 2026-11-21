import { cn } from "@/lib/utils";

export function Panel({ title, eyebrow, action, children, className }: { title?: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn("panel", className)}>{title && <div className="panel-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>}{children}</section>;
}
export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return <div className="empty-state">{icon}<h3>{title}</h3><p>{description}</p></div>;
}
export function ScopeNote({ children }: { children: React.ReactNode }) { return <p className="scope-note">{children}</p>; }
