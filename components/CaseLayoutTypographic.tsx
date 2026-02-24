/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseStudy } from "@/types/caseStudy";
import styles from "./CaseLayoutTypographic.module.css";
import { CaseTypographicStory } from "./CaseTypographicBlocks";

interface Props {
  study: CaseStudy;
}

export function CaseLayoutTypographic({ study }: Props) {
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <div className="page-shell">
        <header className={styles.header}>
          <div className={styles.nav}>
            <Link
              href="/?flow=projects#work"
              className={styles.backLink}
              onClick={(e) => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  e.preventDefault();
                  router.back();
                }
              }}
            >
              ← Back to work
            </Link>
          </div>

          <div className={styles.titleGrid}>
            <h1 className={styles.title}>{study.title}</h1>
            <p className={styles.summary}>{study.summary}</p>
          </div>
          {((study.company ?? study.client) || study.role?.length || study.sector || study.timeframe) && (
            <div className={styles.metaRow}>
              {(study.company ?? study.client) && (
                <span className={styles.metaItem}>
                  <strong>Company:</strong> {(study.company ?? study.client)}
                </span>
              )}
              {study.role?.length ? (
                <span className={styles.metaItem}>
                  <strong>Role:</strong> {study.role.join(", ")}
                </span>
              ) : null}
              {study.sector && (
                <span className={styles.metaItem}>
                  <strong>Sector:</strong> {study.sector}
                </span>
              )}
              {study.timeframe && (
                <span className={styles.metaItem}>
                  <strong>Year:</strong> {study.timeframe}
                </span>
              )}
            </div>
          )}
        </header>

        <main className={styles.main}>
          <div className={styles.hero}>
            <div className={styles.heroImageWrap}>
              <img src={study.hero} alt={study.title} />
            </div>
          </div>
          <CaseTypographicStory study={study} />
        </main>
      </div>
    </div>
  );
}

