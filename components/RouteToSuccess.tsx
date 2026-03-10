"use client";

import styles from "./RouteToSuccess.module.css";

const cardsDefault = [
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

const cardsInsights = [
  {
    id: "current-solution-unfit",
    iconSrc: "/icons/wondr/current-solution-unfit.svg",
    title: "Current solution unfit",
    description:
      "90% of physicians rely on WhatsApp for second opinions, despite recognising it as not being fit for purpose and non-compliant.",
  },
  {
    id: "top-down-not-appealing",
    iconSrc: "/icons/wondr/top-down-not-appealing.svg",
    title: "Top down not appealing",
    description:
      "Adoption resistance is high when new tools are introduced top-down through hospital trusts, physicians prefer peer-driven solutions.",
  },
  {
    id: "follow-on-conversation",
    iconSrc: "/icons/wondr/conversation.svg",
    title: "Follow-on conversation",
    description:
      "Doctors often initiate professional discussions on social platforms but want to continue them in secure, private spaces designed for clinical exchange.",
  },
];

export function RouteToSuccess({ variant }: { variant?: "insights" }) {
  const cards = variant === "insights" ? cardsInsights : cardsDefault;
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
