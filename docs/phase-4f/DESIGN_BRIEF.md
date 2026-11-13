# Phase 4F design brief: AmpliLoan polish

Source: Erin, 6:59 PM ET Nov 12, 2026. Research date Nov 12, 2026. Spec only; no rendered page was inspected. Companion file: `IMAGE_PROMPTS.md`.

## 1. What the category does (research)

Reviewed public pages for Upstart, SoFi, LendingClub and Best Egg personal loans. Patterns shared by all four, to follow in spirit (never copy wording, layout, or assets):

- **Hero:** benefit-led headline, one primary CTA ("Check your rate" / "View your rate"), and a soft-credit-check reassurance directly under the CTA. Upstart adds speed ("check in 5 minutes", funds next business day). SoFi leads with the CTA and "no impact to your credit score".
- **Stat strip:** loan range, speed, fixed rates, no prepayment fees (Upstart $1k-$75k; SoFi $5k-$100k; LendingClub up to $60k).
- **Three-step explainer:** check rate, choose offer, get funds. Every site uses exactly this shape.
- **Use-case cards:** debt consolidation, home improvement, medical, major purchase, moving. Short outcome line each.
- **Payment estimator:** amount and term sliders with an illustrative monthly payment (Upstart, Best Egg).
- **Trust:** rating badges, review counts, member counts ("over 5 million members"), customer quote with a "representative image" footnote.
- **Fine print everywhere:** footnotes, APR range, fee disclosure.
- **FAQ and repeated CTA** after each major section.

AmpliLoan twist: one journey for personal, home, and small business, so the use-case area doubles as the loan-type chooser (all three lead to the same flow, `loan_type` pre-selected only as contextual copy; if the Builder cannot preselect without changing behavior, cards link to the plain Apply page).

Illustrative only: no ratings, member counts, testimonials, badges, award claims, or real rates. Every number is labeled "illustrative" or "demo".

## 2. Brand direction (original)

- **Name feel:** warm, optimistic, modern fintech; "a clearer path" (existing headline fallback).
- **Palette:** deep indigo `#1F1B5A` (text, nav, footer), electric violet `#5B4BFF` (primary), mint `#2EE6A6` (success, accents), warm coral `#FF7A6B` (highlights, sparingly), soft lavender wash `#F4F2FF` (section bg), white `#FFFFFF`, slate `#5A5F7A` (secondary text). Check AA contrast; mint only on indigo or as a fill with indigo text.
- **Type:** headings a geometric sans (system fallback `Inter, "SF Pro Display", system-ui`); sizes 56/40/28/20 px desktop, 38/30/24/18 mobile; body 17-18 px, line-height 1.55; numerals tabular in estimators and offers.
- **Shape and depth:** 16 px card radius, 999 px pills and buttons, soft shadow `0 12px 32px rgba(31,27,90,.10)`, 1 px border `#E3E0F7`.
- **Motion:** 200-400 ms ease-out fades and rises on scroll; hero chart line draws in over 1.2 s; floating orbs drift slowly. `prefers-reduced-motion`: no drift, no draw-in, static final state.
- **Layout:** max content width 1160 px, 8 px spacing scale, section padding 96 px desktop / 56 px mobile, breakpoints 640 / 1024.
- **Imagery style:** flat-to-soft-3D illustration, people shown from an optimistic everyday angle, no stock-photo cliches, no logos, no text inside images (copy stays live text for accessibility and Statsig parameters).

## 3. Home (landing page)

Order, with literal copy. Hero headline and CTA label stay Statsig parameters (`hero_headline`, `cta_label`); copy below is the fallback shown in the sections that are not parameter-driven.

1. **Header:** wordmark "AmpliLoan", links Rates, How it works, FAQ, Help (opens the existing help panel), button "Sign in" (existing behavior). Sticky on scroll with CTA appearing after the hero leaves view.
2. **Hero:** headline (parameter), lede "See illustrative options in about two minutes. One simple journey for personal, home, and small business loans.", CTA (parameter), reassurance "Demo only. No real credit check." Right side: hero illustration (image 1) with a floating "Example offer" card (amount $18,500, 36 months, $573/mo, "Illustrative").
3. **Stat strip (4 items):** "$1k to $75k, illustrative range", "About 2 min, to see options", "Fixed monthly payments", "No prepayment fees, in this demo". 
4. **How it works (3 steps):** 1 Tell us what you need, 2 Compare your options, 3 Choose and track it. One line each, icons (image 3). CTA repeats below.
5. **What's it for (use-case cards, 6):** Consolidate debt, Home improvement, Medical expenses, Major purchase, Move or relocate, Grow your small business. Each: icon (image 4 set), one outcome line, link "Get started".
6. **Payment estimator:** amount slider $1,000-$75,000 (default $18,500), term 12/24/36/48/60, shows estimated payment using a fixed demo APR 9.9% labeled "Illustrative". Pure client-side; fires no events and reads no Statsig value. Disclaimer under it.
7. **Why AmpliLoan (3 cards):** "Transparent by default" (all costs shown upfront), "Built around you" (one journey, your details), "Stay in the loop" (dashboard tracks next steps).
8. **Trust band:** "Your information stays private in this demo", "Synthetic data only", "Secure by design". No badges or ratings. A fictional customer quote may appear only if labeled "Illustrative quote, fictional customer".
9. **FAQ (6, accordion):** Is this a real loan? (No, demo.) Will checking affect my credit? (Demo: no checks.) How long does it take? How are offers shown? Can I save and return? Which loan types? Keyboard-operable accordion; no events.
10. **Final CTA band** (indigo, image 5 backdrop) repeating the CTA, then **footer** with demo disclaimer, links, copyright.

## 4. Apply

- **Shell:** two columns on desktop: form card (left, max 640 px) and a sticky summary rail (right): "Your request" with amount, purpose, and a progress description; mobile stacks, rail collapses to a summary bar.
- **Progress:** keep the `progress_style` parameter (`steps` default) behavior; polish only (numbered pills with mint completed state, connecting line).
- **Form polish:** larger inputs (48 px), floating-label feel without hiding labels, inline validation in coral with clear text, helper text in slate, currency and phone masks only if already present, visible focus ring (3 px violet at 40 percent).
- **Reassurance and help hint:** keep both elements and their gating exactly (`show_reassurance`, `ampliloan_contextual_help`). Style the slot (rounded mint-tint card with icon) but do not render it unless the parameter or gate says so.
- **Illustration:** small friendly header image (image 6) above the first step; none on later steps to keep forms fast.
- **States:** saved confirmation toast ("Draft saved. Pick up anytime."), loading skeleton on submit, error summary at top with anchor links.

## 5. Offers

- **Header:** "Your illustrative options" with sub "Based on the details you shared. Demo data, not a real offer."
- **Offer cards (3):** best-fit card visually emphasized (violet border, "Best fit" mint pill). Each: amount, term, estimated monthly payment (large tabular numerals), APR labeled illustrative, total cost line, primary button "Choose this option". Keep existing selection behavior and event.
- **Comparison hint:** keep `show_comparison_hint` gating; style as a light callout that highlights differences between cards.
- **Side details:** "What happens next" 3-step mini timeline (image 7) and a collapsible "How we calculated this".
- **Footer note:** illustrative disclosure.

## 6. Dashboard

- **Top:** greeting "Welcome back, <first name>" (existing data only), status badge (Draft, Submitted, Offer chosen) in matching colors.
- **Summary card row:** amount, term, estimated payment, status; icons per card.
- **Status timeline:** vertical stepper (Application, Review, Offer, Next steps) with mint check for done, violet ring for current.
- **Next steps:** keep `show_next_steps` gating; checklist cards with mock tasks and a progress ring. Actions by status stay as built (resume draft, view details, complete tasks, get help, give feedback).
- **Empty state:** friendly illustration (image 8) and "Start your first application" CTA.

## 7. Help

Help is currently a slide-over panel (`HelpPanel`), not a page. Polish it as a branded slide-over; do not add a route (no journey change).

- **Panel:** 420 px wide desktop, full width mobile, indigo header "How can we help?" with close button, focus trap, Esc to close, returns focus on close.
- **Content:** search-style field (visual only, no new events), 4 quick-topic chips, 5 accordion answers, a "Contact us" card that is clearly a demo placeholder, and illustration (image 9).
- Keep existing `helpRequested` events and triggers untouched.

## 8. Global

- Footer on every page; consistent header; skip link; focus-visible styles; 44 px minimum targets.
- Presenter page unchanged visually except tokens; stays outside the borrower flow.
- Images: WebP/SVG, under 150 KB each where possible, `alt` text provided in `IMAGE_PROMPTS.md`; decorative images use `alt=""`. Save to `public/images/` with the listed filenames; use width/height attributes to avoid layout shift. Until the real images exist, the Builder ships CSS/SVG placeholders at the same aspect ratios so nothing breaks.

## 9. Acceptance criteria

1. Home has all ten sections in order, CTA visible on first screen at 375 and 1280 px.
2. Hero headline and CTA label still come from Statsig parameters or fallbacks.
3. No new events; event sequence for all three loan types identical to `main`.
4. `show_reassurance` off by default and nothing static duplicates it; `show_next_steps`, `show_comparison_hint`, `progress_style`, and the help gate behave as before.
5. Estimator and FAQ are client-only and silent.
6. Apply, Offers, Dashboard, and the Help panel use the tokens above and pass keyboard and contrast checks.
7. Every number or claim is labeled illustrative or demo; no ratings, badges, or real rates.
8. Reduced-motion verified.

## 10. Unresolved (Erin)

- Palette and wordmark: accept indigo/violet/mint, or supply preferences.
- Use real generated images, or ship placeholders first.
- Include the fictional customer quote, or leave it out.
