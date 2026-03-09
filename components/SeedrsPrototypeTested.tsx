"use client";

import caseTypoStyles from "./CaseTypographicBlocks.module.css";
import styles from "./SeedrsPrototypeTested.module.css";

const zeigarnikIcon = "/icons/seedrs/zeigarnik-icon.svg";
const simplicityIcon = "/icons/seedrs/simplicity-ui.svg";

const reasons = [
  {
    id: "zeigarnik",
    iconSrc: zeigarnikIcon,
    title: "Zeigarnik effect",
    description:
      "A UX psychology principle that shows people remember and feel drawn to incomplete tasks more than finished ones. We applied it by framing each swipe as a fresh, unresolved decision: interest or dismissal. That cognitive tension kept users focused and motivated to continue through the feed.",
  },
  {
    id: "simplicity",
    iconSrc: simplicityIcon,
    title: "Simplicity in interface design",
    description:
      "Our design centered on simplicity and handing back control to the user, rendering the swipe interface a more user-friendly experience than a continuous scroll. By minimising confusion and easing cognitive effort, this strategy simplifies decision-making and elevates user contentment.",
  },
];

export function SeedrsPrototypeTested() {
  return (
    <figure className={styles.root}>
      <figcaption
        className={`${caseTypoStyles.identifiedLeadIn} ${styles.caption}`}
      >
        Why this prototype tested well
      </figcaption>
      <div className={styles.row}>
        {reasons.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.iconSrc} alt="" width={40} height={40} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDescription}>{item.description}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
