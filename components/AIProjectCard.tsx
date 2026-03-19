"use client";

import type { AIProject } from "@/types/aiProject";
import { Badge3D } from "./Badge3D";
import styles from "./AIProjectCard.module.css";

function ExternalIcon() {
  return (
    <svg viewBox="0 0 356 356" aria-hidden="true" className={styles.storeLinkIcon}>
      <path d="M355.414 263.253C355.414 280.199 342.182 293.199 326.628 293.199C311.074 293.199 298.539 279.967 298.539 263.717V176.198L302.253 89.8401L265.11 131.394L50.6076 345.664C44.3397 351.932 37.1432 355.182 29.4824 355.182C13.9287 355.182 0 340.789 0 325.7C0 318.271 3.48217 310.61 9.51794 304.574L223.788 90.0723L265.342 53.1612L175.502 56.4113H91.233C75.215 56.4113 61.9827 43.8754 61.9827 28.5538C61.9827 13.0001 74.5186 0 91.6973 0H324.771C343.11 0 355.182 12.3037 355.182 30.411L355.414 263.253Z" />
    </svg>
  );
}

export function AIProjectCard({ project }: { project: AIProject }) {
  const content = (
    <>
      <div className={styles.badgeWrap} aria-hidden="true">
        <Badge3D
          className={styles.badgeCanvas}
          size={95}
          speed={0.0110}
          faceTextureSrc={project.badge}
          bodyColor={project.badgeBodyColor}
        />
      </div>
      <div className={styles.textBlock}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
        {project.href ? (
          <div className={styles.storeLink} aria-hidden="true">
            <span>View in App Store</span>
            <ExternalIcon />
          </div>
        ) : null}
      </div>
    </>
  );

  if (project.href) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.card}
        aria-label={project.title}
      >
        {content}
      </a>
    );
  }

  return <div className={styles.card}>{content}</div>;
}
