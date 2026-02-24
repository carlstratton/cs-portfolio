"use client";

import styles from "./DiagnosingRootCauses.module.css";

/** Health insurance / SME case study variant */
const healthTopCards = [
  {
    id: "user-interviews",
    iconSrc: "/icons/wondr/be-user-centric.svg",
    title: "USER INTERVIEWS",
    description:
      "We conducted 12 in-depth interviews with small business owners who use private health insurance. These conversations uncovered real decision drivers, frustrations, and trust barriers in the SME market.",
  },
  {
    id: "customer-survey",
    iconSrc: "/icons/wondr/testing-and-learning.svg",
    title: "CUSTOMER SURVEY",
    description:
      "600 existing Simply Business customers completed a detailed health insurance survey. This gave us quantitative validation around demand, price sensitivity, and purchase intent.",
  },
  {
    id: "competitive-benchmarking",
    iconSrc: "/icons/wondr/embrace-synthesis.svg",
    title: "COMPETITIVE BENCHMARKING",
    description:
      "We analysed the competitive landscape and existing SME health insurance products in depth. This clarified positioning gaps, pricing models, and where Simply Business could credibly compete.",
  },
];

const healthBottomCards = [
  {
    id: "interviews-survey",
    title: "Qualitative insights shaped quantitative validation",
    description:
      "Interview themes informed survey design, ensuring we tested the right assumptions with the right audience.",
    from: "user-interviews",
    to: "customer-survey",
  },
  {
    id: "survey-benchmarking",
    title: "Evidence informed positioning",
    description:
      "Survey results and competitive analysis together clarified where Simply Business could credibly compete.",
    from: "customer-survey",
    to: "competitive-benchmarking",
  },
];

/** Wondr Medical / root causes variant */
const wondrTopCards = [
  {
    id: "user-knowledge",
    iconSrc: "/icons/wondr/user-knowledge.svg",
    title: "USER KNOWLEDGE",
    description:
      "We were designing from our own perspective rather than our users'. Limited understanding of their needs kept us from building meaningful solutions.",
  },
  {
    id: "product-debt",
    iconSrc: "/icons/wondr/product-debt.svg",
    title: "PRODUCT DEBT",
    description:
      "Without real user insight, we built features that didn't solve our users' problems, leaving the product fragmented and confusing.",
  },
  {
    id: "testing-and-learning",
    iconSrc: "/icons/wondr/testing-and-learning.svg",
    title: "TESTING AND LEARNING",
    description:
      "Rising technical debt slowed experimentation and made it difficult for teams to test, learn, and adapt quickly.",
  },
];

const wondrBottomCards = [
  {
    id: "knowledge-debt",
    title: "Understanding informed product direction",
    description:
      "User insight revealed gaps between what we built and what doctors actually needed.",
    from: "user-knowledge",
    to: "product-debt",
  },
  {
    id: "debt-learning",
    title: "Debt reduction enabled faster experimentation",
    description:
      "Addressing technical and product debt allowed the team to test and learn more effectively.",
    from: "product-debt",
    to: "testing-and-learning",
  },
];

export type DiagnosingRootCausesVariant = "health" | "wondr";

export function DiagnosingRootCauses({
  variant = "health",
}: {
  variant?: DiagnosingRootCausesVariant;
}) {
  const topCards = variant === "wondr" ? wondrTopCards : healthTopCards;
  const bottomCards = variant === "wondr" ? wondrBottomCards : healthBottomCards;
  return (
    <figure className={styles.root}>
      <div className={styles.topRow}>
        {topCards.map((card) => (
          <div key={card.id} className={styles.card} id={card.id}>
            <div className={styles.cardIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.iconSrc} alt="" width={40} height={40} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
      <div className={styles.bottomRow}>
        {bottomCards.map((card) => (
          <div key={card.id} className={styles.linkCard}>
            <h4 className={styles.linkTitle}>{card.title}</h4>
            <p className={styles.linkDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
