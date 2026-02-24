"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "./CaseTypographicBlocks.lightbox.css";
import type { CaseMedia, CaseSection, CaseStudy } from "@/types/caseStudy";
import {
  CaseStudyGalleryImage,
  extractAllCaseStudyImages,
} from "./CaseStudyGallery";
import { DiagnosingRootCauses } from "./DiagnosingRootCauses";
import { RouteToSuccess } from "./RouteToSuccess";
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

export function CaseTypoSection(props: {
  title: string;
  children: React.ReactNode;
  media?: React.ReactNode;
  twoColumn?: boolean;
  twoColumnLayout?: boolean;
}) {
  const hasMedia = props.media != null && props.twoColumn;
  const bodyClass = hasMedia
    ? props.twoColumnLayout
      ? `${styles.sectionBody} ${styles.sectionBodyTwoColumn}`
      : styles.sectionBody
    : styles.sectionBodySingle;
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{props.title}</h2>
      </header>
      <div className={bodyClass}>
        <div className={styles.sectionContent}>{props.children}</div>
        {hasMedia && (
          <div className={styles.sectionMedia}>{props.media}</div>
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

export function CaseTypoBullets(props: {
  items: string[];
  variant?: "challenge" | "outcome" | "identified" | "action";
}) {
  return (
    <ul
      className={
        props.variant === "outcome"
          ? `${styles.bullets} ${styles.bulletsOutcome}`
          : props.variant === "identified"
            ? `${styles.bullets} ${styles.bulletsIdentified}`
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

function renderSectionMedia(
  media: CaseMedia[] | undefined,
  defaultQuoteVariant?: "problem" | "benefit",
  imageStartIndex?: number,
  allImages?: Array<{ src: string; alt?: string; caption?: string }>,
  onImageClick?: (index: number) => void,
  studySlug?: string,
) {
  if (!media || media.length === 0) return null;

  const images = media.filter(
    (m): m is CaseMedia & { type: "image"; src: string } =>
      m.type === "image" && !!m.src,
  );
  const components = media.filter(
    (m): m is CaseMedia & { type: "component"; componentId: string } =>
      m.type === "component" && !!m.componentId,
  );
  const imageItems = images.map((m) => ({
    src: m.src,
    alt: m.alt,
    caption: m.caption,
  }));

  const canOpenGallery =
    allImages &&
    allImages.length > 0 &&
    onImageClick != null &&
    imageStartIndex != null;

  return (
    <>
      {components.map((m, idx) => {
        if (m.componentId === "diagnosing-root-causes") {
          const variant =
            studySlug === "wondr-medical-zero-to-one" ? "wondr" : "health";
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
        return null;
      })}
      {imageItems.length > 0 &&
        imageItems.map((img, i) => (
          <CaseStudyGalleryImage
            key={`img-${canOpenGallery ? imageStartIndex! + i : i}`}
            image={img}
            index={canOpenGallery ? imageStartIndex! + i : 0}
            onOpen={canOpenGallery ? onImageClick : () => {}}
          />
        ))}
      {media.map((m, idx) => {
        if (m.type === "quote" && m.text) {
          return (
            <CaseTypoQuote
              key={`quote-${idx}`}
              quote={m.text}
              variant={m.variant ?? defaultQuoteVariant}
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

function countSectionImages(media: CaseMedia[] | undefined): number {
  if (!media) return 0;
  return media.filter((m) => m.type === "image" && m.src).length;
}

function getLeadInText(section: CaseSection): string | undefined {
  if (section.leadIn) return section.leadIn;
  const known = ["We identified:", "This led to:", "Our mission was focused but ambitious:", "These conversations revealed clear themes:", "I complemented this with:"];
  return section.body.find((b) => known.includes(b));
}

function getProseParagraphs(section: CaseSection): string[] {
  if (!section.identifiedItems) return section.body;
  const leadIn = getLeadInText(section);
  if (leadIn) return section.body.filter((b) => b !== leadIn);
  const last = section.body[section.body.length - 1];
  if (last && ["We identified:", "This led to:"].includes(last)) {
    return section.body.slice(0, -1);
  }
  return section.body;
}

function renderSectionContent(section: CaseSection, study: CaseStudy) {
  if (section.id === "impact" && study.outcomes?.length && !section.identifiedItems?.length) {
    return (
      <>
        <CaseTypoProse paragraphs={section.body} />
        <CaseTypoBullets items={study.outcomes} variant={section.bulletStyle ?? "outcome"} />
      </>
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
          : "identified";
    return (
      <div className={styles.proseBlock}>
        <CaseTypoProse paragraphs={proseParas} />
        {leadIn && <p className={styles.identifiedLeadIn}>{leadIn}</p>}
        <CaseTypoBullets items={section.identifiedItems} variant={variant} />
        {section.bodyEnd?.length ? (
          <CaseTypoProse paragraphs={section.bodyEnd} />
        ) : null}
      </div>
    );
  }
  if (section.bulletStyle && section.body.every((b) => b.length < 200)) {
    return (
      <CaseTypoBullets items={section.body} variant={section.bulletStyle} />
    );
  }
  return <CaseTypoProse paragraphs={section.body} />;
}

export function CaseTypographicStory({ study }: { study: CaseStudy }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = extractAllCaseStudyImages(study);

  const quote = getFirstMediaOfType(study, "quote");

  const whyItMatters = [
    "Money moves culture. When financial products create uncertainty, that uncertainty lands on real people.",
    study.summary,
  ];

  const useTwoColumn = study.sections.some((s) => (s.media?.length ?? 0) > 0);
  const sectionImageStarts = study.sections.reduce(
    (acc, section) => {
      const start = acc.running;
      const nextRunning = acc.running + countSectionImages(section.media);
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
        return (
          <CaseTypoSection
            key={section.id}
            title={section.title}
            media={renderSectionMedia(
              section.media,
              defaultQuoteVariant,
              sectionImgStart,
              allImages,
              openLightbox,
              study.slug,
            )}
            twoColumn={useTwoColumn && (section.media?.length ?? 0) > 0}
            twoColumnLayout={section.id === "iteration-prototyping" || section.id === "validating-experiments"}
          >
            {renderSectionContent(section, study)}
          </CaseTypoSection>
        );
      })}

      {quote?.text && !useTwoColumn && (
        <div className={styles.breakout}>
          <CaseTypoQuote quote={quote.text} />
        </div>
      )}

      <CaseTypoSection title="Why it matters">
        <CaseTypoProse paragraphs={whyItMatters} />
      </CaseTypoSection>

      {allImages.length > 0 && (
        <Lightbox
          open={lightboxIndex !== null}
          close={() => setLightboxIndex(null)}
          index={lightboxIndex ?? 0}
          slides={allImages.map((img) => ({ src: img.src }))}
          plugins={[Thumbnails]}
        />
      )}
    </div>
  );
}

