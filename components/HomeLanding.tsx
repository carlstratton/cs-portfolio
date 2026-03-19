"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AIProjectsSection } from "@/components/AIProjectsSection";
import type { CaseStudy } from "@/types/caseStudy";
import { Assistant, type AssistantIntent } from "@/components/Assistant";
import assistantStyles from "@/components/Assistant.module.css";
import { getAIProjects } from "@/lib/ai-projects";
import heroStyles from "../app/page.module.css";
import styles from "./HomeLanding.module.css";

const HERO_EXIT_MS = 420;
const EMAIL = "cgstratton+website@gmail.com";
const MAILTO = `mailto:${EMAIL}`;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

type RectLike = { top: number; left: number; width: number; height: number };

let scrollBehaviorLockCount = 0;
let previousInlineScrollBehavior: string | null = null;

function lockSmoothScroll() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  scrollBehaviorLockCount += 1;
  if (scrollBehaviorLockCount === 1) {
    previousInlineScrollBehavior = root.style.scrollBehavior;
    // Force "auto" so the browser doesn't apply ease-in/out smoothing
    // to our constant-speed rAF-based scroll.
    root.style.scrollBehavior = "auto";
  }
}

function unlockSmoothScroll() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  scrollBehaviorLockCount = Math.max(0, scrollBehaviorLockCount - 1);
  if (scrollBehaviorLockCount === 0) {
    root.style.scrollBehavior = previousInlineScrollBehavior ?? "";
    previousInlineScrollBehavior = null;
  }
}

/** Cubic ease-out: quicker start, softer landing (t ∈ [0, 1]). */
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Scroll so `el` lines up with the top of the viewport.
 * Duration scales with distance (`pxPerSecond` + min/max caps); motion is ease-out, not linear.
 */
function scrollToElementEaseOut(
  el: HTMLElement,
  opts?: { pxPerSecond?: number; minMs?: number; maxMs?: number }
) {
  const pxPerSecond = opts?.pxPerSecond ?? 1200;
  const minMs = opts?.minMs ?? 450;
  const maxMs = opts?.maxMs ?? 1200;
  const startY = window.scrollY;
  const targetY = window.scrollY + el.getBoundingClientRect().top;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) return;

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    return;
  }

  lockSmoothScroll();
  const durationMs = Math.max(
    minMs,
    Math.min(maxMs, (Math.abs(delta) / pxPerSecond) * 1000)
  );

  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutCubic(t);
    window.scrollTo(0, startY + delta * eased);
    if (t < 1) requestAnimationFrame(step);
    else unlockSmoothScroll();
  };
  requestAnimationFrame(step);
}

const LABELS: Record<AssistantIntent, string> = {
  projects: "See selected projects",
  about: "Tell me about Carl",
  contact: "Make contact",
};

type Turn = {
  id: string;
  intent: AssistantIntent;
  label: string;
};

const ALLOWED_INTENTS: AssistantIntent[] = ["projects", "about", "contact"];

function parseFlowString(flow: string): AssistantIntent[] {
  const parts = flow.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.filter((p): p is AssistantIntent => ALLOWED_INTENTS.includes(p as AssistantIntent));
}

export function HomeLanding({
  studies,
  embeddedInCaseStudy = false,
  initialFlowOverride,
}: {
  studies: CaseStudy[];
  embeddedInCaseStudy?: boolean;
  initialFlowOverride?: string;
}) {
  const searchParams = useSearchParams();
  const items = useMemo(() => studies.slice(0, 5), [studies]);
  const aiProjects = useMemo(() => getAIProjects(), []);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [chipsDocked, setChipsDocked] = useState(false);
  const [dockVisible, setDockVisible] = useState(false);
  const [newTurnId, setNewTurnId] = useState<string | null>(null);
  const [revealedTurnId, setRevealedTurnId] = useState<string | null>(null);
  const [workJustRevealed, setWorkJustRevealed] = useState(false);
  const [heroPhase, setHeroPhase] = useState<"idle" | "exiting" | "gone">("idle");
  const [heroActiveIntent, setHeroActiveIntent] = useState<AssistantIntent | null>(null);
  const [firstIntroTurnId, setFirstIntroTurnId] = useState<string | null>(null);

  const chipsWrapRef = useRef<HTMLDivElement | null>(null);
  const suppressFlowHydrationRef = useRef(false);
  const turnIdRef = useRef(0);
  const turnsRef = useRef<Turn[]>([]);
  const newTurnTimerRef = useRef<number | null>(null);
  const firstIntroTimerRef = useRef<number | null>(null);
  const heroExitTimerRef = useRef<number | null>(null);
  const revealedTurnTimerRef = useRef<number | null>(null);
  const workRevealTimerRef = useRef<number | null>(null);
  const showProjectsRef = useRef(showProjects);

  useLayoutEffect(() => {
    return () => {
      if (newTurnTimerRef.current) window.clearTimeout(newTurnTimerRef.current);
      if (firstIntroTimerRef.current) window.clearTimeout(firstIntroTimerRef.current);
      if (heroExitTimerRef.current) window.clearTimeout(heroExitTimerRef.current);
      if (revealedTurnTimerRef.current) window.clearTimeout(revealedTurnTimerRef.current);
      if (workRevealTimerRef.current) window.clearTimeout(workRevealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    showProjectsRef.current = showProjects;
  }, [showProjects]);

  const markNewTurn = (id: string) => {
    setNewTurnId(id);
    if (newTurnTimerRef.current) window.clearTimeout(newTurnTimerRef.current);
    // Keep this on long enough for delayed CSS animations to finish.
    newTurnTimerRef.current = window.setTimeout(() => setNewTurnId(null), 720);
  };

  const markRevealedTurn = (id: string) => {
    setRevealedTurnId(id);
    if (revealedTurnTimerRef.current) window.clearTimeout(revealedTurnTimerRef.current);
    revealedTurnTimerRef.current = window.setTimeout(() => setRevealedTurnId(null), 380);
  };

  const markWorkRevealed = () => {
    setWorkJustRevealed(true);
    if (workRevealTimerRef.current) window.clearTimeout(workRevealTimerRef.current);
    workRevealTimerRef.current = window.setTimeout(() => setWorkJustRevealed(false), 420);
  };

  const parseFlowFromUrl = useMemo(() => {
    const raw = searchParams.get("flow");
    const legacyIntent = searchParams.get("intent");
    const parts =
      raw?.split(",").map((s) => s.trim()).filter(Boolean) ??
      (legacyIntent ? [legacyIntent] : []);
    const allowed: AssistantIntent[] = ["projects", "about", "contact"];
    const next: AssistantIntent[] = [];
    for (const part of parts) {
      if (!allowed.includes(part as AssistantIntent)) continue;
      next.push(part as AssistantIntent);
    }
    return next;
  }, [searchParams]);

  const writeFlowToUrl = (nextFlow: AssistantIntent[], suppressHydration: boolean) => {
    if (embeddedInCaseStudy) return;
    try {
      if (suppressHydration) suppressFlowHydrationRef.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete("intent");
      if (nextFlow.length) url.searchParams.set("flow", nextFlow.join(","));
      else url.searchParams.delete("flow");
      // Important: don't set `#work` until the work section is actually revealed.
      window.history.replaceState({}, "", url);
    } catch {
      // ignore
    }
  };

  const nextTurnId = () => {
    turnIdRef.current += 1;
    return `turn-${turnIdRef.current}`;
  };

  // Next's recommended pattern is to react to querystring changes via `useSearchParams`.
  // When embedded in case study, use initialFlowOverride instead of URL.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const nextFlow =
      embeddedInCaseStudy && initialFlowOverride
        ? parseFlowString(initialFlowOverride)
        : parseFlowFromUrl;
    if (suppressFlowHydrationRef.current) {
      // We wrote `flow=` ourselves to persist browser-back state; ignore one re-hydration tick.
      suppressFlowHydrationRef.current = false;
      return;
    }

    if (!nextFlow.length) {
      setTurns([]);
      setShowProjects(false);
      setChipsDocked(false);
      setDockVisible(false);
      setNewTurnId(null);
      setRevealedTurnId(null);
      setWorkJustRevealed(false);
      setHeroPhase("idle");
      setHeroActiveIntent(null);
      setFirstIntroTurnId(null);
      return;
    }

    const hydratedTurns: Turn[] = nextFlow.map((intent, idx) => ({
      id: `hydrated-${idx}`,
      intent,
      label: LABELS[intent],
    }));
    setTurns(hydratedTurns);
    turnsRef.current = hydratedTurns;
    setShowProjects(nextFlow.includes("projects"));
    setChipsDocked(true);
    setDockVisible(true);
    setNewTurnId(null);
    setRevealedTurnId(null);
    setWorkJustRevealed(false);
    setHeroPhase("gone");
    setHeroActiveIntent(null);
    setFirstIntroTurnId(null);
  }, [parseFlowFromUrl, embeddedInCaseStudy, initialFlowOverride, studies]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSelect = (data: {
    intent: AssistantIntent;
    label: string;
    sourceEl: HTMLButtonElement;
  }) => {
    const currentCount = turnsRef.current.reduce(
      (acc, t) => acc + (t.intent === data.intent ? 1 : 0),
      0
    );
    if (currentCount >= 1) return;

    const id = nextTurnId();
    const newTurn: Turn = { id, intent: data.intent, label: data.label };
    const isFirstInteraction = turnsRef.current.length === 0;

    if (isFirstInteraction) {
      setHeroActiveIntent(data.intent);
      setHeroPhase("exiting");
      // Keep the dock out of the way during the initial micro-interaction.
      setDockVisible(false);
      if (heroExitTimerRef.current) window.clearTimeout(heroExitTimerRef.current);
      heroExitTimerRef.current = window.setTimeout(() => {
        setHeroPhase("gone");
        setDockVisible(true);
      }, prefersReducedMotion() ? 0 : HERO_EXIT_MS);

      setFirstIntroTurnId(id);
      if (firstIntroTimerRef.current) window.clearTimeout(firstIntroTimerRef.current);
      firstIntroTimerRef.current = window.setTimeout(() => setFirstIntroTurnId(null), 900);
    }

    // Append a new turn (duplicates allowed) and persist URL immediately.
    const nextTurns = [...turnsRef.current, newTurn];
    turnsRef.current = nextTurns;
    setTurns(nextTurns);
    writeFlowToUrl(nextTurns.map((t) => t.intent), true);
    markNewTurn(id);
    markRevealedTurn(id);

    // Dock the assistant after the first selection.
    setChipsDocked(true);
    if (!isFirstInteraction) setDockVisible(true);

    const scrollAfterPaint = () => {
      if (data.intent === "projects") {
        const wasVisible = showProjectsRef.current;
        setShowProjects(true);
        if (!wasVisible) markWorkRevealed();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              const url = new URL(window.location.href);
              url.hash = "work";
              window.history.replaceState({}, "", url);
            } catch {
              // ignore
            }
            const work = document.getElementById("work");
            if (!work) return;
            if (prefersReducedMotion()) {
              work.scrollIntoView({ behavior: "auto", block: "start" });
              return;
            }
            scrollToElementEaseOut(work, { pxPerSecond: 900, minMs: 650, maxMs: 1500 });
          });
        });
        return;
      }

      requestAnimationFrame(() => {
        const anchor = document.getElementById(id);
        if (!anchor) return;
        if (prefersReducedMotion()) {
          anchor.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
        scrollToElementEaseOut(anchor, { pxPerSecond: 900, minMs: 650, maxMs: 1500 });
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollAfterPaint);
    });
  };

  type TurnWithMeta = Turn & { occurrence: number };

  const turnsWithMeta: TurnWithMeta[] = useMemo(() => {
    const counts: Record<AssistantIntent, number> = { projects: 0, about: 0, contact: 0 };
    return turns.map((t) => {
      const occurrence = counts[t.intent] ?? 0;
      counts[t.intent] = occurrence + 1;
      return { ...t, occurrence };
    });
  }, [turns]);

  const intentCounts = useMemo(() => {
    const counts: Record<AssistantIntent, number> = { projects: 0, about: 0, contact: 0 };
    for (const t of turns) counts[t.intent] += 1;
    return counts;
  }, [turns]);

  const disabledIntents = useMemo(() => {
    return (Object.entries(intentCounts) as Array<[AssistantIntent, number]>)
      .filter(([, n]) => n >= 1)
      .map(([intent]) => intent);
  }, [intentCounts]);

  const firstProjectsIndex = useMemo(() => {
    return turnsWithMeta.findIndex((t) => t.intent === "projects");
  }, [turnsWithMeta]);

  const preWorkTurns = useMemo(() => {
    if (firstProjectsIndex === -1) return turnsWithMeta;
    return turnsWithMeta.slice(0, firstProjectsIndex + 1);
  }, [turnsWithMeta, firstProjectsIndex]);

  const postWorkTurns = useMemo(() => {
    if (firstProjectsIndex === -1) return [];
    return turnsWithMeta.slice(firstProjectsIndex + 1);
  }, [turnsWithMeta, firstProjectsIndex]);

  return (
    <>
      <section className={heroStyles.hero}>
        <div className="page-shell">
          <div className={heroStyles.heroGrid}>
            <div className={heroStyles.heroLeft}>
              <h1>
                Design for what’s next.{" "}
                <span className={heroStyles.heroHeadlineSecondary}>
                Leader, founder, and builder of digital products.
                </span>
              </h1>

              {heroPhase !== "gone" && (
                <div
                  ref={chipsWrapRef}
                  className={styles.chipsWrap}
                  data-docked={chipsDocked}
                  data-visible={true}
                  data-hero-phase={heroPhase}
                >
                  <div className={chipsDocked ? styles.chipsDock : undefined}>
                    <Assistant
                      docked={chipsDocked}
                      transitioning={heroPhase === "exiting"}
                      activeIntent={heroActiveIntent}
                      disabledIntents={disabledIntents}
                      onSelect={handleSelect}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {turns.length > 0 && (
        <section className={styles.turns} aria-label="Conversation">
          <div className="page-shell">
            {preWorkTurns.map((turn) => (
              <div
                key={turn.id}
                id={turn.id}
                className={styles.turn}
                data-intent={turn.intent}
                data-new={turn.id === newTurnId}
                data-first-intro={turn.id === firstIntroTurnId}
                data-revealed={turn.id === revealedTurnId}
                data-empty={turn.intent === "projects" && turn.occurrence === 0}
              >
                <div className={styles.turnHeader}>
                  <div
                    className={`${assistantStyles.suggestion} ${styles.turnPillStatic}`}
                    data-turn-pill={turn.id}
                  >
                    {turn.label}
                  </div>
                </div>

                <div className={styles.turnBody}>
                  {turn.intent === "projects" ? (
                    turn.occurrence === 1 ? (
                      <div className={styles.turnContent}>
                        <h2 className={styles.turnTitle}>Work</h2>
                        <div className={styles.panel}>
                          <p>
                            You&apos;ve already seen my selected projects. Want to see more work
                            and opportunities?{" "}
                            <a href={MAILTO}>Email me</a>.
                          </p>
                        </div>
                      </div>
                    ) : null
                  ) : turn.intent === "about" && turn.occurrence === 1 ? (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>About Carl</h2>
                      <div className={styles.panel}>
                        <p>
                          That&apos;s the short version. If you&apos;d like more context,{" "}
                          <a href={MAILTO}>reach out by email</a> and we can chat.
                        </p>
                      </div>
                    </div>
                  ) : turn.intent === "contact" && turn.occurrence === 1 ? (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>Contact</h2>
                      <div className={styles.panel}>
                        <p>
                          I appreciate the interest, but I don&apos;t give out my home address on
                          my website. Best way to reach me is{" "}
                          <a href={MAILTO}>email</a>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>
                        {turn.intent === "about" ? "About Carl" : "Contact"}
                      </h2>
                      <div className={styles.panel}>
                        {turn.intent === "about" ? (
                          <>
                            <div className={styles.aboutImageWrap}>
                              <Image
                                src="/about-carl-whiteboard.png"
                                alt="Carl at a whiteboard during a design session"
                                width={750}
                                height={500}
                                quality={100}
                                className={styles.aboutImage}
                              />
                            </div>

                            <p className={styles.panelIntro}>
                              Product design rooted in curiosity, user-centricity, and delightfulness.
                            </p>

                            <p>
                              As a start-up founder and designer, Carl has spent much of his career
                              working alongside small teams building new products and businesses,
                              whilst collaborating with friends, colleagues, founders, and engineers who share
                              a curiosity for new ideas and care about building thoughtful,
                              well-considered products.
                            </p>

                            <h3 className={styles.panelSubheading}>Background</h3>

                            <p>
                              A hip-hop kid with a love for technology, turned design graduate, Carl
                              was exposed to the London start-up scene in 2010 and has been designing
                              interfaces and digital experiences ever since. He has led design at
                              start-ups including Farfetch, Seedrs, and Simply Business, and advised
                              organisations including Workspace, Vodafone, and the NHS on digital
                              strategy and product experience.
                            </p>

                            <p>
                              As a founder-builder, Carl founded Emblzn (2013) and Shoesie (2018),
                              both of which went through accelerator programmes including{" "}
                              <a
                                href="https://www.ignite.io/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Ignite
                              </a>
                              . Emblzn later won UK Innovate&apos;s Digital Innovation Award for mass
                              customisation.
                            </p>

                            <h3 className={styles.panelSubheading}>What Carl does</h3>

                            <p>
                              The projects Carl works on typically involve strategy, research,
                              problem-solving, and testing, to deliver meaningful digital solutions. They
                              combine business thinking with product craft and interface design to
                              shape clear, useful experiences for the people using them.
                            </p>

                            <h3 className={styles.panelSubheading}>Applied AI Product Design</h3>

                            <p>
                              Over the past few years, Carl has increasingly integrated AI into his
                              product workflow, using agentic tools to design, prototype, and
                              validate ideas.
                            </p>

                            <p>
                              He has built and released multiple production iOS products, most
                              recently working with a small group of friends to launch{" "}
                              <a
                                href="https://apps.apple.com/us/app/totl-top-of-the-league/id6754661450"
                                target="_blank"
                                rel="noreferrer"
                              >
                                TOTL
                              </a>
                              , Top of the League — a social football predictions platform built across
                              web and React Native, including user accounts, game mechanics,
                              leaderboards, social groups, notifications, and third-party data
                              integrations.
                            </p>

                            <p>
                              Thanks for taking the time to read. If you&apos;re working on something
                              interesting, feel free to get in touch and say hello.
                            </p>

                            <div className={styles.panelLinks}>
                              <a href={MAILTO}>Email</a>
                              <a
                                href="https://www.linkedin.com/in/cgstratton/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              Email is best but I&apos;m also on LinkedIn. Or if you believe good
                              conversation happens over a chessboard or between padel points,
                              you can find me on{" "}
                              <a
                                href="https://www.chess.com/member/strattonsphere"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Chess.com
                              </a>{" "}
                              and{" "}
                              <a
                                href="https://app.playtomic.io/profile/user/5987380?utm_source=app_ios&utm_medium=share"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Playtomic
                              </a>
                              .
                            </p>
                            <div className={styles.panelLinks}>
                              <a href={MAILTO}>Email</a>
                              <a
                                href="https://www.linkedin.com/in/cgstratton/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                              <a
                                href="https://www.chess.com/member/strattonsphere"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Chess.com
                              </a>
                              <a
                                href="https://app.playtomic.io/profile/user/5987380?utm_source=app_ios&utm_medium=share"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Playtomic
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {showProjects && (
              <div className={styles.workWrap} data-revealed={workJustRevealed}>
                <div className={styles.workStack}>
                  <div>
                    <h2 className={styles.turnTitle} id="work">
                      Selected projects
                    </h2>
                    <div className={styles.grid}>
                      {items.map((study) => (
                        <Link
                          key={study.slug}
                          href={`/work/${study.slug}`}
                          className={styles.tile}
                          aria-label={study.title}
                        >
                          <div className={styles.cardImageWrap} aria-hidden="true">
                            <Image
                              src={study.cardImage ?? study.hero}
                              alt={study.title}
                              fill
                              sizes="(max-width: 720px) 86vw, (max-width: 1100px) 44vw, 566px"
                              priority={false}
                              quality={100}
                              unoptimized={
                                (study.cardImage ?? study.hero).includes(
                                  "thumbnail-secondary-market"
                                )
                              }
                              className={styles.cardImage}
                            />
                            {study.badge && (
                              <div className={styles.badgeWrap} aria-hidden="true">
                                <Image
                                  src={study.badge}
                                  alt=""
                                  width={56}
                                  height={56}
                                  quality={100}
                                  className={styles.badge}
                                />
                              </div>
                            )}
                          </div>
                          <div className={styles.cardMeta}>
                            <div className={styles.cardEyebrow}>
                              {((study.client ?? study.company ?? "").replace(/\.(com|co\.uk)$/i, "")).toUpperCase()} · {study.readTime ?? 5} MINUTE READ
                            </div>
                            <h3 className={styles.cardTitle}>{study.title}</h3>
                            <p className={styles.cardSummary}>{study.summary}</p>
                            {study.typeBadges && study.typeBadges.length > 0 && (
                              <div className={styles.typeBadges}>
                                {study.typeBadges.map((badge) => (
                                  <span key={badge} className={styles.typeBadge}>
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {aiProjects.length > 0 && (
                    <div>
                      <h2 className={styles.turnTitle}>AI projects</h2>
                      <AIProjectsSection projects={aiProjects} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {postWorkTurns.map((turn) => (
              <div
                key={turn.id}
                id={turn.id}
                className={styles.turn}
                data-intent={turn.intent}
                data-new={turn.id === newTurnId}
                data-first-intro={turn.id === firstIntroTurnId}
                data-revealed={turn.id === revealedTurnId}
                data-empty={turn.intent === "projects" && turn.occurrence === 0}
              >
                <div className={styles.turnHeader}>
                  <div
                    className={`${assistantStyles.suggestion} ${styles.turnPillStatic}`}
                    data-turn-pill={turn.id}
                  >
                    {turn.label}
                  </div>
                </div>

                <div className={styles.turnBody}>
                  {turn.intent === "projects" ? (
                    turn.occurrence === 1 ? (
                      <div className={styles.turnContent}>
                        <h2 className={styles.turnTitle}>Work</h2>
                        <div className={styles.panel}>
                          <p>
                            You&apos;ve already seen my selected projects. Want to see more work
                            and opportunities?{" "}
                            <a href={MAILTO}>Email me</a>.
                          </p>
                        </div>
                      </div>
                    ) : null
                  ) : turn.intent === "about" && turn.occurrence === 1 ? (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>About Carl</h2>
                      <div className={styles.panel}>
                        <p>
                          That&apos;s the short version. If you&apos;d like more context,{" "}
                          <a href={MAILTO}>reach out by email</a> and we can chat.
                        </p>
                      </div>
                    </div>
                  ) : turn.intent === "contact" && turn.occurrence === 1 ? (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>Contact</h2>
                      <div className={styles.panel}>
                        <p>
                          I appreciate the interest, but I don&apos;t give out my home address on
                          my website. Best way to reach me is{" "}
                          <a href={MAILTO}>email</a>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.turnContent}>
                      <h2 className={styles.turnTitle}>
                        {turn.intent === "about" ? "About Carl" : "Contact"}
                      </h2>
                      <div className={styles.panel}>
                        {turn.intent === "about" ? (
                          <>
                            <div className={styles.aboutImageWrap}>
                              <Image
                                src="/about-carl-whiteboard.png"
                                alt="Carl at a whiteboard during a design session"
                                width={750}
                                height={500}
                                quality={100}
                                className={styles.aboutImage}
                              />
                            </div>

                            <p className={styles.panelIntro}>
                              Product design rooted in curiosity, user-centricity, and delightfulness.
                            </p>

                            <p>
                              As a start-up founder and designer, Carl has spent much of his career
                              working alongside small teams building new products and businesses,
                              whilst collaborating with friends, colleagues, founders, and engineers who share
                              a curiosity for new ideas and care about building thoughtful,
                              well-considered products.
                            </p>

                            <h3 className={styles.panelSubheading}>Background</h3>

                            <p>
                              A hip-hop kid with a love for technology, turned design graduate, Carl
                              was exposed to the London start-up scene in 2010 and has been designing
                              interfaces and digital experiences ever since. He has led design at
                              start-ups including Farfetch, Seedrs, and Simply Business, and advised
                              organisations including Workspace, Vodafone, and the NHS on digital
                              strategy and product experience.
                            </p>

                            <p>
                              As a start-up founder, Carl founded Emblzn (2013) and Shoesie (2018),
                              both of which went through accelerator programmes including{" "}
                              <a
                                href="https://www.ignite.io/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Ignite
                              </a>
                              . Emblzn later won UK Innovate&apos;s Digital Innovation Award for mass
                              customisation.
                            </p>

                            <h3 className={styles.panelSubheading}>What Carl does</h3>

                            <p>
                              The projects Carl works on typically involve strategy, research,
                              problem-solving, and testing, to deliver meaningful digital solutions. They
                              combine business thinking with product craft and interface design to
                              shape clear, useful experiences for the people using them.
                            </p>

                            <h3 className={styles.panelSubheading}>Applied AI Product Design</h3>

                            <p>
                              Over the past few years, Carl has increasingly integrated AI into his
                              product workflow, using agentic tools to design, prototype, and
                              validate ideas.
                            </p>

                            <p>
                              He has built and released multiple production iOS products, most
                              recently working with a small group of friends to launch{" "}
                              <a
                                href="https://apps.apple.com/us/app/totl-top-of-the-league/id6754661450"
                                target="_blank"
                                rel="noreferrer"
                              >
                                TotL
                              </a>
                              , Top of the League — a social football predictions app built across
                              web and React Native, including user accounts, game mechanics,
                              leaderboards, social groups, notifications, and third-party data
                              integrations.
                            </p>

                            <p>
                              Thanks for taking the time to read. If you&apos;re working on something
                              interesting, feel free to get in touch and say hello.
                            </p>

                            <div className={styles.panelLinks}>
                              <a href={MAILTO}>Email</a>
                              <a
                                href="https://www.linkedin.com/in/cgstratton/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              Email is best but I&apos;m also on LinkedIn. Or if you believe good
                              conversation happens over a chessboard or between padel points,
                              you&apos;ll find me on{" "}
                              <a
                                href="https://www.chess.com/member/strattonsphere"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Chess.com
                              </a>{" "}
                              and{" "}
                              <a
                                href="https://app.playtomic.io/profile/user/5987380?utm_source=app_ios&utm_medium=share"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Playtomic
                              </a>
                              .
                            </p>
                            <div className={styles.panelLinks}>
                              <a href={MAILTO}>Email</a>
                              <a
                                href="https://www.linkedin.com/in/cgstratton/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                              <a
                                href="https://www.chess.com/member/strattonsphere"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Chess.com
                              </a>
                              <a
                                href="https://app.playtomic.io/profile/user/5987380?utm_source=app_ios&utm_medium=share"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Playtomic
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Docked chips for the next step (after response appears) */}
      {chipsDocked && (
        <div
          ref={chipsWrapRef}
          className={styles.chipsWrap}
          data-docked={true}
          data-visible={dockVisible}
        >
          <div className={styles.chipsDock}>
            <Assistant
              docked
              transitioning={false}
              activeIntent={null}
              disabledIntents={disabledIntents}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}
    </>
  );
}

