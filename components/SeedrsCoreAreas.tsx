"use client";

import styles from "./SeedrsCoreAreas.module.css";

const coreAreas = [
  {
    id: "user-interaction",
    title: "User interaction analysis",
    description:
      "To deeply understand user engagement with 'raising now' and campaigns pages.",
  },
  {
    id: "decision-making",
    title: "Decision-making processes",
    description:
      "To understand the thought process behind users' investment decisions, focusing on influential factors.",
  },
  {
    id: "valuation",
    title: "Valuation of information",
    description:
      "Assess the importance of page information to users, its effect on their decisions, and how to improve content relevance.",
  },
];

export function SeedrsCoreAreas() {
  return (
    <figure className={styles.root}>
      <div className={styles.row}>
        {coreAreas.map((card) => (
          <div key={card.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
