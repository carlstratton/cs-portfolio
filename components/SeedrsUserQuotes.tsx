"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsUserQuotes.module.css";

const quotes = [
  "Being able to get rid of the ones I’m not interested in is great, otherwise you’re just scrolling through loads every time.",
  "I like that I can ditch the ones I know I’m not going to invest in and just focus on the few I might.",
  "Great! If it's not interesting to me, let me take it out. I just reached inbox zero!",
  "It’s nice not having to sort through loads of stuff every time just to find the ones I care about.",
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
