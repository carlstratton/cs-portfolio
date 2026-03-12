"use client";

import { Fragment, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./CaseTypographicBlocks.lightbox.css";
import type {
  CaseMedia,
  CaseSection,
  CaseStudy,
  InlineMedia,
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
  const proseParas = isLeadIn ? bodyEnd.slice(0, -1) : bodyEnd;
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

export function CaseTypographicStory({ study }: { study: CaseStudy }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = extractAllCaseStudyImages(study);

  const quote = getFirstMediaOfType(study, "quote");

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

