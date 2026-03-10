#!/usr/bin/env node
/**
 * Counts words in case study content and estimates read time.
 * Uses ~225 wpm (educated adult reading speed).
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WPM = 225;

function wordCount(str) {
  if (!str || typeof str !== "string") return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function countCaseStudy(study) {
  let total = 0;
  total += wordCount(study.title);
  total += wordCount(study.summary);
  (study.outcomes || []).forEach((o) => (total += wordCount(o)));
  (study.sections || []).forEach((sec) => {
    total += wordCount(sec.title);
    (sec.body || []).forEach((p) => (total += wordCount(p)));
    total += wordCount(sec.leadIn);
    (sec.identifiedItems || []).forEach((i) => (total += wordCount(i)));
    (sec.bodyEnd || []).forEach((p) => (total += wordCount(p)));
    (sec.inlineMedia || []).forEach((m) => {
      if (m.text) total += wordCount(m.text);
    });
    (sec.media || []).forEach((m) => {
      if (m.text) total += wordCount(m.text);
      if (m.type === "userFeedbackQuote" && m.text) total += wordCount(m.text);
    });
  });
  return total;
}

const files = [
  "cs-intro-doc.json",
  "seedrs-investor-focus.json",
  "seedrs-secondary-market.json",
  "platform-investment-clarity.json",
];

const base = join(__dirname, "..", "content", "case-studies");

for (const f of files) {
  const path = join(base, f);
  const study = JSON.parse(readFileSync(path, "utf-8"));
  const words = countCaseStudy(study);
  const minutes = Math.round(words / WPM);
  const display = minutes < 1 ? "1" : String(minutes);
  console.log(`${study.slug}: ${words} words → ${display} MINUTE READ`);
}
