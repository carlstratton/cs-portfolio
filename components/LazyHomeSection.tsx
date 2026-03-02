"use client";

import { Suspense, lazy, useRef, useState, useEffect } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import styles from "./LazyHomeSection.module.css";

const HomeLandingLazy = lazy(() =>
  import("./HomeLanding").then((m) => ({ default: m.HomeLanding }))
);
const HeaderLazy = lazy(() =>
  import("./Header").then((m) => ({ default: m.Header }))
);

interface Props {
  studies: CaseStudy[];
}

export function LazyHomeSection({ studies }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    import("./HomeLanding");
    import("./Header");
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { rootMargin: "800px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      {shouldLoad ? (
        <Suspense fallback={<div className={styles.placeholder} />}>
          <HeaderLazy />
          <main>
            <HomeLandingLazy
              studies={studies}
              embeddedInCaseStudy
              initialFlowOverride="projects"
            />
          </main>
        </Suspense>
      ) : (
        <div className={styles.placeholder} />
      )}
    </div>
  );
}
