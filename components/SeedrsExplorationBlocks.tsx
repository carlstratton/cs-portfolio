"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsExplorationBlocks.module.css";

const explorationAreas = [
  {
    id: "following",
    title: "Following interactions",
    description:
      "Explore how users interact with to enhance engagement and community features.",
  },
  {
    id: "patterns",
    title: "Patterns around saving",
    description:
      "Study how users save and revisit content to improve bookmarking functions.",
  },
  {
    id: "organising",
    title: "Organising content",
    description:
      "Investigate user preferences for content organisation to design better management tools.",
  },
];

export function SeedrsExplorationBlocks() {
  return (
    <figure className={styles.root}>
      <div className={styles.row}>
        {explorationAreas.map((card) => (
          <div key={card.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
