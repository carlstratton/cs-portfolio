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
    }
  }
  return images;
}

type CaseStudyGalleryImageProps = {
  image: CaseStudyImage;
  index: number;
  onOpen: (index: number) => void;
};

export function CaseStudyGalleryImage({
  image,
  index,
  onOpen,
}: CaseStudyGalleryImageProps) {
  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.galleryImageButton}
        onClick={() => onOpen(index)}
        aria-label={image.alt ?? "View image"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt ?? ""} />
      </button>
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}
