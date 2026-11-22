import Link from "next/link";
import {
  Activity,
  Braces,
  Check,
  FileSearch,
  GitCompareArrows,
  Github,
  Layers3,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Header } from "./navigation";
import { RepoInput } from "./repo-input";
import { Reveal } from "./reveal";
import { LandingMap } from "./landing-map";
import { Brand } from "./brand";
import { Button } from "./ui/button";

const features = [
  {
    icon: <Layers3 />,
    tag: "THE CODE",
    title: "Find your bearings.",
    description:
      "Explore the languages, technology clues, file structure, and documentation that make a repository what it is.",
    detail: "Language breakdown · File explorer · README insights",
  },
  {
    icon: <Activity />,
    tag: "THE MOMENTUM",
    title: "Read between the commits.",
    description:
      "See recent development, meet the contributors, and understand how issues and pull requests move through the project.",
    detail: "Commit activity · Contributors · Collaboration",
  },
  {
    icon: <ShieldCheck />,
    tag: "THE CONTEXT",
    title: "Signals you can question.",
    description:
      "An explainable maintenance checklist. Every indicator has a source, every score has a reason, every sample has a label.",
    detail: "Transparent methodology · Portable reports",
  },
];
export function Landing() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero section-wrap" id="explore">
          <Reveal className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" /> REPOSITORY INTELLIGENCE, RECONSIDERED
            </div>
            <h1>
              See beyond
              <br />
              the{" "}
              <span className="hero-code-word">
                code<span className="cyan-period">.</span>
              </span>
            </h1>
            <p className="hero-description">
              Every repository has a story.
              <br />
              Understand its code, its people, and its momentum —<br className="desktop-break" />{" "}
              before your next deep dive.
            </p>
            <div className="hero-tags">
              <span>
                <Check size={14} />
                Public repositories
              </span>
              <span>
                <Check size={14} />
                No sign-in needed
              </span>
              <span>
                <Check size={14} />
                Real GitHub data
              </span>
            </div>
          </Reveal>
          <Reveal className="hero-visual" delay={0.15}>
            <LandingMap />
          </Reveal>
          <Reveal className="hero-search" delay={0.2}>
            <div className="search-heading">
              <ScanLine size={16} />
              <span>Start with a repository. Leave with perspective.</span>
            </div>
            <RepoInput />
            <div className="try-repos">
              <span>TAKE A LOOK AT</span>
              <Link href="/repo/vercel/next.js">vercel / next.js</Link>
              <Link href="/repo/facebook/react">facebook / react</Link>
              <Link href="/repo/oven-sh/bun">oven-sh / bun</Link>
            </div>
          </Reveal>
        </section>
        <div className="landing-divider section-wrap">
          <span>LESS TAB SWITCHING. MORE UNDERSTANDING.</span>
          <div />
          <Braces size={20} />
        </div>
        <section className="section-wrap features-section">
          <Reveal className="section-intro">
            <p className="eyebrow">FROM FIRST LOOK TO DEEP DIVE</p>
            <h2>
              The context your
              <br />
              next decision deserves.
            </h2>
            <p>
              Choosing a dependency? Exploring a codebase?
              <br />
              Get a thoughtful first look, all in one place.
            </p>
          </Reveal>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <Reveal key={feature.tag} delay={index * 0.08}>
                <article className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <p className="eyebrow">{feature.tag}</p>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-detail">{feature.detail}</div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section-wrap workflow-section">
          <Reveal className="workflow-copy">
            <span className="eyebrow">A SMALLER WORKFLOW</span>
            <h2>
              One link.
              <br />A clearer picture.
            </h2>
            <p>
              Paste a public GitHub URL. We bring the important pieces together, with the details to
              back them up.
            </p>
            <Button asChild variant="outline">
              <Link href="/methodology">
                <FileSearch />
                See how we measure
              </Link>
            </Button>
          </Reveal>
          <div className="workflow-steps">
            {[
              {
                icon: <Github />,
                title: "Bring a repository",
                text: "Any accessible public project. No account, token, or setup required to begin.",
              },
              {
                icon: <ScanLine />,
                title: "Follow your curiosity",
                text: "Move from the overview into code, documentation, activity, and collaboration.",
              },
              {
                icon: <GitCompareArrows />,
                title: "Make an informed call",
                text: "Compare two projects or export an analysis, complete with sources and caveats.",
              },
            ].map((step) => (
              <Reveal key={step.title}>
                <article className="workflow-step">
                  <div>{step.icon}</div>
                  <section>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </section>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section-wrap compare-cta">
          <Reveal>
            <div className="cta-icon">
              <GitCompareArrows />
            </div>
            <p className="eyebrow">TWO REPOSITORIES. ONE PERSPECTIVE.</p>
            <h2>
              Decisions look better
              <br />
              side by side.
            </h2>
            <p>
              Compare the same signals with the same methodology.
              <br />
              Find the tradeoffs that matter to you.
            </p>
            <Button asChild>
              <Link href="/compare">
                <GitCompareArrows />
                Compare repositories
              </Link>
            </Button>
          </Reveal>
        </section>
      </main>
      <footer className="landing-footer section-wrap">
        <Brand />
        <p>Built for the curious. Powered by GitHub.</p>
        <Link href="/methodology">Data & methodology</Link>
        <a
          href="https://github.com/gupta-srishtii/DevLens"
          aria-label="DevLens source on GitHub"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={20} />
        </a>
      </footer>
    </>
  );
}
