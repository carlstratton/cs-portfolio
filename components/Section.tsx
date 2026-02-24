import { ReactNode } from "react";
import styles from "./Section.module.css";

interface Props {
  id?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function Section({ id, kicker, title, subtitle, children }: Props) {
  const hasHeader = Boolean(kicker || title || subtitle);

  return (
    <section id={id} className={styles.section}>
      <div className="page-shell">
        {hasHeader && (
          <div className={styles.header}>
            {kicker && <span className={styles.kicker}>{kicker}</span>}
            {title && <h2>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
