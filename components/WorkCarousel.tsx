"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import styles from "./WorkCarousel.module.css";

interface Props {
  studies: CaseStudy[];
}

const SPEED_PX_PER_SEC = 22;

export function WorkCarousel({ studies }: Props) {
  const items = [...studies, ...studies];
  const shellRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const dragStateRef = useRef({
    startX: 0,
    startOffset: 0,
    isDragging: false,
    moved: false,
    pointerId: null as number | null,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const normalizeOffset = (offset: number, loopWidth: number) => {
    if (!loopWidth) return offset;
    const wrapped = ((offset % loopWidth) + loopWidth) % loopWidth;
    return wrapped - loopWidth;
  };

  useEffect(() => {
    let frameId = 0;

    const animate = (time: number) => {
      const row = rowRef.current;
      if (!row) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const rowWidth = row.scrollWidth;
      const loopWidth = rowWidth / 2;

      const paused = isHovered || dragStateRef.current.isDragging;
      if (!paused) {
        offsetRef.current -= (SPEED_PX_PER_SEC * delta) / 1000;
        offsetRef.current = normalizeOffset(offsetRef.current, loopWidth);
      }

      row.style.transform = `translateX(${offsetRef.current}px)`;
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const header = document.querySelector("header");
    if (!header) return;
    const headerInner = header.querySelector("[data-header-inner]");
    const headerShell = header.querySelector("[data-header-shell]");
    if (!headerInner) return;
    let frameId = 0;

    const updateThemeOverride = () => {
      frameId = 0;
      const headerInnerRect = headerInner.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const headerInnerBottom = headerInnerRect.bottom;
      const isIntersecting =
        headerInnerBottom >= shellRect.top &&
        headerInnerBottom <= shellRect.bottom;
      const hasScrolled = window.scrollY > 0;

      if (hasScrolled && isIntersecting) {
        header.setAttribute("data-theme-override", "dark");
        headerShell?.setAttribute("data-theme-override", "dark");
      } else {
        header.removeAttribute("data-theme-override");
        headerShell?.removeAttribute("data-theme-override");
      }
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(updateThemeOverride);
    };

    updateThemeOverride();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      header.removeAttribute("data-theme-override");
      headerShell?.removeAttribute("data-theme-override");
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    dragStateRef.current = {
      startX: event.clientX,
      startOffset: offsetRef.current,
      isDragging: false,
      moved: false,
      pointerId: event.pointerId,
    };
    setIsDragging(false);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - dragStateRef.current.startX;
    if (Math.abs(delta) > 4) {
      dragStateRef.current.moved = true;
      if (!dragStateRef.current.isDragging) {
        rowRef.current?.setPointerCapture(event.pointerId);
        dragStateRef.current.isDragging = true;
        setIsDragging(true);
      }
    }
    if (!dragStateRef.current.isDragging) return;
    const loopWidth = rowRef.current?.scrollWidth
      ? rowRef.current.scrollWidth / 2
      : 0;
    offsetRef.current = normalizeOffset(
      dragStateRef.current.startOffset + delta,
      loopWidth
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }
    if (row && row.hasPointerCapture(event.pointerId)) {
      row.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current.isDragging = false;
    dragStateRef.current.pointerId = null;
    setIsDragging(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (dragStateRef.current.moved) {
      event.preventDefault();
    }
  };

  return (
    <div className={styles.fullBleed}>
      <div className={styles.shell} ref={shellRef}>
        <div className={styles.header}>
          <h2>Selected works</h2>
          <p>
            Case studies and product stories spanning fintech, healthcare, and
            research.
          </p>
        </div>
        <div
          className={styles.track}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={rowRef}
            className={styles.row}
            data-dragging={isDragging}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          >
            {items.map((study, index) => (
              <Link
                key={`${study.slug}-${index}`}
                className={styles.card}
                href={`/work/${study.slug}`}
                onClick={handleClick}
              >
                <div className={styles.imageWrap}>
                  <Image
                    src={study.hero}
                    alt={study.title}
                    fill
                    sizes="(max-width: 640px) 320px, (max-width: 900px) 420px, 520px"
                    quality={100}
                    draggable={false}
                  />
                </div>
                <div className={styles.meta}>
                  <span className={styles.title}>{study.title}</span>
                  <span className={styles.summary}>{study.summary}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
