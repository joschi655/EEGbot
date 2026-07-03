# fink — project notes

## Brand blue (standard)
The standard "blue" for fink is **ultramarine `#1213BE`** (the tone used on the login page's left panel). Whenever the user says something "should be blue" — buttons, text, accents, marks — use `#1213BE` unless they specify otherwise. It is wired as the design-system token `--klein-600` (with `--klein-700: #0E0F96` for hover, `--klein-800: #0A0B70` for press), so prefer `var(--klein-600)` / `var(--color-accent)` in new work.

## Logo
The fink logo is the lowercase **"fink" wordmark in Gilmer Outline**. Display/hero uses the outline cut (white outline on blue, or blue outline on white); small chrome uses the solid Gilmer Heavy wordmark. No icon/glyph mark.

## Hand-drawn loop motif
Menu items / secondary links use a hand-drawn SVG "loop" that appears on hover (see `ui_kits/app/app.css`). Keep looped elements roughly text-width so the oval stays clean — stretching it across a full-width button flattens it. Each landing-menu loop is subtly varied (different scribble) rather than identical.
