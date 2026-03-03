"use client";

import styles from "./SeedrsSwipeBenefits.module.css";

const benefits = [
  {
    id: "rewards",
    title: "Variable rewards",
    description:
      "Wins from swiping enhance excitement and engagement.",
  },
  {
    id: "enjoyment",
    title: "Enjoyment and exploration",
    description:
      "Gratifying swipes boost pleasure, motivating continued use.",
  },
  {
    id: "overwhelm",
    title: "Less overwhelm",
    description:
      "Swiping cuts decision stress, making the app more engaging.",
  },
];

export function SeedrsSwipeBenefits() {
  return (
    <div className={styles.row}>
      {benefits.map((item) => (
        <div key={item.id} className={styles.block}>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.description}>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
