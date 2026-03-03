"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsPhase2Table.module.css";

const insightOpportunityPairs = [
  {
    insight:
      "Too many options overwhelm users, making choices hard and causing disengagement.",
    opportunity:
      "Create a streamlined experience that guides users to make informed decisions easily, reducing overwhelm and increasing engagement.",
  },
  {
    insight:
      "Users struggle to identify new vs. old content, reducing engagement and trust in the platform.",
    opportunity:
      "Develop clear indicators for new versus old content.",
  },
  {
    insight:
      "Users like to see most recent deals in a card view and would like to see top level critical information.",
    opportunity:
      "Create a card view that highlights essential information.",
  },
];

export function SeedrsPhase2Table() {
  return (
    <figure className={styles.root}>
      <figcaption
        className={`${caseTypoStyles.identifiedLeadIn} ${styles.caption}`}
      >
        Making sense of the opportunities
      </figcaption>
      <p className={styles.intro}>
        Evaluating opportunities involved combining Phase 1 research insights
        into actionable ideas, helping me create solid opportunities based on
        clear findings to move forward with the design process.
      </p>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span className={styles.columnHeader}>Customer insights</span>
          <span aria-hidden />
          <span className={`${styles.columnHeader} ${styles.columnHeaderOpportunities}`}>Opportunities</span>
        </div>
        {insightOpportunityPairs.map((pair, idx) => (
          <div key={idx} className={styles.row}>
            <div className={styles.block}>{pair.insight}</div>
            <span className={styles.arrow} aria-hidden>
              →
            </span>
            <div className={styles.block}>{pair.opportunity}</div>
          </div>
        ))}
      </div>
    </figure>
  );
}
