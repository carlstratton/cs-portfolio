"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsResearchInsights.module.css";

const insights = [
  {
    sentiment: "negative" as const,
    label: "Negative",
    quotes: [
      "I don't want to see investments I'm not interested in",
      "I don't want to dig through extra material to make decision.",
      "I dont invest in badly branded businesses",
    ],
  },
  {
    sentiment: "uncertain" as const,
    label: "Uncertain",
    quotes: [
      "Some of the information feels irrelevant.",
      "It's not always clear what I should look at next to help me decide.",
      "I follow a business at the start of a campaign then wait until the end to make a decision",
    ],
  },
  {
    sentiment: "positive" as const,
    label: "Positive",
    quotes: [
      "I prefer scanning opportunities in a clear card layout.",
      "If the key signals are visible on the card, I know quickly whether it's worth exploring.",
      "I use signals like 'closing soon' to prioritise what to look at first.",
    ],
  },
];

export function SeedrsResearchInsights() {
  return (
    <figure className={styles.root}>
      <figcaption className={`${caseTypoStyles.identifiedLeadIn} ${styles.caption}`}>
        Research insights
      </figcaption>
      <div className={styles.chart}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/case-studies/seedrs-sentiment-chart.png"
          alt="Sentiment scale from negative to positive"
          width={761}
          height={341}
        />
      </div>
      <div className={styles.row}>
        {insights.map((column) => (
          <div key={column.sentiment} className={styles.column}>
            <h4 className={styles.columnLabel}>{column.label}</h4>
            <div className={styles.blockGroup}>
              {column.quotes.map((quote, idx) => (
                <div
                  key={idx}
                  className={`${styles.block} ${styles[column.sentiment]}`}
                >
                  &ldquo;{quote}&rdquo;
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
