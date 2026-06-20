#!/usr/bin/env bash
# One-time setup: route git hooks to the committed .githooks/ dir so every commit
# auto-themes new artifact HTML. Run once: ./scripts/install-hooks.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.py scripts/*.sh 2>/dev/null || true
echo "✓ git hooks installed (core.hooksPath=.githooks)"
echo "  new artifact HTML will get /theme.css + /theme.js injected on commit."
