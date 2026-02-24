import Link from "next/link";
import styles from "./CaseCard.module.css";
import type { CaseStudy } from "@/types/caseStudy";

interface Props {
  caseStudy: CaseStudy;
}

export function CaseCard({ caseStudy }: Props) {
  return (
    <Link href={`/work/${caseStudy.slug}`} className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.tag}>{caseStudy.tags.join(" · ")}</span>
        <span className={styles.time}>{caseStudy.timeframe}</span>
      </div>
      <h3>{caseStudy.title}</h3>
      <p>{caseStudy.summary}</p>
      <span className={styles.cta}>View case →</span>
    </Link>
  );
}
