"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import { CaseLayoutTypographic } from "./CaseLayoutTypographic";
import { LazyHomeSection } from "./LazyHomeSection";
import styles from "./CaseStudyWithHomeTrigger.module.css";

interface Props {
  study: CaseStudy;
  studies: CaseStudy[];
}

export function CaseStudyWithHomeTrigger({ study, studies }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showHome, setShowHome] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [study.slug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const threshold = () => window.innerHeight * 0.5;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // Only show home when user has scrolled down (not at initial load).
        if (window.scrollY > threshold()) {
          setShowHome(true);
        }
      },
      { rootMargin: "400px", threshold: 0 }
    );

    const onScroll = () => {
      if (window.scrollY < threshold()) {
        setShowHome(false);
      }
    };

    observer.observe(sentinel);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <CaseLayoutTypographic study={study} />
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      {showHome && <LazyHomeSection studies={studies} />}
    </>
  );
}
