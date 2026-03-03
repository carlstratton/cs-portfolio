"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsPrioritisation.module.css";

const priorities = [
  { order: 1, label: "Funding momentum" },
  { order: 2, label: "Tax eligibility" },
  { order: 3, label: "Time remaining" },
  { order: 4, label: "Social proof" },
  { order: 5, label: "Valuation & target" },
  { order: 6, label: "Brand & sector clarity" },
];

export function SeedrsPrioritisation() {
  return (
    <figure className={styles.root}>
      <figcaption className={`${caseTypoStyles.identifiedLeadIn} ${styles.caption}`}>
        How users prioritised card information
      </figcaption>
      <div className={styles.row}>
        {priorities.map((item) => (
          <div key={item.order} className={styles.block}>
            <span className={styles.order}>{item.order}</span>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.tabletImage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/case-studies/seedrs-prioritisation-tablet.png"
          alt="Seedrs platform on tablet showing campaign cards with funding momentum, tax eligibility, and other prioritised information"
        />
      </div>
    </figure>
  );
}
