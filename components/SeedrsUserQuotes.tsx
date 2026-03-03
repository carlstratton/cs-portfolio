"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsUserQuotes.module.css";

const quotes = [
  "Getting rid of the investments I'm not interested in is important due to decision-making fatigue",
  "I really like it, I like the idea of getting rid of the ones I know I'm not going to invest in, and focusing on the ones I might",
  "Great! If it's not interesting to me, let me take it out",
  "I like the idea of not having to sort through the chaff everytime to get to the ones i'm interested in…",
];

export function SeedrsUserQuotes() {
  return (
    <figure className={styles.root}>
      <figcaption
        className={`${caseTypoStyles.identifiedLeadIn} ${styles.caption}`}
      >
        What our users said
      </figcaption>
      <div className={styles.row}>
        {quotes.map((quote, idx) => (
          <div key={idx} className={styles.block}>
            &ldquo;{quote}&rdquo;
          </div>
        ))}
      </div>
    </figure>
  );
}
