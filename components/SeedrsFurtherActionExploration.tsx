"use client";

import styles from "./CaseTypographicBlocks.module.css";
// import { SeedrsPhase2Table } from "./SeedrsPhase2Table";
import { SeedrsExplorationBlocks } from "./SeedrsExplorationBlocks";
import { SeedrsSwipeBenefits } from "./SeedrsSwipeBenefits";
import { SeedrsUserQuotes } from "./SeedrsUserQuotes";
import { SeedrsPrototypeTested } from "./SeedrsPrototypeTested";

export function SeedrsFurtherActionExploration() {
  return (
    <>
    <div className={styles.proseBlock}>
      <div className={styles.prose}>
        <p>
          Based on these insights, I explored interaction patterns around
          reducing cognitive load, organisation and maintaining momentum.
        </p>
        <p>
          Traditional bookmarking and save features worked but felt static and disconnected.
          They didn&apos;t align withhow investors were scanning and
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
          The swipe to progress interaction pattern allowed users to quickly navigate through
          options, making the process faster and more engaging. Enabeling investors to scan what’s new, shortlist promising campaigns and return later to pick up where they left off.
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

    </div>

    <figure className={styles.figureBreakout}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/case-studies/seedrs-structured-progression.png"
        alt="Investment feed comparison: standard scroll vs Seedrs swipe prototype"
      />
    </figure>

    <figure className={styles.figureBreakout}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/case-studies/seedrs-invest-screen-original.png"
        alt="Seedrs Invest app: Feed and Following tabs"
      />
    </figure>

    <figure className={styles.figureBreakout}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/case-studies/ui-detail-seedrs.png"
        alt="Seedrs Invest app: Feed and Following tabs with investment card"
      />
    </figure>
    </>
  );
}
