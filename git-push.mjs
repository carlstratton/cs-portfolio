#!/usr/bin/env node
/**
 * Commit and push using isomorphic-git (bypasses Xcode license requirement).
 * Requires: GITHUB_TOKEN env var (create at https://github.com/settings/tokens)
 * Run: GITHUB_TOKEN=your_token node git-push.mjs
 */

import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname);

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is required.");
    console.error("Create a token at https://github.com/settings/tokens");
    console.error("Run: GITHUB_TOKEN=your_token node git-push.mjs");
    process.exit(1);
  }

  try {
    const status = await git.statusMatrix({ fs, dir });
    let staged = 0;
    for (const [filepath, head, workdir] of status) {
      if (workdir === 0) {
        await git.remove({ fs, dir, filepath });
        staged++;
      } else if (workdir === 2) {
        await git.add({ fs, dir, filepath });
        staged++;
      }
    }
    if (staged === 0) {
      console.log("No changes to commit.");
      return;
    }
    console.log("Staged", staged, "file(s)");

    const sha = await git.commit({
      fs,
      dir,
      author: { name: "Carl Stratton", email: "cgstratton+website@gmail.com" },
      message: `Fix case study scroll flow: homepage section and chips based on scroll position

- Add CaseStudyWithHomeTrigger to mount homepage only when user scrolls near bottom
- Use scroll position threshold to work for both short and long case studies
- Hide chips when user scrolls back to top
- Remove replaceState from LazyHomeSection to prevent unwanted navigation
- Add key={study.slug} for clean remount on case study navigation`,
    });
    console.log("Committed:", sha.slice(0, 7));

    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: "origin",
      ref: "main",
      onAuth: () => ({ username: "carlstratton", password: token }),
    });
    if (pushResult.errors && pushResult.errors.length > 0) {
      throw new Error(pushResult.errors.join(", "));
    }
    console.log("Pushed to origin/main. Vercel will deploy automatically.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
