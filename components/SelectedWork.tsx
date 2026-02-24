"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import { CaseCard } from "@/components/CaseCard";
import styles from "./SelectedWork.module.css";

const SHOW_WORK_EVENT = "cs-portfolio:show-work";

interface Props {
  studies: CaseStudy[];
  limit?: number;
}

export function SelectedWork({ studies, limit = 6 }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const items = useMemo(() => studies.slice(0, limit), [studies, limit]);

  useEffect(() => {
    const onShowWork = () => {
      setIsRevealed(true);
      setIsLoading(true);

      // Ensure the loader is visible before scrolling.
      requestAnimationFrame(() => {
        document
          .getElementById("work")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setIsLoading(false), 450);
    };

    window.addEventListener(SHOW_WORK_EVENT, onShowWork as EventListener);
    return () => {
      window.removeEventListener(SHOW_WORK_EVENT, onShowWork as EventListener);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!isRevealed) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      {isLoading ? (
        <div className={styles.loader} role="status" aria-live="polite">
          <div className={styles.loaderLabel}>Loading selected work…</div>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {items.map((study) => (
              <CaseCard key={study.slug} caseStudy={study} />
            ))}
          </div>
          <div className={styles.hint}>
            Want more detail? Open any case study for the full narrative.
          </div>
        </>
      )}
    </div>
  );
}

export { SHOW_WORK_EVENT };
