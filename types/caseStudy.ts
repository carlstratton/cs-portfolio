export type MediaKind =
  | "image"
  | "video"
  | "embed"
  | "quote"
  | "note"
  | "component"
  | "stackedImages"
  | "userFeedbackQuote";

export interface StackedImageItem {
  src: string;
  alt?: string;
  header?: string;
}

export interface CaseMedia {
  type: MediaKind;
  src?: string;
  alt?: string;
  caption?: string;
  text?: string;
  /** For quote/note: "problem" = pink sticky, "benefit" = green sticky */
  variant?: "problem" | "benefit";
  /** For type "component": id of the custom component to render (e.g. "diagnosing-root-causes") */
  componentId?: string;
  /** For type "stackedImages": array of images with optional headers */
  items?: StackedImageItem[];
  /** For type "stackedImages" or "image": when true, images are not clickable (no lightbox) */
  disableGallery?: boolean;
  /** For type "userFeedbackQuote": attribution text (e.g. "User Feedback") */
  attribution?: string;
  /** For type "embed": height in pixels (default 600) */
  embedHeight?: number;
  /** For type "embed": height in pixels on mobile viewport (default 500 if not set) */
  embedHeightMobile?: number;
}

export type InlineMedia =
  | { afterParagraph: number; type: "image"; src: string; alt?: string; matchProseWidth?: boolean }
  | {
      afterParagraph: number;
      type: "quote";
      text: string;
      attribution?: string;
    };

export interface CaseSection {
  id: string;
  title: string;
  body: string[];
  media?: CaseMedia[];
  /** Images to render between body paragraphs (0-based index) */
  inlineMedia?: InlineMedia[];
  emphasis?: boolean;
  /** Bullets styling for sections and lists */
  bulletStyle?: "challenge" | "outcome" | "identified" | "questions" | "action";
  /** Sub-bullets under "We identified:", "This led to:", or custom lead-in with red !! icon */
  identifiedItems?: string[];
  /** Custom lead-in text before identifiedItems (e.g. "Our mission was focused but ambitious:") */
  leadIn?: string;
  /** Paragraphs to render after identifiedItems (e.g. closing thought) */
  bodyEnd?: string[];
}

export interface CaseStudyMeta {
  slug: string;
  title: string;
  client?: string;
  company?: string;
  summary: string;
  role: string[];
  timeframe: string;
  outcomes: string[];
  tags: string[];
  hero: string;
  /** Optional badge/logo for Selected Projects cards */
  badge?: string;
  /** Optional card image (thumbnail) for Selected Projects; falls back to hero */
  cardImage?: string;
  /** Type badges shown at bottom of card (e.g. "ZERO → ONE", "DISCOVERY") */
  typeBadges?: string[];
  sector?: string;
  deliverables?: string;
  /** When true, hidden from home/Selected projects and noindex for search engines */
  private?: boolean;
  /** Approximate read time in minutes for educated adult readers (~225 wpm) */
  readTime?: number;
}

export interface CaseStudy extends CaseStudyMeta {
  sections: CaseSection[];
}
