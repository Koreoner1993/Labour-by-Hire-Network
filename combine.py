#!/usr/bin/env python3
"""
Combines index.html + admin.html + NFT.html into one single-page app.

Strategy:
- admin.html is the primary base (better card rendering, full profiles, ZK/Midnight wallet)
- NFT.html is embedded as a new #view-nft section
- index.html is effectively superseded by admin.html (95% identical, admin is more complete)
- Output: index.html (overwrites existing)
"""

import re

# ──────────────────────────────────────────────────────────────────────────────
# 1. READ SOURCE FILES
# ──────────────────────────────────────────────────────────────────────────────
with open('admin.html', 'r', encoding='utf-8') as f:
    admin = f.read()

with open('NFT.html', 'r', encoding='utf-8') as f:
    nft = f.read()

# ──────────────────────────────────────────────────────────────────────────────
# 2. EXTRACT NFT PARTS
# ──────────────────────────────────────────────────────────────────────────────

# Extract NFT <script> content (everything between <script> and </script> near end)
nft_script_match = re.search(r'<script>(.*?)</script>\s*</body>', nft, re.DOTALL)
nft_js = nft_script_match.group(1).strip() if nft_script_match else ''

# Extract the NFT body HTML (between <body> and <script>)
nft_body_match = re.search(r'<body>(.*?)<script>', nft, re.DOTALL)
nft_body_raw = nft_body_match.group(1).strip() if nft_body_match else ''

# Remove the NFT nav (we use the admin nav instead)
nft_body_raw = re.sub(r'<nav class="nav">.*?</nav>', '', nft_body_raw, flags=re.DOTALL)

# The NFT uses class="wrap" which conflicts with admin's .wrap — rename to nft-wrap
nft_body = nft_body_raw.replace('class="wrap"', 'class="nft-wrap"')
# The NFT uses class="hero" which may conflict — rename to nft-hero
nft_body = nft_body.replace('class="hero"', 'class="nft-hero"')
# Also update the CSS reference in any inline styles
nft_body = nft_body.replace('<!-- TIER SHOWCASE -->', '<!-- NFT TIER SHOWCASE -->')

# ──────────────────────────────────────────────────────────────────────────────
# 3. NFT CSS TO ADD (renamed classes + scoped vars)
# ──────────────────────────────────────────────────────────────────────────────

nft_css = """
/* ══════════════════════════════════════════════════════════════════════════
   NFT VIEW — Scoped styles for #view-nft
   ══════════════════════════════════════════════════════════════════════════ */

/* Scoped CSS vars that differ from the main app */
#view-nft {
  --s2:#181b24;
  --s3:#1e222e;
  --t2:#9299AA;
  --t3:#5A6070;
  --b2:rgba(255,255,255,0.13);
  font-family:'Barlow',system-ui,sans-serif;
}

/* NFT wrap (renamed from .wrap to avoid conflict) */
.nft-wrap{max-width:1160px;margin:0 auto;padding:2rem}

/* NFT hero (renamed from .hero to avoid conflict) */
.nft-hero{text-align:center;padding:2.5rem 0 2rem}
.nft-hero h1{font-family:'Barlow Condensed',sans-serif;font-size:46px;font-weight:700;line-height:1.05;margin-bottom:8px}
.nft-hero h1 span{color:var(--gold)}
.nft-hero p{font-size:15px;color:var(--t2);max-width:480px;margin:0 auto}

/* SLIDER */
.slider-bar{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem 1.5rem;margin-bottom:2rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap}
.slider-bar label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);white-space:nowrap}
.slider-bar input[type=range]{flex:1;min-width:140px;accent-color:var(--gold);height:6px}
.job-num{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:700;color:var(--gold);min-width:48px;text-align:right}
.tier-pill{font-size:11px;font-weight:700;padding:4px 14px;border-radius:100px;white-space:nowrap}

/* MAIN GRID */
.nft-main-grid{display:grid;grid-template-columns:340px 1fr;gap:1.5rem;align-items:start}

/* COIN STAGE */
.coin-stage{background:var(--s2);border:1px solid var(--border);border-radius:14px;padding:2rem;text-align:center;position:relative;overflow:hidden}
.coin-stage::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 30%,rgba(245,158,11,0.08),transparent);pointer-events:none}
.coin-wrap{position:relative;display:inline-block}
.coin-img{width:240px;height:240px;object-fit:contain;filter:drop-shadow(0 8px 32px rgba(0,0,0,0.7));transition:filter .3s}
.coin-overlay{position:absolute;inset:0;border-radius:50%;pointer-events:none;transition:background .4s}
.coin-glow{position:absolute;inset:-8px;border-radius:50%;pointer-events:none;transition:box-shadow .4s}
.coin-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;color:var(--t3);text-transform:uppercase;margin-top:14px}
.coin-id{font-family:monospace;font-size:11px;color:var(--t3);margin-top:4px}

/* STICKER LAYER */
.sticker-overlay{position:absolute;inset:0;border-radius:50%;overflow:hidden}

/* NFT CARD */
.nft-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.nft-top{background:var(--s2);padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.nft-title{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700}
.nft-body{padding:16px}

.nft-trait-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.nft-trait{background:var(--s2);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px}
.nft-trait .trait-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--t3);margin-bottom:3px}
.nft-trait .trait-val{font-size:13px;font-weight:600}

.stk-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);margin-bottom:8px}
.stk-list{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}
.stk{font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;display:inline-flex;align-items:center;gap:4px}
.stk-blue{background:rgba(30,136,229,0.12);color:#1E88E5;border:1px solid rgba(30,136,229,0.28)}
.stk-gold{background:rgba(245,158,11,0.1);color:#F59E0B;border:1px solid rgba(245,158,11,0.25)}
.stk-green{background:rgba(34,197,94,0.1);color:#22C55E;border:1px solid rgba(34,197,94,0.2)}
.stk-red{background:rgba(239,68,68,0.1);color:#EF4444;border:1px solid rgba(239,68,68,0.25)}
.stk-purple{background:rgba(168,85,247,0.1);color:#A855F7;border:1px solid rgba(168,85,247,0.25)}

.chain-bar{background:var(--s3);border-radius:var(--rs);padding:10px 12px;display:flex;align-items:center;justify-content:space-between}
.ch-l{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t3);margin-bottom:2px}
.ch-v{font-size:12px;font-weight:600;font-family:monospace}

/* TIER SHOWCASE */
.tiers-title{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;margin:2rem 0 1rem;display:flex;align-items:center;gap:8px}
.tier-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.tier-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1rem;text-align:center;cursor:pointer;transition:border-color .15s,transform .1s}
.tier-card:hover{transform:translateY(-3px)}
.tier-card.active{border-color:rgba(245,158,11,0.25);background:rgba(245,158,11,0.1)}
.tier-coin-img{width:72px;height:72px;object-fit:contain;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.5))}
.tier-name{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;margin-top:6px}
.tier-range{font-size:10px;color:var(--t3);margin-top:1px}
.tier-supply{font-size:10px;font-weight:700;margin-top:2px}

/* EARNED NFT SECTION */
.earned-section{margin-top:2rem}
.earned-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:8px}
.earned-title{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;display:flex;align-items:center;gap:8px}
.earned-count{font-size:12px;font-weight:700;padding:3px 12px;border-radius:100px;background:rgba(245,158,11,0.1);color:#F59E0B;border:1px solid rgba(245,158,11,0.25)}
.earned-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.earned-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 12px;text-align:center;transition:border-color .15s,transform .1s;position:relative}
.earned-card:hover{transform:translateY(-2px);border-color:var(--b2)}
.earned-card.unlocked{border-color:rgba(245,158,11,0.25);background:linear-gradient(135deg,var(--s2),var(--s3))}
.earned-card.locked{opacity:0.28;filter:grayscale(1)}
.earned-icon{font-size:28px;margin-bottom:8px;display:block;line-height:1}
.earned-name{font-size:11px;font-weight:700;color:var(--text);line-height:1.3}
.earned-req{font-size:10px;color:var(--t3);margin-top:3px}
.earned-badge-pill{position:absolute;top:-5px;right:-5px;font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px}
.earned-new{background:#22C55E;color:#052e16}
.earned-locked-icon{font-size:10px;color:var(--t3);margin-top:4px}

/* EVO LOG */
.evo-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;margin-top:1.5rem}
.evo-title{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;margin-bottom:1rem}
.evo-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px}
.evo-item:last-child{border-bottom:none}
.evo-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
.evo-jobs{font-size:11px;font-weight:700;color:var(--t3);min-width:56px;flex-shrink:0;white-space:nowrap}

/* CSS colour filters for coin tinting */
.tint-blue{filter:drop-shadow(0 8px 32px rgba(0,0,0,0.7)) sepia(1) saturate(3) hue-rotate(190deg) brightness(1.05)}
.tint-green{filter:drop-shadow(0 8px 32px rgba(0,0,0,0.7)) sepia(1) saturate(3) hue-rotate(80deg) brightness(1.05)}
.tint-grey{filter:drop-shadow(0 8px 32px rgba(0,0,0,0.7)) grayscale(1) brightness(0.95)}
.tint-black{filter:drop-shadow(0 8px 32px rgba(245,158,11,0.5)) grayscale(1) brightness(0.25) contrast(1.5)}
.tint-gold{filter:drop-shadow(0 8px 32px rgba(0,0,0,0.7))}

@media(max-width:720px){
  .nft-main-grid{grid-template-columns:1fr}
  .tier-row{grid-template-columns:repeat(3,1fr)}
  .nft-hero h1{font-size:32px}
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# 4. NFT VIEW HTML
# ──────────────────────────────────────────────────────────────────────────────

# Replace main-grid class reference in the NFT body html since we renamed it
nft_body = nft_body.replace('class="main-grid"', 'class="nft-main-grid"')
# Replace trait-grid and trait class references to avoid conflicts with any future additions
nft_body = nft_body.replace('id="trait-grid"', 'id="nft-trait-grid"')
nft_body = nft_body.replace('class="trait-grid"', 'class="nft-trait-grid"')

# Update JS render function references to use new IDs
nft_js = nft_js.replace("document.getElementById('trait-grid')", "document.getElementById('nft-trait-grid')")
# The nft_js uses .map(t=>`<div class="trait">...`) — update that too
nft_js = nft_js.replace('`<div class="trait">', '`<div class="nft-trait">')

nft_view = f"""
<!-- ══════════════════════════════════════════════════════════════════════════
     NFT BADGES VIEW  (from NFT.html)
══════════════════════════════════════════════════════════════════════════ -->
<div id="view-nft" style="display:none">
{nft_body}
</div>
"""

# ──────────────────────────────────────────────────────────────────────────────
# 5. NFT JAVASCRIPT WRAPPER
# ──────────────────────────────────────────────────────────────────────────────

nft_js_wrapped = f"""
/* ══════════════════════════════════════════════════════════════════════════
   NFT HARDHAT LOGIC  (from NFT.html)
══════════════════════════════════════════════════════════════════════════ */
{nft_js}
"""

# ──────────────────────────────────────────────────────────────────────────────
# 6. MODIFY ADMIN.HTML
# ──────────────────────────────────────────────────────────────────────────────

combined = admin

# A) Update <title>
combined = combined.replace(
    '<title>Labour by Hire — Construction ID Network</title>',
    '<title>Labour by Hire — Construction ID Network &amp; NFT Badges</title>'
)

# B) Add Barlow fonts after DM Sans font link
barlow_link = '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">'
combined = combined.replace(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">\n' + barlow_link
)

# C) Add NFT CSS before </style>
combined = combined.replace('</style>', nft_css + '\n</style>', 1)

# D) Add "NFT Badges" nav link (after "How it works" button)
combined = combined.replace(
    '<button class="nl" onclick="showHowModal()">How it works</button>\n    </div>',
    '<button class="nl" onclick="showHowModal()">How it works</button>\n      <button class="nl" onclick="showView(\'nft\')">NFT Badges</button>\n    </div>'
)

# E) Insert NFT view before </main>
combined = combined.replace('</main>', nft_view + '\n</main>')

# F) Update showView() to include 'nft'
combined = combined.replace(
    "['home','profile','listed','getlisted','employer-landing','dashboard'].forEach",
    "['home','profile','listed','getlisted','employer-landing','dashboard','nft'].forEach"
)

# G) Update footer "Admin" link to remove cross-reference (it's now all one file)
combined = combined.replace(
    '<a href="admin.html" style="font-size:10px;color:var(--text-3);opacity:.3;text-decoration:none">Admin</a>',
    '<a href="#" onclick="showView(\'nft\')" style="font-size:10px;color:var(--text-3);opacity:.3;text-decoration:none">NFT Badges</a>'
)

# H) Append NFT JavaScript before </script>
combined = combined.replace('</script>\n</body>', nft_js_wrapped + '\n</script>\n</body>')

# ──────────────────────────────────────────────────────────────────────────────
# 7. WRITE OUTPUT
# ──────────────────────────────────────────────────────────────────────────────

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(combined)

print("Done! Combined file written to index.html")

# Count lines
line_count = combined.count('\n') + 1
size_kb = len(combined.encode('utf-8')) / 1024
print(f"Lines: {line_count:,}  |  Size: {size_kb:,.0f} KB")
