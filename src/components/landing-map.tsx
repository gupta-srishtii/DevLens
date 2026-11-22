"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  Braces,
  FileCode2,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Users,
} from "lucide-react";
import { useRef } from "react";

export function LandingMap() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [16, -16]);
  return (
    <motion.div
      ref={ref}
      className="landing-map"
      style={{ y: reduced ? 0 : y }}
      aria-label="Illustration: DevLens connects code, activity, people, and maintenance signals. No live metrics shown."
    >
      <div className="map-topline">
        <span>
          <span className="map-cross">+</span> A REPOSITORY, REVEALED
        </span>
        <span>360° VIEW</span>
      </div>
      <div className="map-grid" aria-hidden="true">
        <svg className="map-connections" viewBox="0 0 560 390" fill="none">
          <circle cx="280" cy="193" r="125" stroke="#26354a" strokeDasharray="3 7" />
          <circle cx="280" cy="193" r="77" stroke="#26354a" />
          <path
            d="M280 193 108 108M280 193l168-85M280 193 108 294M280 193l168 101M280 193v-118M280 193v139"
            stroke="#3d6b78"
            strokeWidth="1.2"
          />
          <circle cx="280" cy="193" r="155" stroke="#14273a" />
        </svg>
        <div className="map-core">
          <Braces size={35} strokeWidth={1.4} />
          <span>your repository</span>
        </div>
        <div className="map-node node-code">
          <FileCode2 />
          <span>Codebase</span>
        </div>
        <div className="map-node node-people">
          <Users />
          <span>Contributors</span>
        </div>
        <div className="map-node node-activity">
          <GitCommitHorizontal />
          <span>Activity</span>
        </div>
        <div className="map-node node-pulls">
          <GitPullRequest />
          <span>Collaboration</span>
        </div>
        <span className="map-branch branch-top">
          <GitBranch size={18} />
        </span>
        <span className="map-branch branch-bottom">
          <GitBranch size={18} />
        </span>
        <span className="map-orbit-dot" />
      </div>
      <div className="map-bottomline">
        <span className="tiny-code">&lt; / &gt;</span> One URL. The whole picture.
        <span className="map-coordinates">OPEN SOURCE, IN FOCUS</span>
      </div>
    </motion.div>
  );
}
