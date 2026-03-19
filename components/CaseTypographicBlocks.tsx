"use client";

import { Fragment, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./CaseTypographicBlocks.lightbox.css";
import type {
  CaseMedia,
  CaseSection,
  CaseStudy,
  CaseStudySummarySection,
  InlineMedia,
  SummarySectionId,
} from "@/types/caseStudy";
import {
  CaseStudyGalleryImage,
  extractAllCaseStudyImages,
} from "./CaseStudyGallery";
import { DiagnosingRootCauses } from "./DiagnosingRootCauses";
import { RouteToSuccess } from "./RouteToSuccess";
import { SeedrsCoreAreas } from "./SeedrsCoreAreas";
import { SeedrsFurtherActionExploration } from "./SeedrsFurtherActionExploration";
import { SeedrsPrioritisation, SeedrsPrioritisationTabletImage } from "./SeedrsPrioritisation";
import { SeedrsResearchInsights } from "./SeedrsResearchInsights";
import { StackedImagesWithHeaders } from "./StackedImagesWithHeaders";
import { UserFeedbackQuote } from "./UserFeedbackQuote";
import { WondrMixedMediaGrid } from "./WondrMixedMediaGrid";
import styles from "./CaseTypographicBlocks.module.css";

function getFirstMediaOfType(
  study: CaseStudy,
  type: CaseMedia["type"],
): CaseMedia | undefined {
  for (const section of study.sections) {
    const hit = section.media?.find((m) => m.type === type);
    if (hit) return hit;
  }
  return undefined;
}

const IMAGE_CONSTRAINED_SECTIONS = ["validating-experiments", "iteration-prototyping", "results"] as const;

type CaseStudyViewMode = "full" | "summary";
type SummarySection = CaseStudySummarySection;

type TextCandidate = {
  text: string;
  order: number;
  numericCount: number;
};

const SUMMARY_SECTION_TITLES: Record<SummarySectionId, string> = {
  opportunity: "The Opportunity",
  solution: "The Solution",
  impact: "The Impact",
};

const SUMMARY_MATCHERS: Record<SummarySectionId, string[]> = {
  opportunity: [
    "context",
    "design challenge",
    "challenge",
    "problem",
    "key findings",
    "approach identified",
  ],
  solution: [
    "approach",
    "research",
    "action taken",
    "action",
    "solution",
    "further action taken",
    "further actions taken",
    "further action taken exploration",
    "defining goals",
    "building and learning",
    "designing workflow",
    "validating experiments",
    "iteration and prototyping",
    "iteration prototyping",
    "discovery",
    "design validation",
    "delivery",
  ],
  impact: ["impact", "results", "benefits"],
};

const SUMMARY_KEYWORDS: Record<SummarySectionId, string[]> = {
  opportunity: [
    "problem",
    "challenge",
    "friction",
    "limited",
    "unclear",
    "gap",
    "overwhelmed",
    "retention",
    "confidence",
    "difficult",
  ],
  solution: [
    "built",
    "created",
    "designed",
    "introduced",
    "launched",
    "workflow",
    "prototype",
    "validated",
    "mobile",
    "platform",
    "integrated",
  ],
  impact: [
    "increased",
    "reduced",
    "transformed",
    "improved",
    "launched",
    "downloads",
    "rating",
    "confidence",
    "support",
    "investment",
    "seed",
  ],
};

function normalizeKey(value?: string) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countNumericTokens(text: string) {
  return (
    text.match(/(?:[$£€]\s?\d[\d,.\+]*|\d[\d,.\+]*\s?(?:%|k|K|m|M|x|×|\+)?)/g) ?? []
  ).length;
}

function sanitizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function isHeadingLike(text: string) {
  const cleaned = sanitizeText(text);
  if (!cleaned) return true;
  if (cleaned.endsWith(":")) return true;
  return countWords(cleaned) <= 5 && !/[.!?]$/.test(cleaned);
}

function fitsWordLimit(text: string, maxWords: number) {
  return countWords(text) <= maxWords;
}

function ensureSentence(text: string) {
  const cleaned = sanitizeText(text).replace(/[,:;]$/, "");
  if (!cleaned) return cleaned;
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function splitIntoSentenceFragments(text: string) {
  const normalized = sanitizeText(text);
  if (!normalized) return [];

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => sentence.split(/\s[—-]\s/))
    .flatMap((sentence) => sentence.split(/;\s+/))
    .map((sentence) => sanitizeText(sentence))
    .filter(Boolean);

  return sentences.length ? sentences : [normalized];
}

function dedupeTexts(texts: string[]) {
  const seen = new Set<string>();
  return texts.filter((text) => {
    const key = normalizeKey(text);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickShortestText(texts: string[]) {
  const deduped = dedupeTexts(texts.map((text) => sanitizeText(text)).filter(Boolean));
  return deduped.sort((a, b) => countWords(a) - countWords(b))[0] ?? "";
}

function getFallbackSentenceOptions(texts: string[]) {
  return dedupeTexts(
    texts
      .flatMap((text) => splitIntoSentenceFragments(text))
      .map((text) => ensureSentence(text))
      .filter(Boolean),
  );
}

function sectionMatches(section: CaseSection, patterns: string[]) {
  const id = normalizeKey(section.id);
  const title = normalizeKey(section.title);
  return patterns.some((pattern) => id.includes(pattern) || title.includes(pattern));
}

function getSectionsForSummary(study: CaseStudy, id: SummarySectionId) {
  const matches = study.sections.filter((section) => sectionMatches(section, SUMMARY_MATCHERS[id]));

  if (matches.length > 0) {
    if (id === "opportunity") {
      const primary = matches.filter((section) =>
        sectionMatches(section, ["context", "design challenge", "challenge", "problem"]),
      );
      return primary.length > 0 ? primary : matches;
    }
    return matches;
  }

  if (id === "opportunity") return study.sections.slice(0, 1);
  if (id === "impact") return study.sections.slice(-1);
  return study.sections.slice(1, Math.max(2, study.sections.length - 1));
}

function getSummaryParagraphs(section: CaseSection) {
  const body = getProseParagraphs(section);
  const bodyEnd = (section.bodyEnd ?? []).filter((paragraph) => !isHeadingLike(paragraph));
  return dedupeTexts([...body, ...bodyEnd]).filter((paragraph) => !isHeadingLike(paragraph));
}

function getTextCandidatesFromSections(sections: CaseSection[]) {
  const candidates: TextCandidate[] = [];
  let order = 0;

  for (const section of sections) {
    for (const paragraph of getSummaryParagraphs(section)) {
      for (const fragment of splitIntoSentenceFragments(paragraph)) {
        const text = sanitizeText(fragment);
        if (!text || isHeadingLike(text)) continue;
        candidates.push({ text, order, numericCount: countNumericTokens(text) });
        order += 1;
      }
    }

    for (const item of section.identifiedItems ?? []) {
      const text = ensureSentence(item);
      candidates.push({ text, order, numericCount: countNumericTokens(text) });
      order += 1;
    }
  }

  return candidates.filter(
    (candidate, index, list) =>
      list.findIndex((entry) => normalizeKey(entry.text) === normalizeKey(candidate.text)) === index,
  );
}

function scoreCandidate(candidate: TextCandidate, id: SummarySectionId, forLead = false) {
  const lower = candidate.text.toLowerCase();
  const keywordHits = SUMMARY_KEYWORDS[id].reduce(
    (count, keyword) => count + (lower.includes(keyword) ? 1 : 0),
    0,
  );
  const wordTargetBonus = forLead
    ? Math.max(0, 18 - Math.abs(15 - countWords(candidate.text)))
    : Math.max(0, 28 - Math.abs(18 - countWords(candidate.text)));

  return candidate.numericCount * (forLead ? 6 : 8) + keywordHits * 4 + wordTargetBonus;
}

function pickLead(candidates: TextCandidate[], id: SummarySectionId, fallback: string) {
  const ranked = [...candidates].sort(
    (a, b) => scoreCandidate(b, id, true) - scoreCandidate(a, id, true) || a.order - b.order,
  );
  const limit = id === "impact" ? 16 : 18;
  const candidateTexts = ranked.map((candidate) => ensureSentence(candidate.text));
  const source =
    candidateTexts.find((text) => fitsWordLimit(text, limit)) ??
    getFallbackSentenceOptions([fallback]).find((text) => fitsWordLimit(text, limit)) ??
    pickShortestText([...candidateTexts, ...getFallbackSentenceOptions([fallback])]);
  return ensureSentence(source);
}

function pickParagraph(
  candidates: TextCandidate[],
  id: SummarySectionId,
  opts: {
    minWords: number;
    maxWords: number;
    maxSentences: number;
    exclude?: string[];
    fallback?: string[];
  },
) {
  const excluded = new Set((opts.exclude ?? []).map((item) => normalizeKey(item)));
  const filtered = candidates.filter((candidate) => !excluded.has(normalizeKey(candidate.text)));

  const ranked = [...filtered].sort(
    (a, b) => scoreCandidate(b, id) - scoreCandidate(a, id) || a.order - b.order,
  );

  const chosen: TextCandidate[] = [];
  let words = 0;

  for (const candidate of ranked) {
    const sentence = ensureSentence(candidate.text);
    const candidateWords = countWords(sentence);
    if (chosen.length === 0 && candidateWords > opts.maxWords) continue;
    if (chosen.length > 0 && words + candidateWords > opts.maxWords) continue;
    chosen.push(candidate);
    words += candidateWords;
    if (words >= opts.minWords || chosen.length >= opts.maxSentences) break;
  }

  if (words < opts.minWords) {
    for (const fallback of getFallbackSentenceOptions(opts.fallback ?? [])) {
      const text = sanitizeText(fallback);
      if (!text || excluded.has(normalizeKey(text))) continue;
      const fallbackWords = countWords(text);
      if (chosen.length === 0 && fallbackWords > opts.maxWords) continue;
      if (chosen.length > 0 && words + fallbackWords > opts.maxWords) continue;
      chosen.push({
        text: ensureSentence(text),
        order: Number.MAX_SAFE_INTEGER - chosen.length,
        numericCount: countNumericTokens(text),
      });
      words += fallbackWords;
      if (words >= opts.minWords) break;
    }
  }

  if (chosen.length === 0 && opts.fallback?.length) {
    const fallbackOptions = getFallbackSentenceOptions([
      ...ranked.map((candidate) => candidate.text),
      ...opts.fallback,
    ]);
    return (
      fallbackOptions.find((text) => fitsWordLimit(text, opts.maxWords)) ??
      ensureSentence(pickShortestText(fallbackOptions))
    );
  }

  const paragraph = chosen
    .sort((a, b) => a.order - b.order)
    .map((candidate) => ensureSentence(candidate.text))
    .join(" ");

  return ensureSentence(paragraph);
}

function pickBullets(
  sections: CaseSection[],
  study: CaseStudy,
  fallbackCandidates: TextCandidate[],
) {
  const preferredSectionItems = sections.flatMap((section) =>
    section.bulletStyle === "questions" ? [] : (section.identifiedItems ?? []),
  );
  const questionSectionItems = sections.flatMap((section) =>
    section.bulletStyle === "questions" ? (section.identifiedItems ?? []) : [],
  );

  const rawItems = dedupeTexts([
    ...preferredSectionItems,
    ...study.outcomes,
    ...questionSectionItems,
    ...fallbackCandidates.map((candidate) => candidate.text),
  ]);

  const cleanedItems = rawItems
    .filter(Boolean)
    .map((item) => sanitizeText(item.replace(/[.!?]$/, "")))
    .filter((item) => countWords(item) >= 3);

  const withinLimit = cleanedItems.filter((item) => fitsWordLimit(item, 12));
  return (withinLimit.length > 0 ? withinLimit : cleanedItems).slice(0, 4);
}

function deriveOpportunitySummary(study: CaseStudy): SummarySection {
  const sections = getSectionsForSummary(study, "opportunity");
  const candidates = getTextCandidatesFromSections(sections);
  const lead = pickLead(candidates, "opportunity", study.summary);
  const paragraph = pickParagraph(candidates, "opportunity", {
    minWords: 60,
    maxWords: 100,
    maxSentences: 3,
    exclude: [lead],
    fallback: [study.summary, ...study.outcomes],
  });

  return {
    id: "opportunity",
    title: SUMMARY_SECTION_TITLES.opportunity,
    lead,
    paragraphs: [paragraph],
  };
}

function deriveSolutionSummary(study: CaseStudy): SummarySection {
  const sections = getSectionsForSummary(study, "solution");
  const candidates = getTextCandidatesFromSections(sections);
  const lead = pickLead(candidates, "solution", study.summary);
  const paragraph = pickParagraph(candidates, "solution", {
    minWords: 25,
    maxWords: 40,
    maxSentences: 2,
    exclude: [lead],
    fallback: [study.summary],
  });

  return {
    id: "solution",
    title: SUMMARY_SECTION_TITLES.solution,
    lead,
    paragraphs: [paragraph],
    bullets: pickBullets(sections, study, candidates),
  };
}

function deriveImpactSummary(study: CaseStudy): SummarySection {
  const sections = getSectionsForSummary(study, "impact");
  const candidates = getTextCandidatesFromSections(sections);
  const outcomeCandidates = study.outcomes.map((outcome, index) => ({
    text: ensureSentence(outcome),
    order: Number.MAX_SAFE_INTEGER - (study.outcomes.length - index),
    numericCount: countNumericTokens(outcome),
  }));
  const allCandidates = [...candidates, ...outcomeCandidates];
  const lead = pickLead(allCandidates, "impact", study.outcomes[0] ?? study.summary);
  const paragraph = pickParagraph(allCandidates, "impact", {
    minWords: 60,
    maxWords: 90,
    maxSentences: 3,
    exclude: [lead],
    fallback: study.outcomes,
  });

  return {
    id: "impact",
    title: SUMMARY_SECTION_TITLES.impact,
    lead,
    paragraphs: [paragraph],
  };
}

function deriveSummarySections(study: CaseStudy): SummarySection[] {
  if (study.summarySections?.length) {
    return study.summarySections;
  }

  return [
    deriveOpportunitySummary(study),
    deriveSolutionSummary(study),
    deriveImpactSummary(study),
  ];
}

export function CaseTypoSection(props: {
  title: string;
  children: React.ReactNode;
  media?: React.ReactNode;
  twoColumn?: boolean;
  twoColumnLayout?: boolean;
  /** When true, media spans full section width (e.g. when section has no body content) */
  mediaFullWidth?: boolean;
  /** When provided, renders inside sectionHeader (e.g. quote + title for impact section) */
  contentHeader?: React.ReactNode;
  sectionId?: string;
  studySlug?: string;
}) {
  const hasMedia = props.media != null && props.twoColumn;
  const constrainImages =
    props.studySlug === "wondr-medical-zero-to-one" &&
    props.sectionId != null &&
    IMAGE_CONSTRAINED_SECTIONS.includes(props.sectionId as (typeof IMAGE_CONSTRAINED_SECTIONS)[number]);
  const bodyClass = hasMedia
    ? props.twoColumnLayout
      ? `${styles.sectionBody} ${styles.sectionBodyTwoColumn}`
      : styles.sectionBody
    : styles.sectionBodySingle;
  const useContentHeader = props.contentHeader != null;
  const mediaClass = props.mediaFullWidth
    ? `${styles.sectionMedia} ${styles.sectionMediaFullWidth}`
    : styles.sectionMedia;
  return (
    <section className={`${styles.section} ${constrainImages ? styles.sectionImageConstrained : ""}`}>
      <header className={styles.sectionHeader}>
        {useContentHeader ? props.contentHeader : <h2 className={styles.sectionTitle}>{props.title}</h2>}
      </header>
      <div className={bodyClass}>
        <div className={styles.sectionContent}>
          {props.children}
        </div>
        {hasMedia && (
          <div className={mediaClass}>{props.media}</div>
        )}
      </div>
    </section>
  );
}

export function CaseTypoProse(props: { paragraphs: string[] }) {
  return (
    <div className={styles.prose}>
      {props.paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}
    </div>
  );
}

function renderBodyEnd(bodyEnd: string[], lastAsHeader?: boolean) {
  if (!bodyEnd.length) return null;
  const last = bodyEnd[bodyEnd.length - 1];
  const isLeadIn = last.endsWith(":");
  const proseParas = isLeadIn && bodyEnd.length > 1 ? bodyEnd.slice(0, -1) : bodyEnd;
  if (lastAsHeader && bodyEnd.length > 1) {
    const proseOnly = bodyEnd.slice(0, -1);
    return (
      <>
        {proseOnly.length ? <CaseTypoProse paragraphs={proseOnly} /> : null}
        <div className={styles.stackedImageHeader}>{last}</div>
      </>
    );
  }
  return (
    <>
      {proseParas.length ? <CaseTypoProse paragraphs={proseParas} /> : null}
      {isLeadIn ? (
        <p className={styles.identifiedLeadIn}>{last}</p>
      ) : null}
    </>
  );
}

function CaseTypoProseWithInlineMedia(props: {
  paragraphs: string[];
  inlineMedia?: InlineMedia[];
  imageStartIndex?: number;
  allImages?: Array<{ src: string; alt?: string; caption?: string }>;
  onImageClick?: (index: number) => void;
}) {
  const { paragraphs, inlineMedia, imageStartIndex, allImages, onImageClick } =
    props;
  const canOpenGallery =
    allImages &&
    allImages.length > 0 &&
    onImageClick != null &&
    imageStartIndex != null;

  if (!inlineMedia?.length) {
    return <CaseTypoProse paragraphs={paragraphs} />;
  }

  const mediaByIndex = new Map<number, InlineMedia[]>();
  for (const im of inlineMedia) {
    const list = mediaByIndex.get(im.afterParagraph) ?? [];
    list.push(im);
    mediaByIndex.set(im.afterParagraph, list);
  }
  let runningImageIndex = imageStartIndex ?? 0;

  return (
    <div className={styles.prose}>
      {paragraphs.map((p, idx) => (
        <Fragment key={idx}>
          <p>{p}</p>
          {mediaByIndex.get(idx)?.map((im, i) => {
            if (im.type === "quote") {
              return (
                <UserFeedbackQuote
                  key={`inline-quote-${idx}-${i}`}
                  quote={im.text}
                  attribution={im.attribution}
                />
              );
            }
            const currentIndex = runningImageIndex;
            runningImageIndex += 1;
            return (
              <figure
                key={`inline-img-${idx}-${i}`}
                className={styles.figure}
              >
                <CaseStudyGalleryImage
                  image={{ src: im.src, alt: im.alt }}
                  index={currentIndex}
                  onOpen={onImageClick!}
                  disableGallery={true}
                />
              </figure>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export function CaseTypoBullets(props: {
  items: string[];
  variant?: "challenge" | "outcome" | "identified" | "questions" | "action";
}) {
  return (
    <ul
      className={
        props.variant === "outcome"
          ? `${styles.bullets} ${styles.bulletsOutcome}`
          : props.variant === "identified"
            ? `${styles.bullets} ${styles.bulletsIdentified}`
            : props.variant === "questions"
              ? `${styles.bullets} ${styles.bulletsQuestions}`
              : props.variant === "action"
                ? `${styles.bullets} ${styles.bulletsAction}`
                : styles.bullets
      }
    >
      {props.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export function CaseTypoQuote(props: {
  quote: string;
  attribution?: string;
  variant?: "problem" | "benefit";
}) {
  if (props.variant === "problem" || props.variant === "benefit") {
    return (
      <blockquote
        className={
          props.variant === "problem"
            ? `${styles.stickyNote} ${styles.stickyNoteProblem}`
            : `${styles.stickyNote} ${styles.stickyNoteBenefit}`
        }
      >
        {props.quote}
      </blockquote>
    );
  }
  return (
    <figure className={styles.quoteWrap}>
      <blockquote className={styles.quote}>{props.quote}</blockquote>
      {props.attribution && (
        <figcaption className={styles.quoteAttribution}>
          {props.attribution}
        </figcaption>
      )}
    </figure>
  );
}

function CaseTypographicSummaryStory({ study }: { study: CaseStudy }) {
  const sections = deriveSummarySections(study);

  return (
    <div className={styles.story}>
      {sections.map((section) => {
        const paragraphs =
          section.paragraphs.length > 0
            ? [`${section.lead} ${section.paragraphs[0]}`, ...section.paragraphs.slice(1)]
            : [section.lead];

        return (
          <CaseTypoSection key={section.id} title={section.title}>
            <div className={styles.summaryBlock}>
              <CaseTypoProse paragraphs={paragraphs} />
              {section.bullets?.length ? (
                <CaseTypoBullets
                  items={section.bullets}
                  variant={section.id === "solution" ? "identified" : "outcome"}
                />
              ) : null}
            </div>
          </CaseTypoSection>
        );
      })}
    </div>
  );
}

function splitLeadUserFeedbackQuote(
  media: CaseMedia[] | undefined,
): { leadMedia: CaseMedia | null; remainingMedia: CaseMedia[] } {
  if (!media?.length) return { leadMedia: null, remainingMedia: media ?? [] };
  const first = media[0];
  if (first?.type === "userFeedbackQuote" && first.text) {
    return { leadMedia: first, remainingMedia: media.slice(1) };
  }
  return { leadMedia: null, remainingMedia: media };
}

function renderSectionMedia(
  media: CaseMedia[] | undefined,
  defaultQuoteVariant?: "problem" | "benefit",
  imageStartIndex?: number,
  allImages?: Array<{ src: string; alt?: string; caption?: string }>,
  onImageClick?: (index: number) => void,
  studySlug?: string,
) {
  if (!media || media.length === 0) return null;

  const canOpenGallery =
    allImages &&
    allImages.length > 0 &&
    onImageClick != null &&
    imageStartIndex != null;

  let runningImageIndex = imageStartIndex ?? 0;

  return (
    <>
      {media.map((m, idx) => {
        if (m.type === "component" && m.componentId) {
          if (m.componentId === "diagnosing-root-causes") {
            const variant =
              studySlug === "wondr-medical-zero-to-one"
                ? "wondr"
                : studySlug === "seedrs-secondary-market"
                  ? "secondary-market"
                  : "health";
            return (
              <DiagnosingRootCauses
                key={`component-${idx}`}
                variant={variant}
              />
            );
          }
          if (m.componentId === "route-to-success") {
            return <RouteToSuccess key={`component-${idx}`} />;
          }
          if (m.componentId === "route-to-success-insights") {
            return <RouteToSuccess key={`component-${idx}`} variant="insights" />;
          }
          if (m.componentId === "seedrs-core-areas") {
            return <SeedrsCoreAreas key={`component-${idx}`} />;
          }
          if (m.componentId === "seedrs-prioritisation") {
            return <SeedrsPrioritisation key={`component-${idx}`} />;
          }
          if (m.componentId === "wondr-mixed-media-grid") {
            return <WondrMixedMediaGrid key={`component-${idx}`} />;
          }
          return null;
        }
        if (m.type === "embed" && m.src) {
          const height = m.embedHeight ?? 600;
          const heightMobile = m.embedHeightMobile ?? 500;
          return (
            <figure
              key={`embed-${idx}`}
              className={styles.caseStudyEmbed}
              style={
                {
                  "--embed-height": `${height}px`,
                  "--embed-height-mobile": `${heightMobile}px`,
                } as React.CSSProperties
              }
            >
              <iframe
                src={m.src}
                className={styles.caseStudyEmbedIframe}
                title={m.caption ?? "Embedded content"}
              />
              {m.caption && (
                <figcaption className={styles.figureCaption}>{m.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (m.type === "video" && m.src) {
          return (
            <figure key={`video-${idx}`} className={styles.caseStudyVideo}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={m.src}
                autoPlay
                loop
                muted
                playsInline
                controls
                className={styles.caseStudyVideoElement}
              />
              {m.caption && (
                <figcaption className={styles.figureCaption}>{m.caption}</figcaption>
              )}
            </figure>
          );
        }
        if (m.type === "image" && m.src) {
          const currentIndex = runningImageIndex;
          runningImageIndex += 1;
          return (
            <CaseStudyGalleryImage
              key={`img-${idx}`}
              image={{ src: m.src, alt: m.alt, caption: m.caption }}
              index={canOpenGallery ? currentIndex : 0}
              onOpen={canOpenGallery ? onImageClick! : () => {}}
              disableGallery={true}
            />
          );
        }
        if (m.type === "stackedImages" && m.items?.length) {
          const startIndex = runningImageIndex;
          runningImageIndex += m.items.length;
          return (
            <StackedImagesWithHeaders
              key={`stacked-${idx}`}
              items={m.items}
              startIndex={startIndex}
              onImageClick={undefined}
            />
          );
        }
        if (m.type === "quote" && m.text) {
          return (
            <CaseTypoQuote
              key={`quote-${idx}`}
              quote={m.text}
              variant={m.variant ?? defaultQuoteVariant}
            />
          );
        }
        if (m.type === "userFeedbackQuote" && m.text) {
          return (
            <UserFeedbackQuote
              key={`user-feedback-${idx}`}
              quote={m.text}
              attribution={m.attribution}
            />
          );
        }
        if (m.type === "note" && m.text) {
          return (
            <aside key={`note-${idx}`} className={styles.note}>
              {m.text}
            </aside>
          );
        }
        return null;
      })}
    </>
  );
}

function countSectionImages(
  media: CaseMedia[] | undefined,
  inlineMedia?: InlineMedia[],
): number {
  let count = 0;
  if (media) {
    for (const m of media) {
      if (m.type === "image" && m.src) count += 1;
      if (m.type === "stackedImages" && m.items?.length && !m.disableGallery)
        count += m.items.length;
    }
  }
  const inlineImageCount =
    inlineMedia?.filter((im) => im.type === "image").length ?? 0;
  return count + inlineImageCount;
}

function getLeadInText(section: CaseSection): string | undefined {
  if (section.leadIn) return section.leadIn;
  const known = ["We identified:", "As a result", "This included:", "Issues we identified:", "More specifically:", "Our mission was focused but ambitious:", "These conversations revealed clear themes:", "I complemented this with:"];
  return section.body.find((b) => known.includes(b));
}

function getProseParagraphs(section: CaseSection): string[] {
  if (!section.identifiedItems) return section.body;
  const leadIn = getLeadInText(section);
  if (leadIn) return section.body.filter((b) => b !== leadIn);
  const last = section.body[section.body.length - 1];
  if (last && ["We identified:", "This led to:", "This included:", "Issues we identified:"].includes(last)) {
    return section.body.slice(0, -1);
  }
  return section.body;
}

function renderSectionContent(
  section: CaseSection,
  study: CaseStudy,
  imageContext?: {
    sectionImgStart: number;
    sectionMediaCount: number;
    allImages: Array<{ src: string; alt?: string; caption?: string }>;
    onImageClick: (index: number) => void;
  },
  leadUserFeedbackQuote?: React.ReactNode,
) {
  if (section.id === "further-action-taken-exploration") {
    return <SeedrsFurtherActionExploration />;
  }

  const proseWithInline = (
    paragraphs: string[],
    inlineMedia?: InlineMedia[],
  ) =>
    inlineMedia?.length && imageContext ? (
      <CaseTypoProseWithInlineMedia
        paragraphs={paragraphs}
        inlineMedia={inlineMedia}
        imageStartIndex={
          imageContext.sectionImgStart + imageContext.sectionMediaCount
        }
        allImages={imageContext.allImages}
        onImageClick={imageContext.onImageClick}
      />
    ) : (
      <CaseTypoProse paragraphs={paragraphs} />
    );

  if (
    section.leadIn &&
    (!section.identifiedItems || section.identifiedItems.length === 0)
  ) {
    const proseParas = section.body.filter((b) => b !== section.leadIn);
    return (
      <div className={styles.proseBlock}>
        <div className={styles.prose}>
          {proseParas.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        <div className={styles.identifiedBlock}>
          <p className={styles.identifiedLeadIn}>{section.leadIn}</p>
        </div>
      </div>
    );
  }
  if (section.id === "impact" && study.outcomes?.length && !section.identifiedItems?.length) {
    const impactLeadIn = "More specifically:";
    const impactProse = section.body[section.body.length - 1] === impactLeadIn
      ? section.body.slice(0, -1)
      : section.body;
    return (
      <div className={styles.proseBlock}>
        <div className={styles.prose}>
          {leadUserFeedbackQuote}
          {impactProse.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
        <div className={styles.identifiedBlock}>
          <p className={styles.identifiedLeadIn}>{impactLeadIn}</p>
          <CaseTypoBullets items={study.outcomes} variant={section.bulletStyle ?? "outcome"} />
        </div>
      </div>
    );
  }
  if (section.identifiedItems && section.identifiedItems.length > 0) {
    const leadIn = getLeadInText(section);
    const proseParas = getProseParagraphs(section);
    const variant =
      section.id === "action-taken" || section.bulletStyle === "action"
        ? "action"
        : section.bulletStyle === "outcome"
          ? "outcome"
          : section.bulletStyle === "questions"
            ? "questions"
            : "identified";
    const hasSeedrsPrioritisation =
      section.id === "research" &&
      section.media?.some(
        (m) => m.type === "component" && m.componentId === "seedrs-prioritisation",
      );
    const hasSeedrsResearchInsights =
      section.id === "research" &&
      section.media?.some(
        (m) => m.type === "component" && m.componentId === "seedrs-research-insights",
      );

    if (hasSeedrsPrioritisation && hasSeedrsResearchInsights) {
      return (
        <>
          <div className={styles.proseBlock}>
            {section.id === "impact" && leadUserFeedbackQuote ? (
              <div className={styles.prose}>
                <CaseTypoProse paragraphs={proseParas} />
                {leadUserFeedbackQuote}
              </div>
            ) : (
              proseWithInline(proseParas, section.inlineMedia)
            )}
            <div className={styles.identifiedBlock}>
              {leadIn && <p className={styles.identifiedLeadIn}>{leadIn}</p>}
              <CaseTypoBullets items={section.identifiedItems} variant={variant} />
            </div>
            <SeedrsPrioritisation />
          </div>
          <SeedrsPrioritisationTabletImage />
          <div className={styles.proseBlock}>
            <SeedrsResearchInsights />
            {section.bodyEnd?.length ? renderBodyEnd(section.bodyEnd, section.id === "iteration-prototyping") : null}
          </div>
        </>
      );
    }

    return (
      <div className={styles.proseBlock}>
        {section.id === "impact" && leadUserFeedbackQuote ? (
          <div className={styles.prose}>
            <CaseTypoProse paragraphs={proseParas} />
            {leadUserFeedbackQuote}
          </div>
        ) : (
          proseWithInline(proseParas, section.inlineMedia)
        )}
        <div className={styles.identifiedBlock}>
          {leadIn && <p className={styles.identifiedLeadIn}>{leadIn}</p>}
          <CaseTypoBullets items={section.identifiedItems} variant={variant} />
        </div>
        {hasSeedrsPrioritisation ? <SeedrsPrioritisation /> : null}
        {hasSeedrsResearchInsights ? <SeedrsResearchInsights /> : null}
        {section.id !== "impact" && leadUserFeedbackQuote}
        {section.bodyEnd?.length ? renderBodyEnd(section.bodyEnd, section.id === "iteration-prototyping") : null}
        {section.id === "context" &&
        section.media?.some(
          (m) => m.type === "component" && m.componentId === "seedrs-core-areas",
        ) ? (
          <SeedrsCoreAreas />
        ) : null}
      </div>
    );
  }
  if (section.bulletStyle && section.body.every((b) => b.length < 200)) {
    return (
      <CaseTypoBullets items={section.body} variant={section.bulletStyle} />
    );
  }
  if (section.id === "validating-experiments") {
    const mediaByIndex = new Map<number, InlineMedia[]>();
    for (const im of section.inlineMedia ?? []) {
      const list = mediaByIndex.get(im.afterParagraph) ?? [];
      list.push(im);
      mediaByIndex.set(im.afterParagraph, list);
    }
    let runningImageIndex = (imageContext?.sectionImgStart ?? 0) + (imageContext?.sectionMediaCount ?? 0);
    const canOpenGallery =
      imageContext?.allImages?.length &&
      imageContext?.onImageClick != null;

    return (
      <>
        {section.body.map((paragraph, idx) => {
          const dashIndex = paragraph.indexOf(" — ");
          const isExperiment = /^Experiment \d+:/i.test(paragraph) && dashIndex > 0;
          const blockContent = isExperiment ? (
            <div className={`${styles.stackedImageItem} ${styles.experimentBlock}`}>
              <div className={styles.stackedImageHeader}>{paragraph.slice(0, dashIndex)}</div>
              <p>{paragraph.slice(dashIndex + 3)}</p>
            </div>
          ) : (
            <p>{paragraph}</p>
          );
          const inlineMediaItems = mediaByIndex.get(idx) ?? [];
          const proseWidthImages = inlineMediaItems.filter(
            (im): im is Extract<InlineMedia, { type: "image" }> => im.type === "image" && im.matchProseWidth === true,
          );
          const breakoutImages = inlineMediaItems.filter(
            (im): im is Extract<InlineMedia, { type: "image" }> => im.type === "image" && im.matchProseWidth !== true,
          );

          return (
            <Fragment key={idx}>
              <div className={styles.proseBlock}>
                <div className={styles.prose}>
                  {blockContent}
                </div>
                {inlineMediaItems
                  .filter((im): im is Extract<InlineMedia, { type: "quote" }> => im.type === "quote")
                  .map((im, i) => (
                    <UserFeedbackQuote
                      key={`inline-quote-${idx}-${i}`}
                      quote={im.text}
                      attribution={im.attribution}
                    />
                  ))}
                {proseWidthImages.map((im, i) => {
                  const currentIndex = runningImageIndex;
                  runningImageIndex += 1;
                  return (
                    <figure key={`inline-img-${idx}-${i}`} className={styles.figureProseWidth}>
                      <CaseStudyGalleryImage
                        image={{ src: im.src, alt: im.alt }}
                        index={currentIndex}
                        onOpen={imageContext!.onImageClick}
                        disableGallery={true}
                      />
                    </figure>
                  );
                })}
              </div>
              {breakoutImages.map((im, i) => {
                const currentIndex = runningImageIndex;
                runningImageIndex += 1;
                return (
                  <figure key={`inline-img-${idx}-${i}`} className={styles.figureBreakoutFull}>
                    <CaseStudyGalleryImage
                      image={{ src: im.src, alt: im.alt }}
                      index={currentIndex}
                      onOpen={imageContext!.onImageClick}
                      disableGallery={true}
                    />
                  </figure>
                );
              })}
            </Fragment>
          );
        })}
      </>
    );
  }
  return proseWithInline(section.body, section.inlineMedia);
}

export function CaseTypographicStory({
  study,
  mode = "full",
}: {
  study: CaseStudy;
  mode?: CaseStudyViewMode;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = extractAllCaseStudyImages(study);

  const quote = getFirstMediaOfType(study, "quote");

  if (mode === "summary") {
    return <CaseTypographicSummaryStory study={study} />;
  }

  const useTwoColumn = study.sections.some((s) => (s.media?.length ?? 0) > 0);
  const sectionImageStarts = study.sections.reduce(
    (acc, section) => {
      const start = acc.running;
      const nextRunning =
        acc.running + countSectionImages(section.media, section.inlineMedia);
      return { starts: [...acc.starts, start], running: nextRunning };
    },
    { starts: [] as number[], running: 0 },
  ).starts;
  const openLightbox = (i: number) => setLightboxIndex(i);

  return (
    <div className={styles.story}>
      {study.sections.map((section, idx) => {
        const sectionImgStart = sectionImageStarts[idx] ?? 0;
        const defaultQuoteVariant =
          idx === 0 ? "problem" : idx === study.sections.length - 1 ? "benefit" : undefined;
        const { leadMedia: leadMediaItem, remainingMedia } = splitLeadUserFeedbackQuote(section.media);
        const leadUserFeedbackQuote =
          leadMediaItem?.type === "userFeedbackQuote" && leadMediaItem.text ? (
            <UserFeedbackQuote
              quote={leadMediaItem.text}
              attribution={leadMediaItem.attribution}
            />
          ) : null;
        const mediaToRender =
          section.id === "context"
            ? remainingMedia?.filter(
                (m) =>
                  !(m.type === "component" && m.componentId === "seedrs-core-areas"),
              )
            : section.id === "research"
              ? remainingMedia?.filter(
                  (m) =>
                    !(m.type === "component" && m.componentId === "seedrs-prioritisation") &&
                    !(m.type === "component" && m.componentId === "seedrs-research-insights"),
                )
              : section.id === "further-action-taken-exploration"
                ? remainingMedia?.filter(
                    (m) =>
                      !(m.type === "component" && m.componentId === "seedrs-further-action-exploration"),
                  )
                : remainingMedia;
        return (
          <CaseTypoSection
            key={section.id}
            title={section.title}
            sectionId={section.id}
            studySlug={study.slug}
            contentHeader={
              section.id === "impact" && leadUserFeedbackQuote ? (
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              ) : undefined
            }
            media={renderSectionMedia(
              mediaToRender,
              defaultQuoteVariant,
              sectionImgStart,
              allImages,
              openLightbox,
              study.slug,
            )}
            twoColumn={useTwoColumn && (section.media?.length ?? 0) > 0 && section.id !== "further-action-taken-exploration"}
            twoColumnLayout={false}
            mediaFullWidth={(section.body?.length ?? 0) === 0}
          >
            {renderSectionContent(
              section,
              study,
              {
                sectionImgStart,
                sectionMediaCount: countSectionImages(section.media),
                allImages,
                onImageClick: openLightbox,
              },
              leadUserFeedbackQuote,
            )}
          </CaseTypoSection>
        );
      })}

      {quote?.text && !useTwoColumn && (
        <div className={styles.breakout}>
          <CaseTypoQuote quote={quote.text} />
        </div>
      )}

      {allImages.length > 0 && (
        <Lightbox
          open={lightboxIndex !== null}
          close={() => setLightboxIndex(null)}
          index={lightboxIndex ?? 0}
          slides={allImages.map((img) => ({ src: img.src }))}
        />
      )}
    </div>
  );
}

