#!/usr/bin/env python3
import datetime
import json
from pathlib import Path
from html import escape
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"

USER = "thomas@jones.com"
CWD = "~/artifacts"

# Single source of truth for selectable themes (drives the dropdown + the JS).
THEME_NAMES = ["tokyonight", "gruvbox", "dracula", "nord", "matrix", "amber", "pokemon", "salesforce", "win98"]

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

# Hugh's gamer-tag banner: H U G H
HUGH_LOGO = (
    "██╗  ██╗ ██╗   ██╗  ██████╗  ██╗  ██╗\n"
    "██║  ██║ ██║   ██║ ██╔════╝  ██║  ██║\n"
    "███████║ ██║   ██║ ██║  ███╗ ███████║\n"
    "██╔══██║ ██║   ██║ ██║   ██║ ██╔══██║\n"
    "██║  ██║ ╚██████╔╝ ╚██████╔╝ ██║  ██║\n"
    "╚═╝  ╚═╝  ╚═════╝   ╚═════╝  ╚═╝  ╚═╝"
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

def nf_row(k, v):
    vid = ' id="theme-val"' if k == "theme" else ''
    return (f'<div class="nf-row"><span class="nf-k">{escape(k)}</span>'
            f'<span class="nf-sep">::</span><span class="nf-v"{vid}>{escape(v)}</span></div>')


info_rows = "".join(nf_row(k, v) for k, v in INFO)
theme_options = "".join(f'<option value="{escape(t)}">{escape(t)}</option>' for t in THEME_NAMES)
# swatches reference theme vars so they recolor when the theme changes
swatch_html = "".join(f'<span style="background:var({v})"></span>'
                      for v in ['--green', '--cyan', '--amber', '--magenta', '--pink', '--blue', '--text', '--dim'])

PALETTES = """
:root{
  --bg:#0f1016; --bg2:#14151f; --surface:#171823; --surface2:#1c1d2b;
  --border:#2a2c3c; --border2:#3a3d57;
  --text:#cdd1e6; --dim:#7b80a0; --faint:#565b78;
  --green:#9ece6a; --cyan:#7dcfff; --amber:#e0af68; --magenta:#bb9af7; --pink:#f7768e; --blue:#7aa2f7;
  --sel:rgba(125,207,255,.10);
  --mono:"JetBrains Mono","Cascadia Code",ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
}
/* ---- switchable themes (type `theme <name>`) ---- */
[data-theme="gruvbox"]{
  --bg:#1d2021;--bg2:#282828;--surface:#32302f;--surface2:#3c3836;--border:#504945;--border2:#665c54;
  --text:#ebdbb2;--dim:#a89984;--faint:#7c6f64;--green:#b8bb26;--cyan:#8ec07c;--amber:#fabd2f;
  --magenta:#d3869b;--pink:#fb4934;--blue:#83a598;--sel:rgba(142,192,124,.12);
}
[data-theme="dracula"]{
  --bg:#21222c;--bg2:#282a36;--surface:#2b2e3b;--surface2:#343746;--border:#3b3f51;--border2:#4d5168;
  --text:#f8f8f2;--dim:#9aa0c0;--faint:#6272a4;--green:#50fa7b;--cyan:#8be9fd;--amber:#f1fa8c;
  --magenta:#bd93f9;--pink:#ff79c6;--blue:#6272a4;--sel:rgba(139,233,253,.12);
}
[data-theme="nord"]{
  --bg:#242933;--bg2:#2e3440;--surface:#323847;--surface2:#3b4252;--border:#434c5e;--border2:#4c566a;
  --text:#eceff4;--dim:#9aa3b2;--faint:#6b7689;--green:#a3be8c;--cyan:#88c0d0;--amber:#ebcb8b;
  --magenta:#b48ead;--pink:#bf616a;--blue:#81a1c1;--sel:rgba(136,192,208,.12);
}
[data-theme="matrix"]{
  --bg:#000a00;--bg2:#001400;--surface:#021a02;--surface2:#032403;--border:#0c3a0c;--border2:#125512;
  --text:#9bff9b;--dim:#3fae3f;--faint:#2a7a2a;--green:#39ff14;--cyan:#69ffb0;--amber:#b6ff6b;
  --magenta:#aaffaa;--pink:#caffca;--blue:#5fffa0;--sel:rgba(57,255,20,.13);
}
[data-theme="amber"]{
  --bg:#1a1200;--bg2:#211700;--surface:#291d00;--surface2:#322400;--border:#4a3700;--border2:#6b5000;
  --text:#ffcc66;--dim:#b8860b;--faint:#8a6508;--green:#ffd479;--cyan:#ffb347;--amber:#ffcc33;
  --magenta:#ffa500;--pink:#ff8c00;--blue:#ffbf66;--sel:rgba(255,191,0,.12);
}
[data-theme="pokemon"]{
  --bg:#0e1726;--bg2:#12203a;--surface:#15294a;--surface2:#1b3358;--border:#26416b;--border2:#345a8f;
  --text:#f6f7fb;--dim:#9fb6d6;--faint:#5f7aa3;--green:#ffcb05;--cyan:#3da9fc;--amber:#ffcb05;
  --magenta:#ff5350;--pink:#ee1515;--blue:#2a75bb;--sel:rgba(255,203,5,.16);
}
[data-theme="salesforce"]{
  --bg:#021b3a;--bg2:#04274f;--surface:#063063;--surface2:#0a3b75;--border:#13497f;--border2:#1b5c9c;
  --text:#eaf3fb;--dim:#9cc3e6;--faint:#5e87b3;--green:#4bca81;--cyan:#00a1e0;--amber:#fe9339;
  --magenta:#9050e9;--pink:#ea001e;--blue:#1b96ff;--sel:rgba(0,161,224,.16);
}
/* old-school Windows 98: teal desktop, gray beveled window, navy titlebar */
[data-theme="win98"]{
  --bg:#008080;--bg2:#008080;--surface:#c0c0c0;--surface2:#c0c0c0;--border:#808080;--border2:#dfdfdf;
  --text:#000000;--dim:#404040;--faint:#555555;--green:#000080;--cyan:#000080;--amber:#000080;
  --magenta:#000080;--pink:#7f0000;--blue:#000080;--sel:rgba(0,0,128,.18);
}
[data-theme="win98"] body{background:#008080}
[data-theme="win98"] .win{border-radius:0;border:0;background:#c0c0c0;
  box-shadow:inset -1px -1px #000,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #dfdfdf}
[data-theme="win98"] .titlebar{background:linear-gradient(90deg,#000080,#1084d0);border-bottom:0;padding:4px 6px}
[data-theme="win98"] .tab,[data-theme="win98"] .tab b{color:#fff}
[data-theme="win98"] .console{border-radius:0;background:#fff;color:#000;border:2px solid;border-color:#808080 #fff #fff #808080}
[data-theme="win98"] details.block>summary{border-top-color:#808080}
[data-theme="win98"] .row{border-radius:0}
[data-theme="win98"] .seg-count{border-radius:0;background:#000080;color:#fff;border-color:#000080}
[data-theme="win98"] .theme-select{border-radius:0;background:#c0c0c0;color:#000;border:2px solid;border-color:#808080 #fff #fff #808080}
"""

# Base skin for *other* artifacts that opt into theme.css: applies the palette to
# the page even if they don't reference vars explicitly.
BASE_SKIN = """
*{box-sizing:border-box}
html,body{max-width:100%}
body{margin:0;background:var(--bg);color:var(--text);
  font-family:var(--mono);-webkit-text-size-adjust:100%;transition:background-color .3s ease,color .3s ease}
a{color:var(--cyan)}
::selection{background:var(--sel)}
#jones-theme-switch{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));
  z-index:99999;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:8px;
  font-family:var(--mono);font-size:12px;padding:5px 8px;cursor:pointer;opacity:.85}
#jones-theme-switch:hover{opacity:1}
"""

CSS = PALETTES + """
*{box-sizing:border-box}
body,.win,.console,details.block>summary,.row,.nf-colors span,.seg-count{transition:background-color .3s ease,border-color .3s ease,color .3s ease}
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
.tab{flex:1 1 auto;color:var(--dim);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.tab b{color:var(--text);font-weight:600}
.theme-select{flex:0 0 auto;background:var(--surface2);color:var(--text);border:1px solid var(--border);
  border-radius:7px;font-family:var(--mono);font-size:12px;padding:3px 7px;cursor:pointer;max-width:42vw}
.theme-select:focus-visible{outline:2px solid var(--cyan);outline-offset:1px}
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
.logo{margin:0;flex:0 0 auto;font-size:clamp(6.5px,1.85vw,12.5px);line-height:1.05;white-space:pre;color:var(--green)}
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

/* ---- interactive console ---- */
.console{margin:22px 0 8px;border:1px solid var(--border);border-radius:11px;background:rgba(0,0,0,.28);
  padding:12px 13px;max-height:46vh;overflow-y:auto;-webkit-overflow-scrolling:touch}
#out{margin:0}
#out .line{white-space:pre-wrap;overflow-wrap:anywhere;margin:1px 0}
#out .line.pre{white-space:pre;overflow-x:auto;line-height:1.25}
#out .line.ok{color:var(--green)}
#out .line.err{color:var(--pink)}
#out .line.dim{color:var(--faint)}
#out .line.info{color:var(--cyan)}
#out .line.warn{color:var(--amber)}
#out .line .p{color:var(--green)}
.in-line{display:flex;align-items:center;flex-wrap:wrap;margin-top:6px}
#cmd-in{flex:1 1 140px;min-width:90px;background:transparent;border:none;outline:none;
  color:var(--amber);font:inherit;caret-color:var(--cyan);padding:0 2px}
.cur{display:inline-block;width:9px;height:1.05em;background:var(--cyan);margin-left:2px;vertical-align:-2px;animation:blink 1.1s steps(1) infinite}
.in-line:focus-within .cur{display:none}
@keyframes blink{50%{opacity:0}}
#confetti{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999}
#matrix{position:fixed;inset:0;width:100%;height:100%;z-index:9998;background:#000;cursor:pointer}
.matrix-hint{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);
  z-index:9999;color:#9effb8;font-family:var(--mono);font-size:13px;background:rgba(0,0,0,.5);
  border:1px solid rgba(158,255,184,.35);border-radius:999px;padding:6px 14px;pointer-events:none;
  text-shadow:0 0 8px rgba(53,211,106,.8)}
/* ---- snake ---- */
#snake{position:fixed;inset:0;width:100%;height:100%;z-index:9998;background:var(--bg);cursor:pointer;touch-action:none}
/* ---- typing test ---- */
#typing{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:18px}
.tt-card{width:min(760px,100%);max-height:88vh;overflow:auto;background:var(--surface);border:1px solid var(--border);
  border-radius:14px;padding:20px 22px;box-shadow:0 24px 80px rgba(0,0,0,.6)}
.tt-head{font-size:14px;color:var(--amber);font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between;gap:10px}
.tt-head .tt-x{color:var(--faint);font-weight:400}
.tt-stats{font-size:13px;color:var(--green);margin-bottom:14px}
.tt-text{font-size:18px;line-height:1.9;color:var(--faint);word-break:break-word}
.tt-text .tt-ok{color:var(--text)}
.tt-text .tt-bad{color:#fff;background:var(--pink);border-radius:2px}
.tt-text .tt-cur{background:var(--sel);border-bottom:2px solid var(--cyan)}
#tt-in{position:absolute;opacity:0;width:1px;height:1px;border:0;padding:0}

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

/* ---- Hugh's gamer-tag banner ---- */
.gamertag{margin:6px 0 6px}
.logo-hugh{color:var(--green)}
@supports ((-webkit-background-clip:text) or (background-clip:text)){
  .logo.logo-hugh{background:linear-gradient(120deg,#35d36a,var(--cyan) 55%,var(--blue));
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
    filter:drop-shadow(0 0 16px rgba(53,211,106,.28))}
}
.gt-sub{color:var(--green);font-size:12.5px;letter-spacing:.04em;margin-top:7px;overflow-wrap:anywhere}
.gt-hint{color:var(--faint)}

.foot{margin-top:22px;color:var(--dim);font-size:12.5px;overflow-wrap:anywhere}
.foot code{color:var(--amber)}

@media (min-width:760px){.screen{padding:22px 22px 26px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}.cur{animation:none}}
"""

JS = r"""
(function(){
  const consoleEl = document.getElementById('console');
  const OUT = document.getElementById('out');
  const IN  = document.getElementById('cmd-in');
  const rows = Array.from(document.querySelectorAll('.row'));
  const blocks = Array.from(document.querySelectorAll('details.block'));
  const defaultOpen = new Map(blocks.map(b => [b, b.open]));
  const listingTop = blocks[0] || null;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  let hist = [], hpos = 0;

  function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function print(html, cls){ OUT.appendChild(el('div','line'+(cls?' '+cls:''), html)); }
  function pre(text){ OUT.appendChild(el('div','line pre', esc(text))); }
  function scroll(){ consoleEl.scrollTop = consoleEl.scrollHeight; }
  function echo(cmd){ print("<span class='usr'>thomas@jones.com</span><span class='sep'>:</span><span class='cwd'>~/artifacts</span><span class='dollar'>$</span> "+esc(cmd)); }
  function sections(){ return blocks.map(b => ({el:b, name:b.querySelector('.seg-name').textContent.trim(), count:b.querySelector('.seg-count').textContent.trim()})); }
  function nameOf(r){ return r.querySelector('.row-name').textContent.trim(); }
  function openArtifact(href){ location.href = 'viewer.html?p=' + encodeURIComponent(href); }

  function setFilter(v){
    v = (v||'').toLowerCase(); let shown = 0;
    for(const r of rows){ const m = !v || r.dataset.s.includes(v); r.style.display = m ? '' : 'none'; if(m) shown++; }
    for(const b of blocks){ const has = Array.from(b.querySelectorAll('.row')).some(r => r.style.display !== 'none'); b.hidden = !has; if(v){ if(has) b.open = true; } else { b.open = defaultOpen.get(b); } }
    return shown;
  }

  function confetti(){
    if(reduce) return;
    const cv = el('canvas'); cv.id = 'confetti'; document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); let W, H;
    function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
    size();
    let cols = ['#9ece6a','#7dcfff','#e0af68','#bb9af7','#f7768e','#7aa2f7','#ffffff'];
    try { const cs = getComputedStyle(document.documentElement);
      const v = ['--green','--cyan','--amber','--magenta','--pink','--blue'].map(k => cs.getPropertyValue(k).trim()).filter(Boolean);
      if(v.length) cols = v.concat('#ffffff'); } catch(e){}
    const P = [];
    for(let i=0;i<160;i++) P.push({x:Math.random()*W, y:-20-Math.random()*H*0.4, r:5+Math.random()*7,
      vx:(Math.random()-0.5)*3, vy:3+Math.random()*4, a:Math.random()*Math.PI, va:(Math.random()-0.5)*0.3,
      c:cols[(Math.random()*cols.length)|0]});
    const start = performance.now();
    (function frame(t){
      const life = t - start; ctx.clearRect(0,0,W,H);
      for(const p of P){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.a+=p.va;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=p.c;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); }
      if(life < 2600) requestAnimationFrame(frame); else cv.remove();
    })(start);
    addEventListener('resize', size, {once:true});
  }

  function loveSon(name){ confetti(); print("🎉 " + esc(name) + " — I love my sons! 🎉", 'ok'); }

  const FORTUNES = [
    "Weeks of coding can save you hours of planning.",
    "There are 2 hard problems in CS: cache invalidation, naming things, and off-by-one errors.",
    "It works on my machine. ship the machine.",
    "A good architect leaves the codebase better than the deadline found it.",
    "The best code is no code. The second best is code you deleted.",
    "Premature optimization is the root of all evil — but so is shipping nothing.",
    "Salesforce governor limits build character.",
    "Commit early, commit often, blame git later."
  ];
  const COFFEE = ["      ) )","     ( (","   ........","   |      |]","   \\      /","    `----'"," ~ fresh brew ~"].join("\n");
  const TRAIN = [
    "      ====        ________                ___________",
    "  _D _|  |_______/        \\__I_I_____===__|_________|",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|",
    "   /     |  |   H  |  |     |   |         ||_| |_||",
    "  |      |  |   H  |__--------------------| [___] |",
    "  | ________|___H__/__|_____/[][]~\\_______|       |",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__"
  ].join("\n");
  function cowsay(t){
    t = String(t).slice(0,42) || "moo";
    return [
      " " + "_".repeat(t.length+2),
      "< " + t + " >",
      " " + "-".repeat(t.length+2),
      "        \\   ^__^",
      "         \\  (oo)\\_______",
      "            (__)\\       )\\/\\",
      "                ||----w |",
      "                ||     ||"
    ].join("\n");
  }

  const THEMES = (window.__THEMES && window.__THEMES.length) ? window.__THEMES : ['tokyonight','gruvbox','dracula','nord','matrix','amber'];
  function applyTheme(name){
    document.documentElement.setAttribute('data-theme', name);
    const tv = document.getElementById('theme-val'); if(tv) tv.textContent = name;
    const sel = document.getElementById('theme-select'); if(sel && sel.value !== name) sel.value = name;
    try { localStorage.setItem('jones-theme', name); } catch(e){}
  }

  const cmds = {
    help(){
      print("<b>commands</b>", 'info');
      [["help","this list"],
       ["ls [section]","list sections, or files inside one"],
       ["open <name>","open an artifact or section (alias: cd)"],
       ["find <pattern>","filter the listing below (alias: grep, search)"],
       ["expand / collapse","open or close every section"],
       ["reset","clear the filter, restore sections"],
       ["clear","clear the console  (Ctrl-L)"],
       ["whoami / pwd / date","the usual"],
       ["echo <text>","say something back"],
       ["theme [name]","switch themes (also: next, random)"],
       ["snake","play snake 🐍"],
       ["type","typing test: the story of TJ ⌨️"],
       ["neofetch","jump to the banner"],
       ["about / contact","what this is, where to find me"]
      ].forEach(p => print("  <span class='info'>"+esc(p[0])+"</span>  <span class='dim'>"+esc(p[1])+"</span>"));
      print("  <span class='dim'>…and a handful that aren't listed. go poke around 🥚</span>");
    },
    ls(a){
      const s = sections();
      if(!a.length){ s.forEach(x => print("  <span class='info'>"+esc(x.name)+"</span>  <span class='dim'>"+esc(x.count)+" items</span>")); print("<span class='dim'>ls &lt;section&gt; to list its files</span>"); return; }
      const q = a.join(' ').toLowerCase(), hit = s.find(x => x.name.toLowerCase().includes(q));
      if(!hit){ print("ls: no such section: "+esc(q), 'err'); return; }
      Array.from(hit.el.querySelectorAll('.row')).forEach(r => print("  "+esc(nameOf(r))));
    },
    open(a){
      if(!a.length){ print("usage: open &lt;name&gt;", 'warn'); return; }
      const q = a.join(' ').toLowerCase(), sec = sections().find(x => x.name.toLowerCase().includes(q));
      if(sec){ sec.el.open = true; sec.el.scrollIntoView({behavior:'smooth', block:'start'}); print("opened section "+esc(sec.name), 'ok'); return; }
      const m = rows.filter(r => nameOf(r).toLowerCase().includes(q));
      if(m.length === 1){ print("opening "+esc(nameOf(m[0]))+" …", 'ok'); setTimeout(() => openArtifact(m[0].getAttribute('href')), 380); return; }
      if(m.length > 1){ print(m.length+" matches — be more specific:", 'warn'); m.slice(0,8).forEach(r => print("  "+esc(nameOf(r)))); return; }
      print("open: not found: "+esc(q), 'err');
    },
    find(a){
      const pat = a.join(' ');
      if(!pat){ setFilter(''); print("filter cleared", 'dim'); return; }
      const n = setFilter(pat);
      if(n && listingTop) listingTop.scrollIntoView({behavior:'smooth', block:'start'});
      print(n+" match"+(n===1?'':'es')+" for '"+esc(pat)+"'", n ? 'ok' : 'err');
    },
    expand(){ blocks.forEach(b => { if(!b.hidden) b.open = true; }); print("expanded all", 'dim'); },
    collapse(){ blocks.forEach(b => { b.open = false; }); print("collapsed all", 'dim'); },
    reset(){ setFilter(''); blocks.forEach(b => { b.open = defaultOpen.get(b); }); print("reset", 'dim'); },
    clear(){ OUT.innerHTML = ''; },
    whoami(){ print("Thomas Jones III — Solution Architect", 'ok'); },
    pwd(){ print("/home/thomas/artifacts"); },
    date(){ print(new Date().toString()); },
    echo(a, rest){ print(esc(rest)); },
    neofetch(){ document.querySelector('.neofetch').scrollIntoView({behavior:'smooth', block:'center'}); },
    about(){ print("My homelab of generated artifacts — sites, prototypes, comics, reports, and Krahnie experiments. Static, served from GitHub Pages, themed like the terminal I actually live in.", 'info'); },
    contact(){ print("github :: <a href='https://github.com/tjonestj3' target='_blank' rel='noopener'>tjonestj3</a>", 'info'); print("repo   :: tjonestj3/krahnie-artifacts", 'dim'); },
    theme(a){
      const cur = document.documentElement.getAttribute('data-theme') || 'tokyonight';
      if(!a.length){
        print("themes:", 'info');
        THEMES.forEach(t => print((t === cur ? "  ● " : "  ○ ") + t + (t === cur ? "  (active)" : ""), t === cur ? 'ok' : 'dim'));
        print("usage: theme &lt;name&gt;  ·  theme next  ·  theme random", 'dim');
        return;
      }
      let name = a[0].toLowerCase();
      if(name === 'next') name = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      else if(name === 'random') name = THEMES[(Math.random() * THEMES.length) | 0];
      if(!THEMES.includes(name)){ print("theme: unknown '"+esc(name)+"' — try: "+THEMES.join(', '), 'err'); return; }
      applyTheme(name);
      print("theme set to "+name+" ✨", 'ok');
    },
    history(){ hist.forEach((h,i) => print("  "+(i+1)+"  "+esc(h))); },
    // ---- the kids ----
    tommy(){ loveSon("Tommy"); },
    benny(){ loveSon("Benny"); },
    calvin(){ loveSon("Calvin"); },
    sons(){ confetti(); print("Tommy · Benny · Calvin — I love my sons! ❤️", 'ok'); },
    // ---- the right-hand man ----
    q(){ confetti();
      print("&gt;&gt;&gt;  H U G H   C A R L O S   J O N E S   I  &lt;&lt;&lt;", 'ok');
      print("l33t gamer · right-hand man · certified 1337", 'info');
      print("the clutch king — 360 no-scope, GG no re. 🎮👑", 'warn');
      print("my brother, my MVP. respect. 🤝", 'dim');
    },
    // ---- easter eggs ----
    sudo(a, rest){
      const s = rest.toLowerCase();
      if(s.includes('rm -rf')){ print("nice try. this homelab has backups and a restraining order.", 'warn'); return; }
      if(s.includes('sandwich')){ print("Okay.", 'ok'); pre(cowsay("one sandwich, coming up 🥪")); return; }
      if(!s){ print("usage: sudo &lt;command&gt;", 'warn'); return; }
      print("thomas is not in the sudoers file. This incident will be reported.", 'err');
    },
    rm(a, rest){ print(rest.includes('-rf') ? "I can't let you do that, Thomas." : "rm: permission denied (this is a museum)", 'err'); },
    make(a, rest){ print(rest.includes('sandwich') ? "what? make it yourself." : "make: nothing to be done.", 'warn'); },
    vim(){ print("you opened vim. you live here now. (try :q)", 'warn'); },
    nano(){ print("nano? in this house we suffer in vim.", 'warn'); },
    exit(){ print("there is no exit, only more side projects.", 'warn'); },
    sl(){ pre(TRAIN); },
    cowsay(a, rest){ pre(cowsay(rest || "moo")); },
    coffee(){ print("brewing…", 'dim'); pre(COFFEE); print("☕ done.", 'ok'); },
    fortune(){ print(esc(FORTUNES[(Math.random()*FORTUNES.length)|0]), 'info'); },
    cmatrix(){
      if(reduce){ print("the matrix has you… (reduced-motion is on, so picture the green rain) 🟩", 'ok'); return; }
      if(document.getElementById('matrix')) return;
      const cv = el('canvas'); cv.id = 'matrix'; document.body.appendChild(cv);
      const hint = el('div','matrix-hint','press any key or tap to exit'); document.body.appendChild(hint);
      const ctx = cv.getContext('2d'); const fs = 16;
      const chars = 'アァカサタナハマヤラワンゴ0123456789ABCDEFZ:.=*+<>¦|'.split('');
      let W, H, cols, drops;
      function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight; cols = Math.ceil(W/fs); drops = Array(cols).fill(0).map(() => (Math.random()*(H/fs))|0); }
      size();
      let raf, last = 0, running = true;
      const SONS = ['TOMMY','BENNY','CALVIN']; let msgs = [], sonIdx = 0, frameN = 0;
      function draw(){
        frameN++;
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0,0,W,H);
        ctx.font = fs+'px monospace';
        for(let i=0;i<cols;i++){
          const ch = chars[(Math.random()*chars.length)|0];
          const x = i*fs, y = drops[i]*fs;
          ctx.fillStyle = Math.random() > 0.97 ? '#d8ffe4' : '#35d36a';
          ctx.fillText(ch, x, y);
          if(y > H && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
        // a son's name falls through the rain, glowing
        if(msgs.length < 2 && (frameN % 80 === 0 || (frameN === 4 && !msgs.length))){
          msgs.push({ t: SONS[(sonIdx++) % SONS.length], col: ((Math.random()*(cols-2))|0)+1, row: -((Math.random()*8)|0) });
        }
        ctx.save(); ctx.shadowColor = '#9effb8'; ctx.shadowBlur = 12; ctx.font = 'bold ' + (fs+2) + 'px monospace';
        for(const m of msgs){
          for(let k=0;k<m.t.length;k++){
            const ry = m.row + k;
            if(ry >= 0){ ctx.fillStyle = k === m.t.length-1 ? '#ffffff' : '#eafff1'; ctx.fillText(m.t[k], m.col*fs, ry*fs); }
          }
          if(frameN % 2 === 0) m.row++;   // names linger: fall at half the rain's speed
        }
        ctx.restore();
        msgs = msgs.filter(m => m.row*fs < H + 40);
      }
      function loop(t){ if(!running) return; raf = requestAnimationFrame(loop); if(t-last < 33) return; last = t; draw(); }
      raf = requestAnimationFrame(loop);
      print("entering the matrix… press any key or tap to exit", 'ok');
      function exit(e){ if(!running) return; if(e){ e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation(); }
        running = false; cancelAnimationFrame(raf); cv.remove(); hint.remove();
        document.removeEventListener('keydown', exit, true); window.removeEventListener('resize', size);
        print("…follow the white rabbit. 🐇", 'dim'); scroll(); }
      document.addEventListener('keydown', exit, true);
      cv.addEventListener('click', exit); cv.addEventListener('touchstart', exit, {passive:true});
      window.addEventListener('resize', size);
    },
    snake(){
      if(reduce){ print("snake needs motion — reduced-motion is on.", 'warn'); return; }
      if(document.getElementById('snake')) return;
      const cv = el('canvas'); cv.id = 'snake'; document.body.appendChild(cv);
      const hint = el('div','matrix-hint','arrows / WASD · swipe · Esc to quit'); document.body.appendChild(hint);
      const ctx = cv.getContext('2d'); const cell = 18;
      const cs = (v) => { try { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); } catch(e){ return ''; } };
      const colSnake = cs('--green')||'#9ece6a', colFood = cs('--pink')||'#f7768e', colText = cs('--text')||'#fff', colBg = cs('--bg')||'#000', colDim = cs('--faint')||'#888';
      let W, H, cols, rws;
      function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight; cols = Math.floor(W/cell); rws = Math.floor(H/cell); }
      size();
      let body2, dx, dy, pend, food, score, dead, timer;
      function place(){ food = {x:(Math.random()*cols)|0, y:(Math.random()*rws)|0}; }
      function reset(){ dx=1; dy=0; pend=null; const cx=(cols/2)|0, cy=(rws/2)|0; body2=[{x:cx,y:cy},{x:cx-1,y:cy},{x:cx-2,y:cy}]; score=0; dead=false; place(); }
      reset();
      function draw(){
        ctx.fillStyle=colBg; ctx.fillRect(0,0,W,H);
        ctx.fillStyle=colFood; ctx.fillRect(food.x*cell+1, food.y*cell+1, cell-2, cell-2);
        ctx.fillStyle=colSnake; for(const s of body2) ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
        ctx.fillStyle=colText; ctx.font='16px monospace'; ctx.textAlign='left'; ctx.fillText('score '+score, 12, 24);
        if(dead){ ctx.textAlign='center'; ctx.font='bold 30px monospace'; ctx.fillText('GAME OVER · '+score, W/2, H/2-8);
          ctx.fillStyle=colDim; ctx.font='15px monospace'; ctx.fillText('space to retry · Esc to quit', W/2, H/2+22); ctx.textAlign='left'; }
      }
      function step(){
        if(dead) return;
        if(pend){ dx=pend.x; dy=pend.y; pend=null; }
        const nx=body2[0].x+dx, ny=body2[0].y+dy;
        if(nx<0||ny<0||nx>=cols||ny>=rws){ dead=true; draw(); return; }
        for(const s of body2){ if(s.x===nx&&s.y===ny){ dead=true; draw(); return; } }
        body2.unshift({x:nx,y:ny});
        if(nx===food.x&&ny===food.y){ score++; place(); } else { body2.pop(); }
        draw();
      }
      timer = setInterval(step, 110); draw();
      function turn(x,y){ if(x===-dx&&y===-dy) return; pend={x:x,y:y}; }
      const MAP = {ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
      function key(e){
        const k = e.key;
        if(k==='Escape'||k==='q'||k==='Q'){ quit(e); return; }
        if(dead && (k===' '||k==='Enter')){ e.preventDefault(); e.stopPropagation(); reset(); return; }
        const m = MAP[k] || MAP[(k||'').toLowerCase()];
        if(m){ e.preventDefault(); e.stopPropagation(); turn(m[0], m[1]); }
      }
      let tx, ty;
      function ts(e){ const t=e.touches[0]; tx=t.clientX; ty=t.clientY; }
      function te(e){ const t=e.changedTouches[0]; const ax=t.clientX-tx, ay=t.clientY-ty; if(dead){ reset(); return; } if(Math.abs(ax)>Math.abs(ay)) turn(ax>0?1:-1,0); else turn(0,ay>0?1:-1); }
      function quit(e){ if(e){ e.preventDefault&&e.preventDefault(); e.stopPropagation&&e.stopPropagation(); } clearInterval(timer); document.removeEventListener('keydown',key,true); cv.remove(); hint.remove(); window.removeEventListener('resize',size); print('snake over · score '+score+'. gg.', 'ok'); scroll(); }
      document.addEventListener('keydown', key, true);
      cv.addEventListener('touchstart', ts, {passive:true}); cv.addEventListener('touchend', te, {passive:true});
      window.addEventListener('resize', size);
      print('snake — arrows/WASD or swipe, Esc to quit. 🐍', 'ok');
    },
    type(){
      if(document.getElementById('typing')) return;
      const TEXT = "Thomas Jones III came up through the Apple Valley school system before earning a full-ride Chancellor Scholarship to UW-Madison, where he double-majored in Computer Engineering and Computer Science in the College of Engineering and graduated with a 3.421 GPA. Along the way he became a proud Pi Lambda Phi brother. After college he teamed up with Kyle Krahn as a Salesforce consultant and never looked back -- today he is a Solution Architect and employee number two at Krahnborn Consulting. Shoutout to his brother Hugh Jones, his main man from day one.";
      const ov = el('div'); ov.id = 'typing';
      ov.innerHTML = '<div class="tt-card"><div class="tt-head">typing test · the story of TJ <span class="tt-x">Esc to quit</span></div><div class="tt-stats" id="tt-stats">0 wpm · 100% · start typing</div><div class="tt-text" id="tt-text"></div><input id="tt-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="typing input"/></div>';
      document.body.appendChild(ov);
      const textEl = document.getElementById('tt-text'), statsEl = document.getElementById('tt-stats'), inp = document.getElementById('tt-in');
      const spans = [];
      for(let i=0;i<TEXT.length;i++){ const s = el('span'); s.textContent = TEXT[i]; textEl.appendChild(s); spans.push(s); }
      let idx=0, correct=0, typed=0, t0=0, done=false; const marks=[];
      spans[0].className = 'tt-cur';
      function fmt(){ const mins=(performance.now()-t0)/60000; const wpm=(t0&&mins>0)?Math.round((typed/5)/mins):0; const acc=typed?Math.round(correct/typed*100):100; statsEl.textContent = wpm+' wpm · '+acc+'% · '+idx+'/'+TEXT.length; }
      function finish(){ done=true; const mins=(performance.now()-t0)/60000; const wpm=mins>0?Math.round((TEXT.length/5)/mins):0; const acc=typed?Math.round(correct/typed*100):100; statsEl.innerHTML='<b>done!</b> '+wpm+' wpm · '+acc+'% accuracy — Esc to close'; }
      function key(e){
        const k = e.key;
        if(k==='Escape'){ quit(e); return; }
        if(done) return;
        if(k==='Backspace'){ e.preventDefault(); e.stopPropagation(); if(idx>0){ spans[idx].className=''; idx--; if(marks[idx]) correct--; typed--; marks[idx]=undefined; spans[idx].className='tt-cur'; fmt(); } return; }
        if(k.length!==1) return;
        e.preventDefault(); e.stopPropagation();
        if(!t0) t0=performance.now();
        if(idx>=TEXT.length) return;
        const ok = (k===TEXT[idx]); marks[idx]=ok; spans[idx].className = ok?'tt-ok':'tt-bad';
        if(ok) correct++; typed++; idx++;
        if(idx<TEXT.length) spans[idx].className='tt-cur';
        fmt();
        if(idx>=TEXT.length) finish();
      }
      function quit(e){ if(e){ e.preventDefault&&e.preventDefault(); e.stopPropagation&&e.stopPropagation(); } document.removeEventListener('keydown',key,true); ov.remove(); print('typing test closed.', 'dim'); scroll(); }
      document.addEventListener('keydown', key, true);
      setTimeout(() => { try { inp.focus(); } catch(e){} }, 60);
      print('typing test — type the story of TJ. Esc to quit. ⌨️', 'ok');
    },
    gg(){
      confetti();
      pre([
        " ██████╗  ██████╗     ███████╗███████╗",
        "██╔════╝ ██╔════╝     ██╔════╝╚══███╔╝",
        "██║  ███╗██║  ███╗    █████╗    ███╔╝ ",
        "██║   ██║██║   ██║    ██╔══╝  ███╔╝   ",
        "╚██████╔╝╚██████╔╝    ███████╗███████╗",
        " ╚═════╝  ╚═════╝     ╚══════╝╚══════╝"
      ].join("\n"));
      print("g00d g4m3. wp, no re. 🏆", 'ok');
      print("shoutout Hugh — carried as always. 🎮", 'dim');
    },
    hi(){ print("hey thomas 👋", 'ok'); },
    life(){ print("42.", 'ok'); }
  };
  const aliases = { cd:'open', grep:'find', search:'find', vi:'vim', emacs:'vim', hello:'hi', hey:'hi',
    ll:'ls', cls:'clear', ':q':'vim', ':q!':'vim', ':wq':'vim', '42':'life', kids:'sons', matrix:'cmatrix',
    hugh:'q', ggez:'gg', wp:'gg', themes:'theme', bennett:'benny',
    typetest:'type', typing:'type', game:'snake' };

  function run(raw){
    const cmd = raw.trim();
    echo(cmd);
    if(cmd){ hist.push(cmd); hpos = hist.length; }
    if(!cmd){ return; }
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    const rest = cmd.slice(parts[0].length).trim();
    const fn = cmds[name] || cmds[aliases[name]];
    if(fn) { try { fn(args, rest); } catch(err){ print("error: "+esc(err.message), 'err'); } }
    else print("command not found: "+esc(name)+" — type <b>help</b>", 'err');
    scroll();
  }

  IN.addEventListener('keydown', e => {
    if(e.key === 'Enter'){ run(IN.value); IN.value = ''; }
    else if(e.key === 'ArrowUp'){ if(hist.length){ e.preventDefault(); hpos = Math.max(0, hpos-1); IN.value = hist[hpos] || ''; const n=IN.value.length; requestAnimationFrame(()=>IN.setSelectionRange(n,n)); } }
    else if(e.key === 'ArrowDown'){ if(hist.length){ e.preventDefault(); hpos = Math.min(hist.length, hpos+1); IN.value = hist[hpos] || ''; } }
    else if(e.key === 'Tab'){ e.preventDefault(); const cur = IN.value.trim().toLowerCase(); if(cur){ const hit = Object.keys(cmds).filter(c => c.startsWith(cur)); if(hit.length === 1) IN.value = hit[0] + ' '; else if(hit.length > 1){ echo(IN.value); print(hit.join('  '), 'dim'); scroll(); } } }
    else if(e.key.toLowerCase() === 'l' && e.ctrlKey){ e.preventDefault(); OUT.innerHTML = ''; }
  });
  consoleEl.addEventListener('click', () => { if((getSelection()+'') === '') IN.focus(); });
  document.addEventListener('keydown', e => { if(e.key === '/' && document.activeElement !== IN && !/^(input|textarea)$/i.test(document.activeElement.tagName)){ e.preventDefault(); IN.focus(); } });

  // open artifacts inside the themed viewer frame (modifier-click opens raw)
  rows.forEach(r => r.addEventListener('click', e => {
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault(); openArtifact(r.getAttribute('href'));
  }));

  const themeSel = document.getElementById('theme-select');
  if(themeSel) themeSel.addEventListener('change', () => { applyTheme(themeSel.value); print("theme → "+themeSel.value+" ✨", 'ok'); scroll(); });
  try { const saved = localStorage.getItem('jones-theme'); if(saved && THEMES.includes(saved)) applyTheme(saved); } catch(e){}

  // idle screensaver: launch cmatrix after 60s of no input
  let idleTimer;
  function resetIdle(){ clearTimeout(idleTimer); idleTimer = setTimeout(() => { if(!document.getElementById('matrix') && !document.getElementById('snake') && !document.getElementById('typing') && !document.hidden) cmds.cmatrix(); }, 60000); }
  ['keydown','mousemove','touchstart','click','wheel'].forEach(ev => document.addEventListener(ev, resetIdle, {passive:true}));
  resetIdle();

  print("jonesOS ready · "+rows.length+" artifacts. type <b>help</b> to start, or scroll to browse. <span class='dim'>(/ focuses · ↑ history · Tab completes · try <b>theme</b> or <b>snake</b>)</span>", 'info');
})();
"""

body = f"""  <main class="term">
    <div class="win">
      <div class="titlebar">
        <div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
        <div class="tab"><b>{escape(USER)}</b>: {escape(CWD)} — bash</div>
        <select class="theme-select" id="theme-select" aria-label="Switch theme" title="Switch theme">{theme_options}</select>
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

        <div class="console" id="console" aria-label="Interactive terminal">
          <div id="out"></div>
          <div class="in-line">
            <span class="usr">{escape(USER)}</span><span class="sep">:</span><span class="cwd">{escape(CWD)}</span><span class="dollar">$</span><span class="cur"></span><input id="cmd-in" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type a command" />
          </div>
        </div>

        {recent_block}
        {''.join(section_blocks)}

        {prompt("cat ~/.gamertag", "# my right-hand man")}
        <div class="gamertag">
          <pre class="logo logo-hugh" aria-label="HUGH">{escape(HUGH_LOGO)}</pre>
          <div class="gt-sub">HUGH CARLOS JONES I · l33t gamer · right-hand man · 1337 · <span class="gt-hint">type 'q' to hype him</span></div>
        </div>

        <div class="foot"><span class="usr">{escape(USER)}</span><span class="sep">:</span><span class="cwd">{escape(CWD)}</span><span class="dollar">$</span> synced from <code>tjonestj3/krahnie-artifacts</code> · add to home screen for app feel <span class="cur"></span></div>
      </div>
    </div>
  </main>"""

SITE_URL = "https://tjonestj.com"
DESC = ("Terminal-themed home of Thomas Jones III — Solution Architect & employee #2 at "
        "Krahnborn Consulting. Browse generated sites, prototypes, comics & reports; switch "
        "themes, play snake, or type the story of TJ.")
FAVICON_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
               '<rect width="64" height="64" rx="13" fill="#0f1016"/>'
               '<path d="M14 22l13 10-13 10" fill="none" stroke="#9ece6a" stroke-width="5" '
               'stroke-linecap="round" stroke-linejoin="round"/>'
               '<rect x="33" y="40" width="18" height="5" rx="2.5" fill="#7dcfff"/></svg>')
FAVICON = "data:image/svg+xml," + quote(FAVICON_SVG, safe="")


def head_meta(title, desc, url):
    return (
        f'  <link rel="icon" href="{FAVICON}" />\n'
        f'  <meta name="description" content="{escape(desc)}" />\n'
        f'  <meta property="og:type" content="website" />\n'
        f'  <meta property="og:site_name" content="tjonestj.com" />\n'
        f'  <meta property="og:title" content="{escape(title)}" />\n'
        f'  <meta property="og:description" content="{escape(desc)}" />\n'
        f'  <meta property="og:url" content="{escape(url)}" />\n'
        f'  <meta property="og:image" content="{SITE_URL}/og-image.png" />\n'
        f'  <meta name="twitter:card" content="summary_large_image" />\n'
        f'  <meta name="twitter:title" content="{escape(title)}" />\n'
        f'  <meta name="twitter:description" content="{escape(desc)}" />\n'
        f'  <meta name="twitter:image" content="{SITE_URL}/og-image.png" />\n'
    )


# ---- shared files for other artifacts / the viewer frame ----
THEME_JS = (
    "(function(){\n"
    "  var THEMES = " + json.dumps(THEME_NAMES) + ";\n"
    "  var sel = document.getElementById('theme-select');\n"
    "  if(!sel){\n"
    "    sel = document.createElement('select'); sel.id = 'jones-theme-switch'; sel.setAttribute('aria-label','Theme');\n"
    "    for(var i=0;i<THEMES.length;i++){ var o=document.createElement('option'); o.value=THEMES[i]; o.textContent=THEMES[i]; sel.appendChild(o); }\n"
    "    (document.body||document.documentElement).appendChild(sel);\n"
    "  }\n"
    "  function applyTheme(n){ if(THEMES.indexOf(n)<0) return; document.documentElement.setAttribute('data-theme', n); try{localStorage.setItem('jones-theme', n);}catch(e){} if(sel.value!==n) sel.value=n; }\n"
    "  sel.addEventListener('change', function(){ applyTheme(sel.value); });\n"
    "  try{ var s = localStorage.getItem('jones-theme'); if(s && THEMES.indexOf(s)>=0){ document.documentElement.setAttribute('data-theme', s); sel.value = s; } }catch(e){}\n"
    "})();\n"
)

VIEWER_HTML = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="dark" />
<title>viewer · tjonestj.com</title>
<link rel="icon" href="__FAVICON__" />
<link rel="stylesheet" href="/theme.css" />
<style>
  html,body{height:100%;margin:0;overflow:hidden;background:var(--bg);color:var(--text);font-family:var(--mono)}
  .vwin{display:flex;flex-direction:column;height:100vh;height:100dvh}
  .vbar{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--border);flex:0 0 auto}
  .dots{display:flex;gap:7px;flex:0 0 auto}
  .dot{width:12px;height:12px;border-radius:50%}.dot.r{background:#f7768e}.dot.y{background:#e0af68}.dot.g{background:#9ece6a}
  .vbtn{flex:0 0 auto;color:var(--cyan);text-decoration:none;font-size:12.5px;border:1px solid var(--border);border-radius:7px;padding:3px 9px;background:var(--surface2)}
  .vtitle{flex:1 1 auto;min-width:0;color:var(--dim);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .vtitle b{color:var(--text)}
  iframe{flex:1 1 auto;width:100%;border:0;background:#fff}
  #jones-theme-switch{bottom:auto;top:8px}
</style>
</head>
<body>
<div class="vwin">
  <div class="vbar">
    <div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
    <a class="vbtn" href="/" title="Back to index">‹ index</a>
    <div class="vtitle" id="vtitle"><b>viewer</b></div>
    <a class="vbtn" id="vraw" href="#" target="_blank" rel="noopener" title="Open raw in a new tab">raw ↗</a>
  </div>
  <iframe id="vframe" title="artifact" referrerpolicy="no-referrer"></iframe>
</div>
<script>
(function(){
  function qp(n){ var m = new RegExp('[?&]' + n + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; }
  var p = qp('p');
  if(!p || /^([a-z]+:)?\/\//i.test(p) || p.indexOf('..') >= 0){ p = ''; }
  var fr = document.getElementById('vframe'), t = document.getElementById('vtitle'), raw = document.getElementById('vraw');
  if(p){ fr.src = p; raw.href = p; var safe = p.replace(/[&<>"]/g,''); t.innerHTML = '<b>' + safe + '</b>'; document.title = safe + ' · viewer'; }
  else { t.textContent = 'no artifact specified — go back to index'; }
})();
</script>
<script src="/theme.js" defer></script>
</body>
</html>
"""

NOTFOUND_HTML = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="dark" />
<title>404 · command not found</title>
<link rel="icon" href="__FAVICON__" />
<link rel="stylesheet" href="/theme.css" />
<style>
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}
  .nf{max-width:560px}
  .nf pre{color:var(--green);font-size:clamp(8px,2.6vw,16px);line-height:1.05;margin:0 0 18px;white-space:pre;overflow-x:hidden}
  .nf p{color:var(--dim);font-size:14px;line-height:1.6}
  .nf code{color:var(--amber)}
  .nf a{color:var(--cyan)}
</style>
</head>
<body>
<main class="nf">
  <pre> _  _    ___  _  _
| || |  / _ \| || |
| || |_| | | | || |_
|__   _| |_| |__   _|
   |_|  \___/   |_|  </pre>
  <p><code>bash: that page: command not found</code></p>
  <p>The file you were looking for isn't here. <a href="/">cd ~/artifacts</a> to head home.</p>
</main>
<script src="/theme.js" defer></script>
</body>
</html>
"""

html = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n"
    "  <meta charset=\"utf-8\" />\n"
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\n"
    "  <meta name=\"color-scheme\" content=\"dark\" />\n"
    "  <meta name=\"theme-color\" content=\"#0f1016\" />\n"
    "  <title>Thomas Jones III · Solution Architect</title>\n"
    + head_meta("Thomas Jones III · Solution Architect", DESC, SITE_URL + "/") +
    "  <style>\n" + CSS + "\n  </style>\n</head>\n<body>\n"
    + body +
    "\n  <script>window.__THEMES = " + json.dumps(THEME_NAMES) + ";</script>\n"
    "  <script>\n" + JS + "\n  </script>\n</body>\n</html>\n"
)

(ROOT / "index.html").write_text(html, encoding="utf-8")
(ROOT / ".nojekyll").write_text("", encoding="utf-8")
(ROOT / "theme.css").write_text(PALETTES + BASE_SKIN, encoding="utf-8")
(ROOT / "theme.js").write_text(THEME_JS, encoding="utf-8")
(ROOT / "viewer.html").write_text(VIEWER_HTML.replace("__FAVICON__", FAVICON), encoding="utf-8")
(ROOT / "404.html").write_text(NOTFOUND_HTML.replace("__FAVICON__", FAVICON), encoding="utf-8")
print(f"Wrote {ROOT / 'index.html'} with {len(files)} artifact links")
print("Wrote theme.css, theme.js, viewer.html, 404.html")
