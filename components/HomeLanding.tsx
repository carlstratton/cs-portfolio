"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CaseStudy } from "@/types/caseStudy";
import { Assistant, type AssistantIntent } from "@/components/Assistant";
import assistantStyles from "@/components/Assistant.module.css";
import { preloadThinkingDots, ThinkingDots } from "@/components/ThinkingDots";
import heroStyles from "../app/page.module.css";
import styles from "./HomeLanding.module.css";

const THINK_MS = 4000;
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

function scrollToElementConstantSpeed(
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
    // Linear timing for a consistent-feeling scroll speed.
    window.scrollTo(0, startY + delta * t);
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
  status: "thinking" | "done";
};

export function HomeLanding({ studies }: { studies: CaseStudy[] }) {
  const searchParams = useSearchParams();
  const items = useMemo(() => studies.slice(0, 4), [studies]);
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
  const turnTimersRef = useRef<Record<string, number>>({});
  const turnsRef = useRef<Turn[]>([]);
  const newTurnTimerRef = useRef<number | null>(null);
  const firstIntroTimerRef = useRef<number | null>(null);
  const heroExitTimerRef = useRef<number | null>(null);
  const revealedTurnTimerRef = useRef<number | null>(null);
  const workRevealTimerRef = useRef<number | null>(null);
  const showProjectsRef = useRef(showProjects);

  useEffect(() => {
    preloadThinkingDots();
  }, []);

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
    try {
      if (suppressHydration) suppressFlowHydrationRef.current = true;
      const url = new URL(window.location.href);
      url.searchParams.delete("intent");
      if (nextFlow.length) url.searchParams.set("flow", nextFlow.join(","));
      else url.searchParams.delete("flow");
      // Important: don't set `#work` until the work section is actually revealed,
      // otherwise the browser may jump/flash while the loader is running.
      window.history.replaceState({}, "", url);
    } catch {
      // ignore
    }
  };

  const nextTurnId = () => {
    turnIdRef.current += 1;
    return `turn-${turnIdRef.current}`;
  };

  const clearTurnTimer = (id: string) => {
    const t = turnTimersRef.current[id];
    if (!t) return;
    window.clearTimeout(t);
    delete turnTimersRef.current[id];
  };

  // Next's recommended pattern is to react to querystring changes via `useSearchParams`.
  // We intentionally update local UI state from the URL here (e.g. when navigating back
  // from a case study). This is safe and keeps the home experience deterministic.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const nextFlow = parseFlowFromUrl;
    if (suppressFlowHydrationRef.current) {
      // We wrote `flow=` ourselves to persist browser-back state; don't let that
      // skip the thinking/loader sequences for click-triggered intents.
      suppressFlowHydrationRef.current = false;
      return;
    }

    // Clear any pending timers from previous client-side interactions.
    Object.keys(turnTimersRef.current).forEach(clearTurnTimer);

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
      status: "done",
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
  }, [parseFlowFromUrl, studies]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useLayoutEffect(() => {
    return () => {
      Object.keys(turnTimersRef.current).forEach(clearTurnTimer);
    };
  }, []);

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
    const newTurn: Turn = { id, intent: data.intent, label: data.label, status: "thinking" };
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

    // Dock the assistant after the first selection.
    setChipsDocked(true);
    if (!isFirstInteraction) setDockVisible(true);

    // Scroll to the newly appended turn so the thinking state is visible.
    requestAnimationFrame(() => {
      const anchor = document.getElementById(id);
      if (!anchor) return;
      if (prefersReducedMotion()) {
        anchor.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      scrollToElementConstantSpeed(anchor, { pxPerSecond: 900, minMs: 650, maxMs: 1500 });
    });

    // Clear any previous timer for this id (defensive; ids should be unique).
    clearTurnTimer(id);

    turnTimersRef.current[id] = window.setTimeout(() => {
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
      markRevealedTurn(id);

      if (data.intent === "projects") {
        const wasVisible = showProjectsRef.current;
        setShowProjects(true);
        if (!wasVisible) markWorkRevealed();
        // After reveal, scroll to #work using constant-speed scroll.
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
            scrollToElementConstantSpeed(work, { pxPerSecond: 900, minMs: 650, maxMs: 1500 });
          });
        });
      }
    }, THINK_MS);
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
                A decade in product &amp; design.{" "}
                <span className={heroStyles.heroHeadlineSecondary}>
                Helping ambitious companies make better product bets.
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
                data-empty={turn.intent === "projects" && turn.status === "done" && turn.occurrence === 0}
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
                  {turn.status === "thinking" ? (
                    <div className={styles.turnThinking} aria-label="Thinking…">
                      <ThinkingDots className={styles.thinkingDot} width={50} height={18} />
                    </div>
                  ) : turn.intent === "projects" ? (
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
                              As a start-up founder, business director, and design professional,
                              Carl has worked alongside some incredible teams to build innovative,
                              award-winning businesses. Along the way, he has collaborated with
                              friends, colleagues, and extraordinary people, all united by a shared
                              passion for new ideas, spirit of exploration and delivering world class
                              products and experiences.
                            </p>

                            <h3 className={styles.panelSubheading}>Background</h3>

                            <p>
                              Carl is a UX product designer and start-up founder with over a decade
                              of design experience. He has helped lead experience design for visionary
                              start-ups like Farfetch, Seedrs and Mendeley; collaborated with brands
                              like Vodafone, ESPN, and Mind Candy; and advised organisations like
                              Workspace and the NHS to deliver impactful digital strategies.
                            </p>

                            <p>
                              As a start-up founder, Carl successfully brought the businesses he
                              founded, Emblzn (2013) and Shoesie (2018), through accelerator programmes including{" "}
                              <a
                                href="https://www.ignite.io/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Ignite
                              </a>
                              ,
                              with Emblzn winning UK Innovate&apos;s digital innovation contest for
                              mass customisation.
                            </p>

                            <p>
                              He has led and coached teams, and building innovative products has
                              been a defining part of his journey, driven by a passion for exploring
                              new ideas and collaboration.
                            </p>

                            <h3 className={styles.panelSubheading}>What Carl does</h3>

                            <p>
                              Projects Carl works on involve a large degree of strategic thinking,
                              problem-solving, research, and testing; and usually result in some form
                              of digital output. They combine business with design logic, requiring
                              sensitivity for user-centred design and a passion for improving and
                              delivering succinct digital experiences.
                            </p>

                            <h3 className={styles.panelSubheading}>Applied AI Product Design</h3>

                            <p>
                              Over the past few years, Carl has increasingly integrated AI into his
                              product workflow, using agentic tools to design, prototype, and validate
                              product experiences. This ranges from micro-interactions to fully
                              functioning end-to-end flows, including production-ready web and native
                              applications.
                            </p>

                            <p>
                              Beyond tooling, he ships. Carl has built and released multiple
                              production iOS products. Most recently working with a small group of friends, he launched <a
                              href="https://apps.apple.com/us/app/totl-top-of-the-league/id6754661450"
                              target="_blank"
                              rel="noreferrer"
                            >
                              TOTL
                            </a>
                            ,
                              top of the league - a social football predictions platform across Web and Expo React Native.
                              It includes core platform features such as user accounts, game mechanics,
                              competitive rankings, social groups, notification triggers, and
                              third-party data integrations.
                            </p>

                            <p>
                              He does not separate design from delivery. He builds what he designs.
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
                          {((study.client ?? study.company ?? "").replace(/\.(com|co\.uk)$/i, "")).toUpperCase()} · 5 MINUTE READ
                        </div>
                        <h3 className={styles.cardTitle}>{study.title}</h3>
                        <p className={styles.cardSummary}>{study.summary}</p>
                      </div>
                    </Link>
                  ))}
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
                data-empty={turn.intent === "projects" && turn.status === "done" && turn.occurrence === 0}
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
                  {turn.status === "thinking" ? (
                    <div className={styles.turnThinking} aria-label="Thinking…">
                      <ThinkingDots className={styles.thinkingDot} width={50} height={18} />
                    </div>
                  ) : turn.intent === "projects" ? (
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
                              As a start-up founder, business director, and design professional,
                              Carl has worked alongside some incredible teams to build innovative,
                              award-winning businesses. Along the way, he has collaborated with
                              friends, colleagues, and extraordinary people, all united by a shared
                              passion for new ideas, spirit of exploration and delivering world class
                              products and experiences.
                            </p>

                            <h3 className={styles.panelSubheading}>Background</h3>

                            <p>
                              Carl is a UX product designer and start-up founder with over a decade
                              of design experience. He has helped lead experience design for visionary
                              start-ups like Farfetch, Seedrs and Mendeley; collaborated with brands
                              like Vodafone, ESPN, and Mind Candy; and advised organisations like
                              Workspace and the NHS to deliver impactful digital strategies.
                            </p>

                            <p>
                              As a start-up founder, Carl successfully brought the businesses he
                              founded, Emblzn (2013) and Shoesie (2018), through accelerator programmes, including{" "}
                              <a
                                href="https://www.ignite.io/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                IGNITE
                              </a>
                              , with Emblzn winning UK Innovate&apos;s digital innovation contest for
                              mass customisation.
                            </p>

                            <p>
                              He has led and coached teams, and building innovative products has
                              been a defining part of his journey, driven by a passion for exploring
                              new ideas and collaboration.
                            </p>

                            <h3 className={styles.panelSubheading}>What Carl does</h3>

                            <p>
                              Projects Carl works on involve a large degree of strategic thinking,
                              problem-solving, research, and testing; and usually result in some form
                              of digital output. They combine business with design logic, requiring
                              sensitivity for user-centred design and a passion for improving and
                              delivering succinct digital experiences.
                            </p>

                            <h3 className={styles.panelSubheading}>Applied AI Product Design</h3>

                            <p>
                              Over the past few years, Carl has increasingly integrated AI into his
                              product workflow — using agentic tools to design, prototype, and validate
                              product experiences. This ranges from micro-interactions to fully
                              functioning end-to-end flows, including production-ready web and native
                              applications.
                            </p>

                            <p>
                              Beyond tooling, he ships. Carl has built and released multiple
                              production iOS products. Most recently, he launched TOTL, Top of the League,
                              a social football predictions platform across Web and Expo React Native.
                              It includes core platform features such as user accounts, game mechanics,
                              competitive rankings, social groups, notification triggers, and
                              third-party data integrations.
                            </p>

                            <p>
                              He does not separate design from delivery. He builds what he designs.
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

