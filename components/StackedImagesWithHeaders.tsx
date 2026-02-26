"use client";

import type { StackedImageItem } from "@/types/caseStudy";
import { CaseStudyGalleryImage } from "./CaseStudyGallery";
import styles from "./CaseTypographicBlocks.module.css";

type StackedImagesWithHeadersProps = {
  items: StackedImageItem[];
  startIndex: number;
  onImageClick?: (index: number) => void;
};

export function StackedImagesWithHeaders({
  items,
  startIndex,
  onImageClick,
}: StackedImagesWithHeadersProps) {
  const canOpenGallery = onImageClick != null;

  return (
    <div className={styles.stackedImages}>
      {items.map((item, i) => (
        <div key={i} className={styles.stackedImageItem}>
          {item.header && (
            <div className={styles.stackedImageHeader}>{item.header}</div>
          )}
          {canOpenGallery ? (
            <CaseStudyGalleryImage
              image={{ src: item.src, alt: item.alt }}
              index={startIndex + i}
              onOpen={onImageClick}
            />
          ) : (
            <figure className={styles.figure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt ?? ""} />
            </figure>
          )}
        </div>
      ))}
    </div>
  );
}
