/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import styles from "./CaseLayoutTypographic.module.css";
import { CaseTypographicStory } from "./CaseTypographicBlocks";

interface Props {
  study: CaseStudy;
  embedded?: boolean;
  embeddedHeaderRef?: RefObject<HTMLElement | null>;
}

export function CaseLayoutTypographic({
  study,
  embedded = false,
  embeddedHeaderRef,
}: Props) {
  const router = useRouter();
  const backHref = `/?study=${study.slug}`;
  const [viewMode, setViewMode] = useState<"full" | "summary">("full");

  useEffect(() => {
    setViewMode("full");
  }, [study.slug]);

  const content = (
    <>
      <header
        ref={embedded ? embeddedHeaderRef : undefined}
        className={styles.header}
        data-embedded-header={embedded || undefined}
      >
        {!embedded ? (
          <div className={styles.nav}>
            <Link
              href={backHref}
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
        ) : null}

        <div className={styles.titleGrid}>
          <h1 className={styles.title}>{study.title}</h1>
          <p className={styles.summary}>{study.summary}</p>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <strong>View:</strong>
            <select
              className={styles.metaNativeSelect}
              aria-label="Case study view"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "full" | "summary")}
            >
              <option value="full">Full case study</option>
              <option value="summary">Quick read</option>
            </select>
          </span>
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
      </header>

      <main className={styles.main}>
        {viewMode === "full" ? (
          <div className={styles.hero}>
            <div className={styles.heroImageWrap}>
              <img src={study.hero} alt={study.title} />
            </div>
          </div>
        ) : null}
        <CaseTypographicStory study={study} mode={viewMode} />
      </main>
    </>
  );

  return (
    <div className={styles.wrap} data-embedded={embedded}>
      {embedded ? content : <div className="page-shell">{content}</div>}
    </div>
  );
}

