"use client";

import styles from "./WondrMixedMediaGrid.module.css";

const leftImage = {
  src: "/case-studies/wondr-building-community-left.png",
  alt: "Interview snapshots (left)",
};

const rightImage = {
  src: "/case-studies/wondr-building-community-right.png",
  alt: "Interview snapshots (right)",
};

const leftCards = [
  {
    title: "Staying relevant",
    body: "I don't want have the time to work out the importance of academic content.",
    backgroundColor: "#EFE9F3",
    titleColor: "#784F9F",
  },
  {
    title: "Time sensitive",
    body: "I don’t have time to respond in large groups. I need smaller spaces where conversations actually move forward.",
    backgroundColor: "#FEFFC4",
    titleColor: "#EAC71A",
  },
  {
    title: "Staying relevant",
    body: "I avoid replying in big groups for fear of being shut down, especially on social media platforms",
    backgroundColor: "#FFF0E2",
    titleColor: "#F39335",
  },
] as const;

export function WondrMixedMediaGrid() {
  return (
    <figure className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.leftStack}>
          <div className={`${styles.tile} ${styles.leftImageTile}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.image}
              src={leftImage.src}
              alt={leftImage.alt}
              loading="lazy"
            />
          </div>

          {leftCards.map((card, index) => (
            <div
              key={index}
              className={`${styles.tile} ${styles.card}`}
              style={{ backgroundColor: card.backgroundColor }}
            >
              <h3
                className={styles.cardTitle}
                style={{ color: card.titleColor }}
              >
                {card.title}
              </h3>
              <p className={styles.cardBody}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.tile} ${styles.rightImageTile}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.rightImage}
            src={rightImage.src}
            alt={rightImage.alt}
            loading="lazy"
          />
        </div>
      </div>
    </figure>
  );
}

