#!/usr/bin/env python3
import datetime
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"

USER = "thomas@jones.com"
CWD = "~/artifacts"

VIEW_EXTS = {".html", ".htm", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp3", ".wav", ".mp4", ".md"}
BAD_PARTS = {"prompts", "__pycache__"}
LABELS = {
    "prototypes": "Playable Prototypes",
    "inspo": "Inspiration Lab",
    "game-dev-research": "Prototype Visions",
    "mtg-guides": "MTG Deck Guides",
    "html-sites": "HTML Sites",
    "reports": "Reports",
    "comics": "Comics",
    "media": "Media",
    "docs": "Docs",
}
# Path shown after `ls` in each section's command line.
SECTION_DIR = {
    "mtg-guides": "html-sites/mtg-guides",
    "prototypes": "prototypes",
    "inspo": "inspo",
    "game-dev-research": "inspo/game-dev/indie-pvp-retro-inspo",
    "html-sites": "html-sites",
    "reports": "reports",
    "comics": "comics",
    "media": "media",
    "docs": "docs",
}


def is_game_dev_research_prototype(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts if path.is_relative_to(ROOT) else path.parts
    return (
        ("reports" in rel_parts or "inspo" in rel_parts)
        and "indie-pvp-retro-inspo" in rel_parts
        and path.suffix.lower() in {".html", ".htm"}
        and "prototype" in path.name.lower()
    )


def is_mtg_guide(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts if path.is_relative_to(ROOT) else path.parts
    return "html-sites" in rel_parts and "mtg-guides" in rel_parts and path.suffix.lower() in {".html", ".htm"}


def titleize(path: Path) -> str:
    stem = path.stem if path.suffix else path.name
    if path.name.lower() == "index.html" and len(path.parts) > 1:
        # Dated mini-sites live at <site>/<YYYY-MM-DD>/index.html; use the
        # site folder name for dashboard cards instead of the date.
        parent = path.parent.name
        parts = parent.split("-")
        if len(parts) == 3 and all(part.isdigit() for part in parts):
            stem = path.parent.parent.name
        else:
            stem = parent
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
    if is_mtg_guide(path):
        return "🃏"
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
    elif "inspo" in rel.parts:
        section = "inspo"
    elif is_mtg_guide(p):
        section = "mtg-guides"
    else:
        section = rel.parts[1] if len(rel.parts) > 1 else "other"
    cards_by_section.setdefault(section, []).append(p)

# Most recently touched, for the `ls -lt | head` block.
recent = sorted(files, key=lambda p: -int(p.stat().st_mtime))[:6]

# ---- archive stats (these become the neofetch "specs") ----
num_sections = sum(1 for v in cards_by_section.values() if v)
top_section, top_count = max(
    ((s, len(v)) for s, v in cards_by_section.items() if v),
    key=lambda x: x[1], default=("—", 0),
)
last_mtime = max((p.stat().st_mtime for p in files), default=0)
last_date = datetime.date.fromtimestamp(last_mtime).isoformat() if last_mtime else "—"

INFO = [
    ("role", "Solution Architect"),
    ("host", "github.io · static pages"),
    ("shell", "bash 5.2"),
    ("artifacts", str(len(files))),
    ("sections", str(num_sections)),
    ("largest", f"{LABELS.get(top_section, top_section)} ({top_count})"),
    ("updated", last_date),
    ("theme", "tokyonight"),
]

# Assembled ANSI-shadow banner: T H O M A S
LOGO = (
    "████████╗ ██╗  ██╗  ██████╗  ███╗   ███╗  █████╗  ███████╗\n"
    "╚══██╔══╝ ██║  ██║ ██╔═══██╗ ████╗ ████║ ██╔══██╗ ██╔════╝\n"
    "   ██║    ███████║ ██║   ██║ ██╔████╔██║ ███████║ ███████╗\n"
    "   ██║    ██╔══██║ ██║   ██║ ██║╚██╔╝██║ ██╔══██║ ╚════██║\n"
    "   ██║    ██║  ██║ ╚██████╔╝ ██║ ╚═╝ ██║ ██║  ██║ ███████║\n"
    "   ╚═╝    ╚═╝  ╚═╝  ╚═════╝  ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚══════╝"
)

SWATCHES = ["#9ece6a", "#7dcfff", "#e0af68", "#bb9af7", "#f7768e", "#7aa2f7", "#cdd1e6", "#565b78"]


def prompt_spans(cmd: str, comment: str = "") -> str:
    c = f'<span class="comment">{escape(comment)}</span>' if comment else ""
    return (
        f'<span class="usr">{escape(USER)}</span><span class="sep">:</span>'
        f'<span class="cwd">{escape(CWD)}</span><span class="dollar">$</span>'
        f'<span class="cmd">{escape(cmd)}</span>{c}'
    )


def prompt(cmd: str, comment: str = "") -> str:
    return f'<div class="cmdline">{prompt_spans(cmd, comment)}</div>'


def row_html(p: Path) -> str:
    rel = p.relative_to(ROOT).as_posix()
    subtitle = "/".join(p.relative_to(ARTIFACTS).parts[:-1]) if ARTIFACTS in p.parents else str(p.parent)
    title = titleize(p)
    search = escape(f"{title} {subtitle} {rel}".lower())
    return (
        f'<a class="row" href="{escape(rel)}" data-s="{search}">'
        f'<span class="row-ico">{icon(p)}</span>'
        f'<span class="row-main"><span class="row-name">{escape(title)}</span>'
        f'<span class="row-path">{escape(subtitle)}/</span></span>'
        f'<span class="row-go">→</span></a>'
    )


def block_html(label: str, cmd: str, items, is_open: bool = False) -> str:
    rows = "".join(row_html(p) for p in items)
    op = " open" if is_open else ""
    return (
        f'<details class="block"{op}>'
        f'<summary><span class="caret">▸</span>'
        f'<span class="seg-name">{escape(label)}</span>'
        f'<span class="seg-count">{len(items)}</span>'
        f'<span class="seg-cmd">$ {escape(cmd)}</span></summary>'
        f'<div class="listing">{rows}</div></details>'
    )


recent_block = block_html("Recently touched", "ls -lt | head", recent, is_open=True) if recent else ""
section_blocks = []
for section in ["html-sites", "prototypes", "game-dev-research", "mtg-guides", "inspo", "reports", "comics", "media", "docs"]:
    items = cards_by_section.get(section, [])
    if not items:
        continue
    cmd = f"ls {SECTION_DIR.get(section, section)}/"
    section_blocks.append(block_html(LABELS.get(section, section.title()), cmd, items))

info_rows = "".join(
    f'<div class="nf-row"><span class="nf-k">{escape(k)}</span>'
    f'<span class="nf-sep">::</span><span class="nf-v">{escape(v)}</span></div>'
    for k, v in INFO
)
swatch_html = "".join(f'<span style="background:{c}"></span>' for c in SWATCHES)

CSS = """
:root{
  --bg:#0f1016; --bg2:#14151f; --surface:#171823; --surface2:#1c1d2b;
  --border:#2a2c3c; --border2:#3a3d57;
  --text:#cdd1e6; --dim:#7b80a0; --faint:#565b78;
  --green:#9ece6a; --cyan:#7dcfff; --amber:#e0af68; --magenta:#bb9af7; --pink:#f7768e; --blue:#7aa2f7;
  --sel:rgba(125,207,255,.10);
  --mono:"JetBrains Mono","Cascadia Code",ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
}
*{box-sizing:border-box}
html,body{max-width:100%;overflow-x:hidden}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;color:var(--text);font-family:var(--mono);font-size:14px;line-height:1.65;background:var(--bg);
  background-image:radial-gradient(900px 520px at 82% -12%,rgba(122,162,247,.10),transparent 60%),
                   radial-gradient(720px 520px at -12% 112%,rgba(187,154,247,.08),transparent 60%);
  background-attachment:fixed;
}
::selection{background:rgba(125,207,255,.25);color:#fff}
a{color:inherit;text-decoration:none}
img,svg,video{max-width:100%;height:auto}

.term{width:min(1000px,100%);margin:0 auto;padding:max(14px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 44px max(12px,env(safe-area-inset-left))}
.win{border:1px solid var(--border);border-radius:13px;overflow:hidden;
  background:linear-gradient(180deg,var(--surface),var(--bg2));
  box-shadow:0 28px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.03)}
.titlebar{display:flex;align-items:center;gap:11px;padding:10px 14px;background:rgba(255,255,255,.025);border-bottom:1px solid var(--border)}
.dots{display:flex;gap:7px;flex:0 0 auto}
.dot{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}
.dot.r{background:#f7768e}.dot.y{background:#e0af68}.dot.g{background:#9ece6a}
.tab{color:var(--dim);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.tab b{color:var(--text);font-weight:600}
.screen{padding:18px 15px 22px}

.cmdline{margin:22px 0 7px;overflow-wrap:anywhere}
.cmdline:first-child{margin-top:2px}
.usr{color:var(--green)}
.sep{color:var(--dim)}
.cwd{color:var(--blue)}
.dollar{color:var(--magenta);margin:0 8px 0 3px}
.cmd{color:var(--text)}
.comment{color:var(--faint);margin-left:9px}
.link{color:var(--cyan);margin:0 2px;border-bottom:1px dotted rgba(125,207,255,.4)}
.link:hover{color:#fff;border-bottom-color:#fff}

/* ---- neofetch header (the signature) ---- */
.neofetch{display:flex;gap:26px;flex-wrap:wrap;align-items:flex-start;padding:6px 2px 4px}
.logo{margin:0;overflow-x:auto;font-size:clamp(6.5px,1.85vw,12.5px);line-height:1.05;white-space:pre;color:var(--green)}
@supports ((-webkit-background-clip:text) or (background-clip:text)){
  .logo{background:linear-gradient(120deg,var(--cyan),var(--magenta) 70%,var(--pink));
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
    filter:drop-shadow(0 0 16px rgba(125,207,255,.22))}
}
.nf-info{flex:1 1 240px;min-width:210px}
.nf-title{color:var(--green);font-weight:700}
.nf-rule{color:var(--border2);letter-spacing:1px}
.nf-row{display:flex;gap:8px}
.nf-k{color:var(--cyan);flex:0 0 76px}
.nf-sep{color:var(--faint)}
.nf-v{color:var(--text);min-width:0;overflow-wrap:anywhere}
.nf-colors{display:flex;gap:6px;margin-top:11px}
.nf-colors span{width:17px;height:17px;border-radius:4px;border:1px solid rgba(255,255,255,.08)}

/* ---- filter prompt ---- */
.filter{display:flex;align-items:center;flex-wrap:wrap;margin:24px 0 6px}
.filter .quote{color:var(--green)}
.filter input{flex:1 1 130px;min-width:90px;background:transparent;border:none;outline:none;
  color:var(--amber);font:inherit;caret-color:var(--cyan);padding:0 2px}
.filter input::placeholder{color:var(--faint)}
.cur{display:inline-block;width:9px;height:1.05em;background:var(--cyan);margin-left:2px;vertical-align:-2px;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.nomatch{color:var(--pink);padding:6px 0 2px}

/* ---- collapsible section blocks ---- */
details.block{margin:0}
details.block>summary{list-style:none;cursor:pointer;outline:none;display:flex;align-items:center;gap:10px;
  padding:13px 6px;margin-top:4px;border-top:1px solid var(--border)}
details.block>summary::-webkit-details-marker{display:none}
details.block>summary:hover .seg-name,details.block>summary:focus-visible .seg-name{color:#fff}
details.block>summary:focus-visible{box-shadow:inset 2px 0 0 var(--cyan);border-radius:4px}
.caret{flex:0 0 auto;color:var(--magenta);width:1em;text-align:center;font-size:15px;transition:transform .14s ease}
details.block[open]>summary .caret{transform:rotate(90deg)}
.seg-name{flex:0 0 auto;color:var(--amber);font-weight:700;font-size:16px;letter-spacing:.01em}
.seg-count{flex:0 0 auto;color:var(--green);font-size:12px;padding:1px 9px;border-radius:999px;
  background:rgba(158,206,106,.12);border:1px solid rgba(158,206,106,.28)}
.seg-cmd{flex:1 1 auto;min-width:0;text-align:right;color:var(--faint);font-size:12px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ---- listing rows ---- */
.listing{display:flex;flex-direction:column;border-left:1px solid var(--border);margin:2px 0 6px 6px}
.row{display:flex;align-items:center;gap:11px;padding:7px 12px;border-radius:0 8px 8px 0;
  transition:background .12s ease}
.row:hover,.row:focus-visible{background:var(--sel);outline:none}
.row:focus-visible{box-shadow:inset 2px 0 0 var(--cyan)}
.row-ico{flex:0 0 auto;width:1.5em;text-align:center}
.row-main{min-width:0;flex:1 1 auto;display:flex;flex-direction:column;line-height:1.3}
.row-name{color:var(--cyan);font-weight:600;overflow-wrap:anywhere}
.row:hover .row-name,.row:focus-visible .row-name{color:#fff}
.row-path{color:var(--faint);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row-go{flex:0 0 auto;color:var(--green);opacity:.45;transition:transform .12s ease,opacity .12s ease}
.row:hover .row-go,.row:focus-visible .row-go{opacity:1;transform:translateX(3px)}
.block[hidden]{display:none}

.foot{margin-top:22px;color:var(--dim);font-size:12.5px;overflow-wrap:anywhere}
.foot code{color:var(--amber)}

@media (min-width:760px){.screen{padding:22px 22px 26px}}
@media (prefers-reduced-motion:reduce){.cur{animation:none}.row,.row-go,.caret{transition:none}}
"""

JS = """
const q = document.getElementById('q');
const rows = Array.from(document.querySelectorAll('.row'));
const blocks = Array.from(document.querySelectorAll('details.block'));
const nomatch = document.getElementById('nomatch');
const count = document.getElementById('count');
const defaultOpen = new Map(blocks.map(b => [b, b.open]));
function apply(){
  const v = q.value.trim().toLowerCase();
  let shown = 0;
  for(const r of rows){
    const m = !v || r.dataset.s.includes(v);
    r.style.display = m ? '' : 'none';
    if(m) shown++;
  }
  for(const b of blocks){
    const has = Array.from(b.querySelectorAll('.row')).some(r => r.style.display !== 'none');
    b.hidden = !has;
    if(v){ if(has) b.open = true; }
    else { b.open = defaultOpen.get(b); }
  }
  if(nomatch) nomatch.hidden = !(v && shown === 0);
  if(count) count.textContent = v ? (shown + ' match' + (shown === 1 ? '' : 'es')) : (rows.length + ' artifacts');
}
q.addEventListener('input', apply);
document.addEventListener('keydown', e => {
  if(e.key === '/' && document.activeElement !== q){ e.preventDefault(); q.focus(); }
  else if(e.key === 'Escape' && document.activeElement === q){ q.value = ''; apply(); q.blur(); }
});
const ex = document.getElementById('expand'), co = document.getElementById('collapse');
if(ex) ex.addEventListener('click', e => { e.preventDefault(); blocks.forEach(b => { if(!b.hidden) b.open = true; }); });
if(co) co.addEventListener('click', e => { e.preventDefault(); blocks.forEach(b => { b.open = false; }); });
"""

body = f"""  <main class="term">
    <div class="win">
      <div class="titlebar">
        <div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
        <div class="tab"><b>{escape(USER)}</b>: {escape(CWD)} — bash</div>
      </div>
      <div class="screen">

        {prompt("neofetch")}
        <div class="neofetch">
          <pre class="logo" aria-label="THOMAS">{escape(LOGO)}</pre>
          <div class="nf-info">
            <div class="nf-title">Thomas Jones III</div>
            <div class="nf-rule">------------------------</div>
            {info_rows}
            <div class="nf-colors">{swatch_html}</div>
          </div>
        </div>

        <div class="filter">
          <span class="usr">{escape(USER)}</span><span class="sep">:</span><span class="cwd">{escape(CWD)}</span><span class="dollar">$</span><span class="cmd">grep -ri&nbsp;</span><span class="quote">'</span><input id="q" type="text" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Filter artifacts" placeholder="pattern" /><span class="quote">'</span><span class="cmd">&nbsp;.</span><span class="cur"></span>
        </div>
        <div class="cmdline" style="margin-top:2px"><span class="comment" id="count">{len(files)} artifacts</span><span class="comment"> · </span><a href="#" id="expand" class="link">expand all</a><span class="comment">/</span><a href="#" id="collapse" class="link">collapse all</a><span class="comment"> · / to search</span></div>
        <div id="nomatch" class="nomatch" hidden>grep: no matches in working tree</div>

        {recent_block}
        {''.join(section_blocks)}

        <div class="foot"><span class="usr">{escape(USER)}</span><span class="sep">:</span><span class="cwd">{escape(CWD)}</span><span class="dollar">$</span> synced from <code>tjonestj3/krahnie-artifacts</code> · add to home screen for app feel <span class="cur"></span></div>
      </div>
    </div>
  </main>"""

html = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n"
    "  <meta charset=\"utf-8\" />\n"
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\n"
    "  <meta name=\"color-scheme\" content=\"dark\" />\n"
    "  <meta name=\"theme-color\" content=\"#0f1016\" />\n"
    "  <title>Thomas Jones III · Solution Architect</title>\n"
    "  <style>\n" + CSS + "\n  </style>\n</head>\n<body>\n"
    + body +
    "\n  <script>\n" + JS + "\n  </script>\n</body>\n</html>\n"
)

(ROOT / "index.html").write_text(html, encoding="utf-8")
(ROOT / ".nojekyll").write_text("", encoding="utf-8")
print(f"Wrote {ROOT / 'index.html'} with {len(files)} artifact links")
