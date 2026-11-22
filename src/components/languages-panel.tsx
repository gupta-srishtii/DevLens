import { Braces } from "lucide-react";
import type { Analysis } from "@/lib/types";
import { Panel, EmptyState, ScopeNote } from "./ui/panel";

export function LanguagesPanel({ analysis }: { analysis: Analysis }) {
  const { languages, technologies } = analysis;
  return (
    <Panel
      title="The language of this project"
      eyebrow="CODE COMPOSITION"
      action={<Braces size={19} className="text-muted-foreground" />}
    >
      <p className="panel-description">A byte-level view of the codebase.</p>
      {languages?.length ? (
        <>
          <div className="language-bar" aria-label="Language composition">
            {languages.map((language) => (
              <span
                key={language.name}
                style={{ width: `${language.percentage}%`, background: language.color }}
                title={`${language.name}: ${language.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
          <ul className="language-legend">
            {languages.map((language) => (
              <li key={language.name}>
                <span className="language-dot" style={{ background: language.color }} />
                <span>{language.name}</span>
                <strong>
                  {language.percentage.toFixed(1)}
                  <span>%</span>
                </strong>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          title={languages ? "No languages detected" : "Languages unavailable"}
          description={
            languages
              ? "GitHub hasn't classified code in this repository."
              : "GitHub could not return the language breakdown."
          }
        />
      )}
      {technologies.length > 0 && (
        <div className="technology-section">
          <h3>
            Technology clues <span>ROOT FILE EVIDENCE</span>
          </h3>
          <div className="technology-tags">
            {technologies.map((technology) => (
              <span key={technology.name} title={`Detected from ${technology.evidence}`}>
                {technology.name}
                <code>{technology.evidence}</code>
              </span>
            ))}
          </div>
        </div>
      )}
      <ScopeNote>
        GitHub Linguist bytes, not line counts. Root file markers suggest tooling; dependencies are
        not inspected.
      </ScopeNote>
    </Panel>
  );
}
