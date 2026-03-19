"use client";

import type { AIProject } from "@/types/aiProject";
import { AIProjectCard } from "./AIProjectCard";
import styles from "./AIProjectsSection.module.css";

export function AIProjectsSection({ projects }: { projects: AIProject[] }) {
  if (projects.length === 0) return null;

  return (
    <section className={styles.section} aria-label="AI Projects">
      <div className={styles.grid}>
        {projects.map((project) => (
          <AIProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
