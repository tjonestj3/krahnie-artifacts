#!/usr/bin/env python3
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"

VIEW_EXTS = {".html", ".htm", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp3", ".wav", ".mp4", ".md"}
BAD_PARTS = {"prompts", "__pycache__"}
LABELS = {
    "prototypes": "Playable Prototypes",
    "game-dev-research": "Game Dev Research HTML Prototypes",
    "html-sites": "HTML Sites",
    "reports": "Reports",
    "comics": "Comics",
    "media": "Media",
    "docs": "Docs",
}


def is_game_dev_research_prototype(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts if path.is_relative_to(ROOT) else path.parts
    return (
        "reports" in rel_parts
        and "indie-pvp-retro-inspo" in rel_parts
        and path.suffix.lower() in {".html", ".htm"}
        and "prototype" in path.name.lower()
    )


def titleize(path: Path) -> str:
    stem = path.stem if path.suffix else path.name
    if path.name.lower() == "index.html" and len(path.parts) > 1:
        stem = path.parent.name
    if is_game_dev_research_prototype(path):
        parts = stem.split("-", 3)
        date = "-".join(parts[:3]) if len(parts) == 4 and all(part.isdigit() for part in parts[:3]) else ""
        label = parts[3] if date else stem
        pretty = label.replace("-", " ").replace("_", " ").title()
        return f"{date} · {pretty}" if date else pretty
    # Strip leading ISO-ish date for nicer cards.
    parts = stem.split("-", 3)
    if len(parts) == 4 and all(part.isdigit() for part in parts[:3]):
        stem = parts[3]
    return stem.replace("-", " ").replace("_", " ").title()


def icon(path: Path) -> str:
    s = path.suffix.lower()
    if s in {".html", ".htm"}:
        if "prototypes" in path.parts:
            return "🎮"
        if is_game_dev_research_prototype(path):
            return "🕹️"
        return "🌐"
    if s == ".md": return "📝"
    if s == ".svg": return "🎨"
    if s in {".png", ".jpg", ".jpeg", ".webp", ".gif"}: return "🖼️"
    if s in {".mp3", ".wav", ".m4a", ".ogg"}: return "🎧"
    if s in {".mp4", ".mov"}: return "🎬"
    return "📦"


def is_primary(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if any(part in BAD_PARTS for part in rel.parts):
        return False
    if path.suffix.lower() not in VIEW_EXTS:
        return False
    if "prototypes" in rel.parts and path.name.lower() != "index.html":
        return False
    name = path.name.lower()
    if name.endswith((".import", ".uid")) or path.suffix.lower() == ".py":
        return False
    return True


files = []
if ARTIFACTS.exists():
    for p in sorted(ARTIFACTS.rglob("*")):
        if p.is_file() and is_primary(p):
            files.append(p)


def sort_key(p: Path):
    rel = p.relative_to(ROOT)
    is_index = 0 if p.name.lower() == "index.html" else 1
    mtime = -int(p.stat().st_mtime)
    return (is_index, mtime, str(rel))


files.sort(key=sort_key)
cards_by_section = {}
for p in files:
    rel = p.relative_to(ROOT)
    if is_game_dev_research_prototype(p):
        section = "game-dev-research"
    else:
        section = rel.parts[1] if len(rel.parts) > 1 else "other"
    cards_by_section.setdefault(section, []).append(p)

featured = cards_by_section.get("prototypes", [])[:4] + cards_by_section.get("game-dev-research", [])[:4]
if len(featured) < 8:
    featured += [p for p in files if p not in featured][: 8 - len(featured)]


def card_html(p: Path) -> str:
    rel = p.relative_to(ROOT).as_posix()
    subtitle = "/".join(p.relative_to(ARTIFACTS).parts[:-1]) if ARTIFACTS in p.parents else str(p.parent)
    return f"""
      <a class="card" href="{escape(rel)}">
        <div class="card-icon">{icon(p)}</div>
        <div class="card-body">
          <div class="card-title">{escape(titleize(p))}</div>
          <div class="card-subtitle">{escape(subtitle)}</div>
        </div>
        <div class="chev">›</div>
      </a>"""


featured_html = "\n".join(card_html(p) for p in featured) or '<p class="empty">No artifacts yet.</p>'
sections_html = []
for section in ["prototypes", "game-dev-research", "html-sites", "reports", "comics", "media", "docs"]:
    items = cards_by_section.get(section, [])
    if not items:
        continue
    sections_html.append(f'<section><h2>{LABELS.get(section, section.title())}</h2><div class="grid">' + "\n".join(card_html(p) for p in items) + '</div></section>')

html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#15122b" />
  <title>Krahnie Artifacts</title>
  <style>
    :root {{ color-scheme: dark; --bg:#15122b; --panel:#211a45; --card:#2d235f; --ink:#fff6cf; --muted:#bdb4e8; --pink:#ff5c8a; --cyan:#67e8f9; --gold:#ffe66d; }}
    * {{ box-sizing: border-box; }}
    body {{ margin:0; font-family: ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #51318f 0, transparent 34rem), linear-gradient(180deg, #15122b, #090817); color:var(--ink); }}
    .wrap {{ width:min(960px, 100%); margin:0 auto; padding: max(18px, env(safe-area-inset-top)) 16px 44px; }}
    header {{ padding: 22px 0 12px; }}
    .badge {{ display:inline-flex; gap:8px; align-items:center; border:1px solid rgba(103,232,249,.35); background:rgba(103,232,249,.10); color:var(--cyan); padding:8px 12px; border-radius:999px; font-weight:800; font-size:13px; letter-spacing:.03em; }}
    h1 {{ margin:16px 0 8px; font-size: clamp(36px, 12vw, 74px); line-height:.9; letter-spacing:-.06em; text-shadow: 0 3px 0 #000; }}
    .lede {{ margin:0; color:var(--muted); font-size:18px; line-height:1.45; max-width: 42rem; }}
    .hero {{ margin:18px 0 20px; padding:18px; border-radius:28px; background:linear-gradient(135deg, rgba(255,92,138,.18), rgba(103,232,249,.12)); border:1px solid rgba(255,230,109,.22); box-shadow:0 18px 60px rgba(0,0,0,.35); }}
    h2 {{ margin:28px 0 12px; font-size:24px; color:var(--gold); }}
    .grid {{ display:grid; gap:12px; }}
    .card {{ min-height:76px; display:flex; align-items:center; gap:14px; padding:14px; border-radius:20px; text-decoration:none; color:var(--ink); background:rgba(45,35,95,.88); border:1px solid rgba(255,255,255,.10); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 10px 28px rgba(0,0,0,.22); }}
    .card:active {{ transform: translateY(1px) scale(.995); }}
    .card-icon {{ width:48px; height:48px; display:grid; place-items:center; flex:0 0 auto; border-radius:16px; background:#181431; font-size:25px; border:1px solid rgba(255,255,255,.10); }}
    .card-body {{ min-width:0; flex:1; }}
    .card-title {{ font-size:17px; font-weight:900; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
    .card-subtitle {{ margin-top:5px; color:var(--muted); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }}
    .chev {{ color:var(--cyan); font-size:34px; line-height:1; padding-left:4px; }}
    footer {{ margin-top:34px; color:#8d83c6; font-size:13px; text-align:center; }}
    @media (min-width: 760px) {{ .grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
  </style>
</head>
<body>
  <main class="wrap">
    <header>
      <span class="badge">⚡ Krahnie Artifact Arcade</span>
      <h1>Krahnie<br/>Artifacts</h1>
      <p class="lede">Tap-friendly dashboard for generated HTML sites, reports, comics, media, and docs. Open this on iPhone Safari and use <b>Share → Add to Home Screen</b>.</p>
    </header>
    <section class="hero">
      <h2>Latest / Featured</h2>
      <div class="grid">{featured_html}</div>
    </section>
    {''.join(sections_html)}
    <footer>Synced from <code>tjonestj3/krahnie-artifacts</code>. Built for phone viewing by Krahnie.</footer>
  </main>
</body>
</html>
"""
(ROOT / "index.html").write_text(html, encoding="utf-8")
(ROOT / ".nojekyll").write_text("", encoding="utf-8")
print(f"Wrote {ROOT / 'index.html'} with {len(files)} artifact links")
