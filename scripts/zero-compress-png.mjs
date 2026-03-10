#!/usr/bin/env node
/**
 * Re-save PNG files with zero compression (compressionLevel: 0).
 * Usage: node scripts/zero-compress-png.mjs <file1> [file2] ...
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);

if (files.length === 0) {
  const base = join(__dirname, "..", "public", "case-studies");
  files.push(
    join(base, "wondr-wm-screens-1.png"),
    join(base, "wondr-wm-screens-2.png"),
    join(base, "wondr-wm-screens-3.png")
  );
}

for (const file of files) {
  try {
    const buffer = readFileSync(file);
    const output = await sharp(buffer)
      .png({ compressionLevel: 0 })
      .toBuffer();
    writeFileSync(file, output);
    console.log(`Re-saved ${file} with zero compression`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
}
