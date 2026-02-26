"use client";

import Image from "next/image";
import styles from "./UserFeedbackQuote.module.css";

type UserFeedbackQuoteProps = {
  quote: string;
  attribution?: string;
};

/**
 * Reusable quote block with decorative quote mark SVG.
 * Centered layout, responsive, text flows and wraps.
 */
export function UserFeedbackQuote({ quote, attribution }: UserFeedbackQuoteProps) {
  return (
    <figure className={styles.wrap}>
      <div className={styles.quoteMarkWrap}>
        <span className={styles.quoteMark} aria-hidden>
          <Image
            src="/icons/quote.svg"
            alt=""
            width={65}
            height={57}
            className={styles.quoteSvg}
          />
        </span>
      </div>
      <div className={styles.quoteContent}>
        <blockquote className={styles.quote}>
          <span className={styles.quoteText}>{quote}</span>
        </blockquote>
        {attribution && (
          <figcaption className={styles.attribution}>{attribution}</figcaption>
        )}
      </div>
    </figure>
  );
}
