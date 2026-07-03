# fink — Design System

**fink** is an AI product for **EEG compliance** — it helps German solar, wind, and biogas operators (and the legal/compliance teams and law firms that advise them) stay compliant with the *Erneuerbare-Energien-Gesetz* (Renewable Energy Sources Act). fink reads the regulation, maps each statutory duty to a specific plant, flags what must be filed, and drafts the filings — always with cited sources.

- **Domain:** EEG / energy-law compliance, *Marktstammdatenregister* (MaStR) reporting, deadlines (Fristen), evidence (Nachweise).
- **Primary users:** in-house legal & compliance teams; external counsel / law firms.
- **Personality:** modern & technical (AI-native, precise) · authoritative & institutional (legal-grade, trustworthy) · calm & minimal (quiet confidence, generous whitespace).
- **Languages:** bilingual — German is the product/domain language (statute refs, plant names, UI labels); English is used for meta/marketing framing.

## Brand at a glance
- **Name:** *fink* (German for *finch*) — always lowercase, set in **Gilmer Heavy/Bold**.
- **Hero color:** **fink ultramarine (`#1213BE`)** — the standard brand blue, used as the *primary accent* on predominantly **white / cool-gray** surfaces, plus as a full-bleed statement field (see `guidelines/cards/brand-klein.html`).es/cards/brand-klein.html`).
- **Logo:** the lowercase **“fink” wordmark**, always set in the **Gilmer Outline** cut (a sans-serif). Primary lockup is white outline on Klein blue (`assets/logo/fink-logo.png`); inverted is the Klein-blue outline on white (app hero). The same Outline wordmark is used at small sizes in UI chrome (nav, sidebar) — no solid cut for the logo.

> **Design law (per client direction):** the system is **mainly white + Yves Klein blue**. *Konform* (compliant — the dominant state) is rendered in Klein blue, so a healthy portfolio reads as mostly blue. Pending/draft states fall back to **neutral gray**. **Red is the only accent beyond blue, reserved strictly for *Überfällig* (overdue) / alarms.** Green and amber scales remain *defined* in tokens for charts/edge cases but are intentionally **not** used in core product surfaces.

---

## Sources provided
No external codebase or Figma was attached — this system was authored from the brief plus client-provided assets:
- **Brand font:** Gilmer (6 weights incl. Outline), provided as `.otf` → self-hosted in `assets/fonts/`.
- **Hero video:** `anwaelte_mix.mp4` ("Anwälte" / lawyers) → `assets/media/`, used in the app login/landing hero.
- Brief: "AI startup for legal-tech systems (esp. EEG compliance), Yves Klein blue as prime color," German + English, web-app focused, Klein as primary accent on neutral surfaces.

If you have the original brand book, Figma, or product codebase, share it and this system can be reconciled against it.

---

## CONTENT FUNDAMENTALS — how fink writes

**Tone:** calm, exact, and quietly authoritative — like a meticulous colleague, never a hype-machine. fink states facts and cites the statute. It never over-promises ("we'll handle everything") and never alarms gratuitously.

**Voice mechanics**
- **Language split:** German for everything domain-facing (UI, statute refs, plant data); English only for outward/marketing framing ("Compliance, automated").
- **Person:** the product refers to itself in third person by name — "**fink** hat 12 neue Pflichten erkannt", "**fink** prüft jede Anlage". Users are addressed formally (**Sie**), not *du*. Avoid first-person "we/wir" in product copy.
- **Casing:** sentence case for UI and headlines (German nouns capitalised normally). Uppercase is reserved for small eyebrows/labels with wide tracking (e.g. `MARKTSTAMMDATENREGISTER`). The wordmark *fink* is always lowercase.
- **Numbers & law:** German formatting — `12.480 kWp`, `+2,1 %`, dates `31.07.2026`. Statute references are precise and set in mono: `§ 71 EEG 2023`, `§ 21c EEG`. MaStR IDs in mono: `SEE901134`.
- **Emoji:** **none** in product UI. No decorative emoji, ever. (Lucide icons carry all iconographic meaning.)
- **Evidence first:** claims come with a source. The AI assistant always attaches citation chips (`§ …`, `MaStR-Nr. …`, `Netzbetreiber-Export …`).

**Examples**
- ✓ "Frist in 6 Tagen. Meldung an das MaStR vorbereiten." ✗ "⚠️ Hurry! Your deadline is almost here!!!"
- ✓ "fink hat 3 Pflichten für diese Anlage gefunden." ✗ "Our AI magically detected some stuff 🎉"
- ✓ "Quelle: § 19 EEG 2023, Abs. 1." ✗ "Trust us, it's compliant."

See `guidelines/cards/brand-voice.html` for the do/don't specimen.

---

## VISUAL FOUNDATIONS

**Color**
- **Klein blue scale** (`--klein-50…900`); **`--klein-600 = #1213BE`** (fink ultramarine) is *the* brand. Used for: primary buttons, active nav, links, focus rings, the *Konform* status, progress fills, and full-bleed statement panels.
- **Neutrals** are a **cool, faintly blue-cast gray** (`--gray-0…900`) — surfaces, borders, ink. Never pure-neutral; the blue cast makes the accent feel native.
- **Status (restrained):** Konform → Klein blue · Frist offen / Entwurf → neutral gray · **Überfällig → red (the sole alarm)**. Most of a portfolio is compliant, so screens are dominated by white + blue with rare red.
- Imagery (hero video) is pushed **cool**: a Klein `mix-blend: color` wash + a dark blue scrim unify any footage to the brand.

**Type** — one family does almost everything.
- **Gilmer** (geometric sans, self-hosted): Light 300 · Regular 400 · Medium 500 · Bold 700 · Heavy 800, plus a display-only **Gilmer Outline** cut for oversized hero marks (`fink` as line art).
- **JetBrains Mono** for *data*: MaStR IDs, §-refs, figures in tables, dates (tabular numerals).
- Display/H1 use tight tracking (`-0.02em`); eyebrows use wide tracking (`0.06em`) + uppercase. Body defaults to 14px (product) / 15px (reading).

**Spacing & layout**
- **4px base grid** (`--space-1…13`). Whitespace is a brand value — default to the *larger* step when unsure.
- App shell: 256px sidebar + 60px topbar; content max 1280px; readable prose measure 720px.

**Shape & elevation**
- **Moderate radii** — `--radius-md: 8px` for controls/cards, up to `2xl: 24px`; pills for badges/switches. Modern but not playful.
- **Soft, cool-tinted shadows** (a hint of Klein in the shadow color), low-spread. fink separates with **1px borders + a faint shadow**, not heavy drop shadows. Only floating layers (menus, dialogs, toasts) lift to `--shadow-lg/xl`. A single `--shadow-accent` Klein glow exists for the rare emphasised primary action.
- **Cards:** white surface, `1px --border-default`, `--radius-lg`, `--shadow-sm`; an `accent` variant adds a 3px Klein top-rule; an `interactive` variant lifts on hover.

**Motion**
- Quick and unfussy. `--dur-fast 120ms` (hovers/press), `--dur-base 200ms` (most), `--dur-slow 320ms` (entrances). Easing: `--ease-standard` for state, `--ease-entrance` (gentle overshoot-free ease-out) for things appearing. No bounces, no infinite decorative loops.

**Interaction states**
- **Hover:** darker Klein for primary (`klein-700`); subtle gray fill for ghost/secondary; cards gain border-strength + shadow.
- **Press:** one shade darker again (`klein-800`) + a 0.5px nudge — tactile, never a big scale.
- **Focus:** never removed — a 3px translucent Klein ring (`--ring-accent`); error fields ring red.
- **Disabled:** ~50% opacity, no pointer.

**Transparency & blur** — used sparingly: dialog backdrop is a dark-blue 42% scrim with a 6px blur; the hero scrim is a blue gradient. No frosted-glass everywhere.

---

## ICONOGRAPHY
- **Library:** **[Lucide](https://lucide.dev)** (loaded from CDN: `unpkg.com/lucide`). No custom icon font, no SVG sprite in-repo — Lucide covers the set.
- **Style:** outline, **1.75px stroke**, rounded joins/caps — matches Gilmer's geometric, rounded character.
- **Color:** neutral gray (`--gray-700`) by default; **Klein blue only to signal state or interaction** (active nav, the *Konform* check, AI/"fink" marks). Never multi-color icons.
- **Domain glyphs:** `sun` (PV), `wind` (Windkraft), `leaf` (Biogas), `shield-check` (compliant), `calendar-clock` (Fristen), `scale` (Recht), `sparkles` (fink AI), `file-text` (Berichte).
- **Emoji / unicode icons:** **never** in product UI. The only "drawn" mark is the fink logo glyph.
- Specimen: `guidelines/cards/iconography.html`.

> **Substitution flag:** Lucide is a *substitution* — no project-specific icon set was provided. If fink has bespoke icons, share them and they'll be copied into `assets/` and documented here. Likewise, **JetBrains Mono** is loaded from Google Fonts (only Gilmer binaries were provided); self-host it before production if you need offline/GDPR-safe delivery.

---

## INDEX — what's in this system

**Root**
- `styles.css` — the single entry point consumers link (only `@import`s).
- `readme.md` — this guide. `SKILL.md` — portable Agent-Skill wrapper.

**`tokens/`** — `fonts.css` (Gilmer @font-face + JetBrains Mono import) · `colors.css` (Klein scale, cool neutrals, restrained status) · `typography.css` (Gilmer + mono roles) · `spacing.css` (4px grid, radii, motion) · `elevation.css` (cool shadows) · `base.css` (resets, utility text roles).

**`assets/`** — `fonts/Gilmer-*.otf` (6 cuts) · `logo/fink-logo.png` (primary lockup: white outline wordmark on Klein) · `logo/fink-logo.svg`, `logo/fink-wordmark-white.svg`, `logo/fink-wordmark-klein.svg` (outline wordmark, live-text — require Gilmer Outline loaded) · `media/anwaelte_mix.mp4`, `media/anwaelte_skizze.mp4` (hero footage).

**`components/`** (namespace `window.FinkDesignSystem_4f2014`)
- `forms/` — **Button, IconButton, Input, Select, Checkbox, Switch**
- `data/` — **Card, Badge, Tag, Avatar, Stat, ProgressBar**
- `feedback/` — **Banner, Tooltip, Dialog**
- `navigation/` — **Tabs**
- Each: `<Name>.jsx` + `.d.ts` + `.prompt.md`; one `*.card.html` per group (the Design System tab thumbnail).

**`ui_kits/app/`** — the **fink web app** recreation: `index.html` (interactive: login → dashboard → Anlagen → Anlagen-Detail → Fristen → fink Assistent). Screens: `Login`, `Dashboard`, `Assets`, `AssetDetail`, `Deadlines`, `Reports` (AI), composed from the components above; `shell.jsx` (sidebar/topbar), `data.js` (fictional EEG portfolio), `app.css` (kit chrome).

**`guidelines/cards/`** — foundation specimens for the Design System tab: Type (display/body/weights/mono), Colors (Klein/neutrals/status/semantic), Spacing (scale/radii/elevation), Brand (logo/Klein statement/voice/iconography).

**Starting points** — *fink Web App* (full screen) and *Button* / *Card* (components) are tagged as seeds for consuming projects.
