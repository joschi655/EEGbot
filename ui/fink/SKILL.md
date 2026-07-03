---
name: fink-design
description: Use this skill to generate well-branded interfaces and assets for fink (an AI product for German EEG / renewable-energy compliance), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# fink — Design System

Read `readme.md` in this skill first — it is the full design guide (brand context, content/voice rules, visual foundations, iconography, and a file index). Then explore the other files.

## Quick orientation
- **Brand:** *fink* (lowercase, Gilmer Heavy). AI for **EEG compliance** (German renewables: solar/wind/biogas). Calm, precise, legal-grade. Bilingual — German for the domain, English for framing.
- **Color law:** mainly **white + fink ultramarine (`#1213BE`)** — the standard brand blue (token `--klein-600`). *Konform* = Klein blue, pending/draft = neutral gray, **red only for *Überfällig* (overdue)**. No green/amber in product surfaces. No emoji.
- **Type:** **Gilmer** (self-hosted `.otf`, weights 300–800 + Outline) for everything; **JetBrains Mono** for data/§-refs/IDs.
- **Icons:** **Lucide**, 1.75px stroke, gray by default / Klein for state.

## How to use it
- **Link** `styles.css` (the only entry point) to inherit all tokens and fonts.
- **Tokens** live in `tokens/*.css` as CSS custom properties — reference semantic aliases (`--text-primary`, `--surface-card`, `--color-accent`, `--status-overdue-fg`) over raw scales.
- **Components** are React (`components/<group>/<Name>.jsx`), exported on the runtime namespace `window.FinkDesignSystem_4f2014`. Each has a `.d.ts` (props) and `.prompt.md` (usage). Load the compiled bundle (`_ds_bundle.js`) and read components off that namespace — don't `<script src>` the `.jsx` directly.
- **UI kit** `ui_kits/app/` is a working recreation of the fink web app — the best reference for how the pieces compose into real screens.

## When invoked
If creating **visual artifacts** (slides, mocks, throwaway prototypes), copy the assets you need (fonts, logo, video) out and produce **static HTML** for the user to view. If working on **production code**, copy assets and follow the rules here to design as a fink brand expert.

If invoked with no other guidance, ask the user what they want to build, ask a few focused questions (surface, audience, German/English, which screens), then act as an expert designer who outputs HTML artifacts **or** production code as the need dictates. Always honor the white + Klein-blue color law and the third-person, Sie-formal, cited-source voice.
