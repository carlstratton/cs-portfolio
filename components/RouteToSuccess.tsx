"use client";

import styles from "./RouteToSuccess.module.css";

const cards = [
  {
    id: "be-user-centric",
    iconSrc: "/icons/wondr/be-user-centric.svg",
    title: "BE USER CENTRIC",
    description:
      "To learn more about our users, their needs and where they spend time, thus allowing us to design better products to their needs.",
  },
  {
    id: "embrace-synthesis",
    iconSrc: "/icons/wondr/embrace-synthesis.svg",
    title: "EMBRACE SYNTHESIS",
    description:
      "Track learnings and problems in a systematic way that can be easily articulated to the organisation.",
  },
  {
    id: "focus-on-outcomes",
    iconSrc: "/icons/wondr/focus-on-outcomes.svg",
    title: "FOCUS ON OUTCOMES",
    description:
      "To transform Wondr Medical into an active, trusted space for medical collaboration.",
  },
];

export function RouteToSuccess() {
  return (
    <figure className={styles.root}>
      <div className={styles.row}>
        {cards.map((card) => (
          <div key={card.id} className={styles.card}>
            <div className={styles.cardIcon}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.iconSrc} alt="" width={40} height={40} aria-hidden />
            </div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
