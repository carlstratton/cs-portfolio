"use client";

import styles from "./CaseTypographicBlocks.module.css";
// import { SeedrsPhase2Table } from "./SeedrsPhase2Table";
import { SeedrsExplorationBlocks } from "./SeedrsExplorationBlocks";
import { SeedrsSwipeBenefits } from "./SeedrsSwipeBenefits";
import { SeedrsUserQuotes } from "./SeedrsUserQuotes";
import { SeedrsPrototypeTested } from "./SeedrsPrototypeTested";

export function SeedrsFurtherActionExploration() {
  return (
    <div className={styles.proseBlock}>
      <div className={styles.prose}>
        <p>
          Based on these insights, I explored interaction patterns that could
          reduce cognitive load while increasing momentum.
        </p>
        <p>
          Traditional bookmarking and save features felt static and sluggish.
          They didn&apos;t match how investors were quickly scanning and
          evaluating new opportunities.
        </p>
      </div>

      {/* <SeedrsPhase2Table /> */}

      {/* <SeedrsExplorationBlocks /> */}

      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/case-studies/seedrs-desk-research.png"
          alt="Desk research example: Bookmarking and list creation/content organisation"
        />
      </figure>

      <div className={styles.prose}>
        <p>
          Inspired by high-engagement mobile interaction patterns, I prototyped a
          swipe-based campaign interface.
        </p>
        <p>
          While bookmarking and save features are user-friendly on other
          platforms, they didn&apos;t meet our specific requirements. They felt
          sluggish in comparison to how I imagined users exploring new investment
          opportunities in the app environment, prompting a need for a more
          efficient solution. This challenge sparked the idea of integrating a
          swiping mechanism, inspired by the interaction design of dating apps.
        </p>
        <p>
          Such an approach allows users to quickly navigate through investment
          options, making the process not only faster but more engaging.
          Although the basic user sentiment is similar, our objectives—enhancing
          speed and user control in exploring new opportunities—significantly
          differ.
        </p>
      </div>

      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/case-studies/seedrs-swipe-figure.png"
          alt="Swipe interaction: dating app inspired campaign interface"
        />
      </figure>

      <SeedrsSwipeBenefits />

      <div className={styles.prose}>
        <p>
          We carried out a usability test with 22 participants, mixing 12
          seasoned Seedrs investors and 10 new users, aged 25–55, across genders.
          They first explored Seedrs&apos; current web Campaigns interface,
          then tested our new swipe prototype for a comparative experience
          analysis.
        </p>
      </div>

      <SeedrsUserQuotes />

      <SeedrsPrototypeTested />

      <div className={styles.identifiedBlock}>
        <p className={styles.identifiedLeadIn}>
          The solution allowed investors to:
        </p>
        <ul className={`${styles.bullets} ${styles.bulletsIdentified}`}>
          <li>Follow promising campaigns</li>
          <li>Hide irrelevant ones</li>
          <li>Reduce feed noise dynamically</li>
          <li>Build a curated &ldquo;Following&rdquo; view over time</li>
        </ul>
      </div>

      <div className={styles.prose}>
        <p>The goal was simple: transform browsing into structured progression.</p>
      </div>

      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/case-studies/seedrs-structured-progression.png"
          alt="Investment feed comparison: standard scroll vs Seedrs swipe prototype"
        />
      </figure>
    </div>
  );
}
