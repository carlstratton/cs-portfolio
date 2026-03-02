#!/bin/bash
# Push to GitHub/Vercel without Xcode (uses isomorphic-git).
# Requires: GITHUB_TOKEN (create at https://github.com/settings/tokens)
# Run: GITHUB_TOKEN=your_token ./deploy-changes.sh

set -e
cd "$(dirname "$0")"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN required. Create at https://github.com/settings/tokens"
  echo "Run: GITHUB_TOKEN=your_token ./deploy-changes.sh"
  exit 1
fi

npm run deploy
