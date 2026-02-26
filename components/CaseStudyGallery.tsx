"use client";

import type { CaseStudy } from "@/types/caseStudy";
import styles from "./CaseTypographicBlocks.module.css";

export type CaseStudyImage = { src: string; alt?: string; caption?: string };

export function extractAllCaseStudyImages(study: CaseStudy): CaseStudyImage[] {
  const images: CaseStudyImage[] = [];
  for (const section of study.sections) {
    for (const m of section.media ?? []) {
      if (m.type === "image" && m.src) {
        images.push({
          src: m.src,
          alt: m.alt,
          caption: m.caption,
        });
      }
      if (m.type === "stackedImages" && m.items?.length && !m.disableGallery) {
        for (const item of m.items) {
          images.push({
            src: item.src,
            alt: item.alt,
          });
        }
      }
    }
    for (const im of section.inlineMedia ?? []) {
      if (im.type === "image") {
        images.push({ src: im.src, alt: im.alt });
      }
    }
  }
  return images;
}

type CaseStudyGalleryImageProps = {
  image: CaseStudyImage;
  index: number;
  onOpen: (index: number) => void;
  /** When true, image is not clickable (no lightbox, no hover link) */
  disableGallery?: boolean;
};

export function CaseStudyGalleryImage({
  image,
  index,
  onOpen,
  disableGallery,
}: CaseStudyGalleryImageProps) {
  if (disableGallery) {
    return (
      <figure className={styles.figure}>
        <span className={styles.galleryImageBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt ?? ""} />
        </span>
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.galleryImageButton}
        onClick={() => onOpen(index)}
        aria-label={image.alt ?? "View image"}
      >
        <span className={styles.galleryImageBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt ?? ""} />
        </span>
      </button>
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}
