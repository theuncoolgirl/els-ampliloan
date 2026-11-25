# Image prompts for AmpliLoan (feed to any image generator)

Shared style block (prepend to every prompt):
"Modern fintech marketing illustration, soft 3D-flat hybrid, clean geometric shapes, gentle gradients, soft shadows, optimistic and warm mood, palette limited to deep indigo #1F1B5A, electric violet #5B4BFF, mint #2EE6A6, warm coral #FF7A6B, lavender #F4F2FF and white, lots of negative space, diverse everyday people with natural proportions, no text, no letters, no numbers, no logos, no watermarks, no brand marks, no stock-photo look."

Negative prompt: "text, captions, UI screenshots with readable words, logos, trademarks, distorted hands, extra fingers, photorealistic faces, clutter, dark gloomy mood, neon overload, currency symbols."

Output: PNG at 2x size below, then export WebP quality 82 at 1x. Transparent background where noted. Save under `public/images/`.

| # | File | Use | Aspect, size (2x) | Background |
|---|---|---|---|---|
| 1 | hero.webp | Home hero, right side | 5:4, 1600x1280 | lavender gradient, soft edge |
| 2 | hero-card-glow.webp | Glow behind floating offer card | 1:1, 800x800 | transparent |
| 3 | step-1/2/3.webp | How it works icons | 1:1, 640x640 each | transparent |
| 4 | use-*.webp (6) | Use-case cards | 4:3, 800x600 each | lavender |
| 5 | cta-band.webp | Final CTA backdrop | 21:9, 2400x1030 | indigo |
| 6 | apply-header.webp | Apply step 1 header | 3:1, 1200x400 | transparent |
| 7 | offers-timeline.webp | Offers "what next" | 1:1, 600x600 | transparent |
| 8 | dashboard-empty.webp | Dashboard empty state | 4:3, 960x720 | transparent |
| 9 | help-header.webp | Help panel header | 16:9, 840x472 | indigo |
| 10 | og-image.png | Social share preview | 1.91:1, 1200x630 | indigo-violet gradient |

## 1. hero.webp
Prompt: "[style block] A confident adult in casual clothes standing on a gently curved path made of rising stepping-stone platforms that climb diagonally to the upper right toward a glowing mint sun-like orb; beside them a stylized upward line chart drawn as a ribbon of violet light; floating translucent rounded cards (empty, no text) and small coral and mint orbs drifting around; soft lavender gradient sky; composition leaves the lower-left quarter calm. Wide 5:4 framing."
Alt: "" (decorative; headline carries meaning).

## 2. hero-card-glow.webp
"[style block] Soft radial glow in violet and mint, blurred circular shapes overlapping, centered, fades to fully transparent edges, no objects."

## 3. step icons (three images, consistent set)
- step-1: "[style block] Isometric friendly clipboard with a pencil and a mint checkmark badge, centered, transparent background."
- step-2: "[style block] Three overlapping rounded cards fanned out like options, the middle one slightly raised with a violet outline and a small star, centered, transparent background."
- step-3: "[style block] A mint rounded dashboard tile with a progress ring and a small rocket-like paper plane, centered, transparent background."
Alt: "" (decorative, step title is live text).

## 4. use-case set (six, identical framing, subject centered with margin)
- use-debt: "[style block] Several small tangled strands of coral and violet ribbon merging into one smooth mint ribbon, lavender background."
- use-home: "[style block] A cozy small house with a paintbrush and a toolbox, warm window glow, lavender background."
- use-medical: "[style block] A gentle heart shape with a soft cross made of mint shapes, calm and reassuring, no clinical equipment, lavender background."
- use-purchase: "[style block] A sleek laptop and a wrapped gift box with a violet ribbon, lavender background."
- use-move: "[style block] A stack of moving boxes with a small plant and a route line leading to a new front door, lavender background."
- use-business: "[style block] A small shop storefront with an awning in violet and coral, a tiny open sign shape without text, and a growing plant on the counter, lavender background."
Alt: "" (decorative).

## 5. cta-band.webp
"[style block] Wide abstract banner on deep indigo: sweeping violet and mint light arcs rising from bottom left to right, scattered small orbs, large calm empty area on the left half for overlaid text. 21:9."
Alt: "".

## 6. apply-header.webp
"[style block] Wide strip: a friendly person at a desk with a laptop and a coffee, a few floating form-field shapes and checkmarks in mint, simple background, subject on the right third, left two-thirds mostly empty. 3:1."
Alt: "".

## 7. offers-timeline.webp
"[style block] Three connected circular nodes along a curved dotted path (document, handshake-like check, wallet), mint highlighted first node, transparent background."
Alt: "".

## 8. dashboard-empty.webp
"[style block] A person gently pointing at an empty rounded dashboard board with a small plant and a bookmark, calm encouraging mood, transparent background."
Alt: "No applications yet".

## 9. help-header.webp
"[style block] Friendly abstract speech bubbles in violet and mint with simple smile and question-mark shapes drawn as glyph-free icons (no letters), on deep indigo, centered with margin. 16:9."
Alt: "".

## 10. og-image.png
"[style block] Centered hero-style composition: rising stepping-stone path and glowing mint orb on an indigo to violet gradient, large empty area at left for text added later in a design tool. 1200x630."

## Consistency checks before adding to the repo
- Same lighting direction (top-left), same line weight and corner radius across sets.
- No readable text or digits inside any image.
- Check at mobile crop: subject stays inside the central 60 percent.
- Keep seed and settings for reruns; note the tool and prompt version in `docs/phase-4f/images/README.md`.
