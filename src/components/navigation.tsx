"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Github, GitCompareArrows, LayoutDashboard, Menu, X, ScanLine } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="site-header-inner"><Brand /><nav id="mobile-nav" className={open ? "landing-nav open" : "landing-nav"} aria-label="Main navigation"><Link href="/#explore" onClick={() => setOpen(false)}>Explore</Link><Link href="/compare" onClick={() => setOpen(false)}>Compare</Link><Link href="/methodology" onClick={() => setOpen(false)}>Our methodology</Link></nav><div className="header-actions"><a className="github-link" href="https://github.com/gupta-srishtii/DevLens" target="_blank" rel="noreferrer"><Github size={17} />Star on GitHub</a><Button variant="ghost" size="icon" className="mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</Button></div></div></header>;
}

export function AppShell({ children, repository }: { children: React.ReactNode; repository?: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [{ href: "/", label: "Explore repositories", icon: <ScanLine size={18} /> }, { href: repository ? `/repo/${repository}` : "/#explore", label: "Repository overview", icon: <LayoutDashboard size={18} /> }, { href: "/compare", label: "Compare repositories", icon: <GitCompareArrows size={18} /> }, { href: "/methodology", label: "Methodology", icon: <BookOpen size={18} /> }];
  return <div className="app-shell"><aside className={`sidebar ${open ? "is-open" : ""}`}><Brand /><p className="sidebar-label">WORKSPACE</p><nav aria-label="Workspace navigation" id="workspace-navigation">{links.map((link) => { const active = path === link.href; return <Link key={link.label} href={link.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`sidebar-link ${active ? "active" : ""}`}>{active && <motion.span layoutId="sidebar-active" className="sidebar-active" />}{link.icon}<span>{link.label}</span></Link>; })}</nav><div className="sidebar-bottom"><div className="source-card"><Github size={19} /><strong>Built on open source.</strong><p>Real GitHub data.<br />A little more perspective.</p><a href="https://github.com/gupta-srishtii/DevLens" target="_blank" rel="noreferrer">View the source</a></div><span className="sidebar-version">DevLens <span>v1.0</span></span></div></aside><div className="app-main"><header className="app-topbar"><Button className="mobile-toggle" variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-controls="workspace-navigation" aria-expanded={open} aria-label={open ? "Close workspace navigation" : "Open workspace navigation"}>{open ? <X /> : <Menu />}</Button><span className="breadcrumb">Workspace <span>/</span> <strong>{repository ?? (path === "/compare" ? "Compare" : "Methodology")}</strong></span><span className="topbar-note"><Github size={15} />Public repository intelligence</span></header><main id="main" className="workspace-content">{children}</main><footer className="app-footer"><span>A little more clarity. A lot less digging.</span><Link href="/methodology">Data & methodology</Link></footer></div></div>;
}
