# Personal Vocab Loop — visual thesis

## Direction: a private memory terminal

The product is a compact **pixel/demoscene language lab**: a midnight terminal where
each phrase becomes a small, luminous signal that returns on its own schedule. This
fits a tool for private practice rather than a course: it feels authored, a little
playful, and deliberately free of achievement mechanics. The main visual metaphor is
an orbital loop around a personal “voice crystal”; recall is a signal check, not a
scoreboard.

## Tokens

- **Night ink** `#101427`: page background; **deep panel** `#1a2140`; **panel edge**
  `#38456f`.
- **Signal cyan** `#71f1dc`: primary actions and active state; its text pairing is
  night ink. **Solar yellow** `#ffd56a`: review / attention; **coral pulse**
  `#ff8c9d`: destructive state. **Cloud** `#f5f4ff` and **lavender ash** `#c9c8dd`
  are the primary and muted text colours.
- A light treatment uses `#f5f4ff` canvas, `#ffffff` surfaces, `#252845` text and
  `#006e67` signal. The theme can follow the device or be changed in Settings.

## Type, spacing, interaction

System sans (`Inter`-like system UI stack) carries readable prompts and controls;
the system monospace stack is used for timing, tags, labels, and wordmarks. This
avoids a network font dependency. The 4px rhythm, with 8/12/16/24/32/48px steps,
keeps dense review information easy to scan. Large responsive title text is 32–44px;
body copy remains 16px+.

Independent phrases are dark “signal cards” with a stepped pixel corner treatment,
but capture and review have an open canvas to make the current task dominant. Buttons
use clear verbs, always have 44px targets, and never encode status by colour alone.
Keyboard shortcuts: `N` for a new phrase from the library and `Space` reveals a
review answer where it does not type into a field.

## Motion

The hero's orbital dotted line has a low-key 10-second drift and the active review
card rises in 180ms. Motion explains return and focus, never progress or urgency.
With `prefers-reduced-motion: reduce`, orbit animation is removed and transitions
become instant; no animation loops without this fallback.

## Original asset plan and provenance

`assets/src/voice-orbit.png` is an original generated illustration used in the empty
library / hero: a pixel-art voice crystal surrounded by a waveform orbital signal.
It is converted to WebP before shipping. `public/social-preview.webp` is a 1200×630
crop composed from that original on the Night ink background. Art prompt sheet: **subject**: one abstract
voice-memory crystal and audio orbit; **world/materials**: crisp 16-bit demoscene,
dark navy CRT glow, dithered pixels; **light**: cyan, yellow and coral emission;
**lens**: square orthographic game-sprite composition; **negative**: text, watermark,
logos, people, brands, UI. Generated through the factory Azure image model on
2026-08-28; original asset licensed for this product. The footer discloses this.
