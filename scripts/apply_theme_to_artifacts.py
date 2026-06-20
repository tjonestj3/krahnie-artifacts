#!/usr/bin/env python3
"""Inject the shared theme hooks (/theme.css + /theme.js) into existing artifact
HTML so they pick up the site theme + the floating theme switcher inside the viewer.

Idempotent: re-running skips files already migrated. The tags are inserted right
AFTER the opening <head> tag — i.e. BEFORE each artifact's own <style> — so the
artifact's own design still wins (we add theming hooks without overriding looks).
Pages that use the CSS variables will recolor with the theme; the rest keep their
look but gain the switcher and carry the chosen theme across pages.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"

SNIPPET = '\n  <link rel="stylesheet" href="/theme.css" />\n  <script src="/theme.js" defer></script>'
HEAD_RE = re.compile(r"<head\b[^>]*>", re.IGNORECASE)

modified, skipped, no_head = [], [], []

for p in sorted(ARTIFACTS.rglob("*")):
    if not p.is_file() or p.suffix.lower() not in {".html", ".htm"}:
        continue
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        skipped.append((p, "non-utf8"))
        continue
    if "/theme.css" in text:
        skipped.append((p, "already"))
        continue
    m = HEAD_RE.search(text)
    if not m:
        no_head.append(p)
        continue
    new = text[: m.end()] + SNIPPET + text[m.end():]
    p.write_text(new, encoding="utf-8")
    modified.append(p)

print(f"migrated : {len(modified)}")
print(f"skipped  : {len(skipped)}  ({sum(1 for _, r in skipped if r == 'already')} already, "
      f"{sum(1 for _, r in skipped if r == 'non-utf8')} non-utf8)")
print(f"no <head>: {len(no_head)}")
for p in no_head:
    print("   !", p.relative_to(ROOT))
