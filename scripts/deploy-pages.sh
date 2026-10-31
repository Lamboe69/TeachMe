#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GITHUB_PAGES=true npm run build
cp dist/index.html dist/404.html
touch dist/.nojekyll

TMP="$(mktemp -d)"
BRANCH="deploy-$(date +%s)"
cleanup() {
  cd "$ROOT"
  git worktree remove --force "$TMP" >/dev/null 2>&1 || true
  git branch -D "$BRANCH" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

git worktree add --detach "$TMP" >/dev/null
cd "$TMP"
git checkout --orphan "$BRANCH" >/dev/null
git rm -rf . >/dev/null 2>&1 || true
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$ROOT/dist/." .
git add -A
git commit -m "deploy: GitHub Pages build" >/dev/null
git push -f origin "$BRANCH:gh-pages"
