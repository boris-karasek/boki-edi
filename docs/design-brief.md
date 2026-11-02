# Design brief: page background

Boki-Edi (boki-edi.com) is a one-person workshop in Dobanovci, Belgrade, that has made small metal hardware since 2007. Its customers are other businesses: calendar printers and makers of folders, binders, planners and snap frames. The site is a single scrolling page: header, headline (hero), benefits, products, contact, footer.

This brief describes the current design as built, so that changes to the page background fit it. All values were taken from the code and measured in headless Chrome on the built site (November 2026, branch `reorganisation`).

> **Status, 2 November 2026:** the brushed-steel background (variant 1 in section 8) was chosen and is now the page background. The other variants and the temporary switcher were removed. Sections 1, 5 and 6 describe it. An image background is not planned; the prepared image option was removed (section 7).

Contents:

1. Color palette
2. Fonts
3. Layout and measurements
4. Where the background is visible
5. Current background CSS
6. Screenshots
7. No image background
8. CSS-only alternatives compared (variant 1 chosen)
9. How to change the background later

---

## 1. Color palette

The site uses Tailwind's default colors. The hex values below are the ones those classes produce.

### Dominant colors

| | Color | Hex | Where |
|---|---|---|---|
| ★1 | Light steel gray (page background) | `#f1f4f7` → `#e8ecf0` → `#e3e8ed` | Everything behind the content; the largest area. Brushed-steel streaks and a soft light from the top left |
| ★2 | Stone 900 (warm near-black) | `#1c1917` | Header (90 % opacity), product cards, left end of the benefits panel, headline gradient |
| ★3 | Teal 900 / 800 (dark teal) | `#134e4a` / `#115e59` | Benefits panel, headline and section-title gradient |
| ★4 | Cyan 700 (petrol blue) | `#0e7490` | Menu buttons, product-group chips, "Pošaljite upit" buttons, middle of the products panel |
| ★5 | Teal 700 / 500 | `#0f766e` / `#14b8a6` | Contact panel, main call-to-action button |

The product photos add a neutral mid-gray: the card image box is `#c4c4c4`, and photo backgrounds range from `#a6a6a6` to `#d4d4d4`.

### All colors by area

| Area | Element | Color(s) |
|---|---|---|
| **Page background** | `.background-div` | gradient `#f1f4f7` (top) → `#e8ecf0` (at 700 px) → `#e3e8ed` (from 1400 px down, also the fallback); horizontal streaks in dark blue-gray `#1a242e` at up to 9 % opacity; white light at up to 70 % from the top left |
| **Header** (fixed) | bar | `#1c1917` (stone 900) at 90 % opacity; browser theme color `#1c1917` |
| | logo "BOKI-EDI" | `#fafaf9` (stone 50); hover `#22d3ee` (cyan 400) |
| | menu buttons | `#0e7490` (cyan 700) with white text; active and hover `#d6d3d1` (stone 300) with black text |
| | mobile menu button | border `#0e7490`, icon `#f5f5f4` (stone 100) |
| **Hero** | h1 "Metalni delovi po meri" | gradient text `#134e4a` (teal 900) → `#1c1917` (stone 900) |
| | h1 underline | `#2dd4bf` (teal 400) → `#164e63` (cyan 900) |
| | paragraph | `#44403c` (stone 700) |
| | button "Pogledajte proizvode" | 2 px border and text `#164e63` (cyan 900); hover: fill `#164e63`, text `#f5f5f4` |
| | button "Pošaljite upit" | gradient `#14b8a6` (teal 500) → `#164e63` (cyan 900), text `#f5f5f4` |
| **Benefits panel** | panel | gradient `#1c1917` (left) → `#115e59` → `#134e4a` (right) |
| | icons | `#5eead4` (teal 300) |
| | titles / text | `#fafaf9` / `#d6d3d1` |
| **Section titles** | h2 "Proizvodi", "Kontakt" | gradient text `#1c1917` → `#134e4a`, uppercase |
| **Products** | note under the title | `#44403c` (stone 700) |
| | group chips | `#0e7490` with white text; hover `#d6d3d1` with black text |
| | panel | gradient `#292524` (stone 800, left) → `#0e7490` (cyan 700) → **transparent** (right) |
| | group titles (h3) | `#fafaf9` with a drop shadow |
| | product card | `#1c1917`, border `#292524`, image box `#c4c4c4`, name white, description `#d6d3d1` |
| | card button | `#0e7490` with white text |
| | service card (no photo) | gradient `#115e59` → `#1c1917`, icon `#5eead4` |
| **Contact** | panel | gradient `#0f766e` (teal 700) → `#14b8a6` (teal 500) → **transparent** (right) |
| | cards | white at 90 % opacity; inner boxes white with border `#e5e7eb` (gray 200) |
| | headings / labels / text | `#374151` (gray 700) / `#1f2937` (gray 800) / `#4b5563` (gray 600) |
| | icons | `#06b6d4` (cyan 500); link hover `#0e7490` |
| | form fields | `#f3f4f6` (gray 100), border `#d1d5db` (gray 300), placeholder `#9ca3af` (gray 400), focus ring `#22d3ee` |
| | send button | `#06b6d4`; hover `#0891b2` (cyan 600) |
| | messages | sent `#15803d` (green 700), error `#b91c1c` (red 700) |
| | map placeholder | `#e7e5e4` (stone 200), link `#155e75` (cyan 800) |
| **Footer** | bar / text | `#111827` (gray 900) / white |
| **Photo viewer** | overlay / caption | black at 80 % / black at 60 %, text white and `#e7e5e4` |
| **404 page** | panel | `#111827`, text `#e5e7eb` / `#d1d5db`; "404" in `#ef4444` (red 500); button `#0891b2`, hover `#155e75` |

Character of the palette: cool light gray-blue (the background) against warm near-black (stone) panels, with teal and petrol-blue accents. There is no warm accent color.

---

## 2. Fonts

There is no web font. The site uses the system font stack (Tailwind `font-sans`): `ui-sans-serif, system-ui, sans-serif` plus emoji fonts. Visitors therefore see:

- Segoe UI on Windows
- San Francisco on macOS and iOS
- Roboto on Android
- Noto Sans on the Linux machine that took the screenshots

| Element | Desktop (≥ 768 px) | Mobile | Weight | Line height |
|---|---|---|---|---|
| Logo | 30 px | 30 px | 700 | 36 px |
| h1 (hero) | 60 px | 36 px | 800 (extrabold), tight tracking | 60 px / 45 px |
| Hero paragraph | 20 px | 18 px | 400 | 28 px / 29 px |
| Hero buttons | 18 px | 18 px | 600 | 28 px |
| h2 (section titles) | 36 px, uppercase | 36 px | 700 | 45 px |
| h3 (product groups) | 20 px | 18 px | 700 | 28 px |
| h3 (benefits) | 16 px | 14 px | 600 | 24 px / 19 px |
| h4 (product names) | 14 px | 14 px | 600 | 19 px |
| Body text | 16 px | 16 px | 400 | 24 px |
| Product and benefit descriptions | 14 px | 12 px | 400 | 20 px / 16.5 px |

---

## 3. Layout and measurements

| | Value |
|---|---|
| Header | Fixed. 72 px high from 1024 px wide upward, 80 px below that. Content starts 80 px from the top. |
| Content width | 1152 px max (`max-w-6xl`) for benefits, products and contact, with 24 px inner padding (16 px on phones). The panels are therefore 1104 px wide on desktop. |
| Hero text column | 768 px max (`max-w-3xl`), centered |
| Background beside the panels | 408 px per side at 1920; 131 px at 1366; 16 px at 390 |
| Section padding | Hero 64 px top (48 px on mobile) and 24 px bottom; benefits 24 px top and bottom; products and contact 32 px top and bottom; 20 px gap above the footer |
| Benefits panel | 1104 × 140 px desktop; 358 × 293 px on a phone (2 × 2) |
| Product card | 254 × 307 px on desktop, 4 per row, 16 px gap, photo 250 × 188 (4:3). On a phone 161 × 249 px, 2 per row, 12 px gap, photo 157 × 118. |
| Products panel | 1104 × 1490 px desktop; 358 × 1955 px phone |
| Contact panel | 1104 × 568 px desktop (three columns); 358 × 1292 px phone (stacked) |
| Footer | 52 px |

### Total page height

| Screen | Page height | Screens to scroll |
|---|---|---|
| 1920 × 1080 | 3112 px | 2.9 |
| 1366 × 768 | 3112 px | 4.1 |
| 390 × 844 | 4718 px | 5.6 |

Desktop height is the same at 1920 and 1366 because the content width is capped at 1152 px. The height grows whenever products are added.

### Vertical map (page y, in CSS px)

| Block | Desktop (1366 and 1920) | Phone (390) |
|---|---|---|
| Header | 0–72 | 0–80 |
| Hero (full width) | 80–468: h1 144–204, paragraph 244–356, buttons 388–444 | 80–672: h1 128–218, paragraph 258–492, buttons 524–648 |
| Benefits panel | 492–632 | 696–989 |
| "PROIZVODI" title / note / chips | 688–733 / 741–765 / 777–805 | 1045–1090 / 1098–1146 / 1158–1222 |
| Products panel | 821–2311 | 1238–3193 |
| "KONTAKT" title | 2375–2420 | 3257–3302 |
| Contact panel | 2440–3008 | 3322–4614 |
| Footer | 3060–3112 | 4666–4718 |

### First screen

- **1920 × 1080:** header, hero, benefits, products title and the top of the first row of cards.
- **1366 × 768:** header, hero, benefits, and the products title and note (cut off at the bottom edge).
- **390 × 844:** header, hero, and the top of the benefits panel.

---

## 4. Where the background is visible

1. **Behind the hero, across the full width.** This is the largest visible area, 388 px high on desktop and 592 px on a phone. **Text sits directly on the background here:**
   - the h1
   - the paragraph
   - the outlined "Pogledajte proizvode" button (text and border)
2. **Behind the section titles.** **Text sits directly on the background here too:**
   - "PROIZVODI" and the note below it
   - "KONTAKT"
   - the group chips, which have their own fill
3. **Between the sections:** about 24–60 px gaps (468–492, 632–688, 805–821, 2311–2375 and 3008–3060 on desktop).
4. **Side strips along the whole page:** 408 px per side at 1920, 131 px at 1366, and only 16 px on a phone.
5. **Through the transparent right ends of two panels:**
   - The products panel fades to transparent towards the right, so the background shows behind the 4th column of cards and in the empty right part of rows with 2–3 cards.
   - The contact panel fades the same way, behind the map card.
6. **Faintly through the header** (90 % opaque) and the white contact cards (90 % opaque).
7. **On the 404 page,** around the centered dark panel.

The background does not show behind the product cards, the benefits panel, the left parts of the products and contact panels, or the footer.

---

## 5. Current background CSS

The brushed-steel background, chosen on 2 November 2026. From `src/index.css`:

```css
.background-div {
  background-color: #e3e8ed;
  background-image:
    url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300'><filter id='b' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.003 .7' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .1  0 0 0 0 .14  0 0 0 0 .18  0 0 -1.4 0 .72'/></filter><rect width='100%' height='100%' filter='url(%23b)' opacity='.13'/></svg>"),
    radial-gradient(ellipse 70% 650px at 25% 0, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 100%),
    linear-gradient(180deg, #f1f4f7 0, #e8ecf0 700px, #e3e8ed 1400px);
  background-repeat: repeat, no-repeat, no-repeat;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}
```

`.background-div` wraps the whole page (`src/pages/RootLayout.jsx`). The three layers, top to bottom:

1. **Streaks.** A 600 × 300 px SVG noise tile, stretched sideways into fine horizontal lines. The tile repeats without visible seams. It also breaks up the gradient, so no banding shows.
2. **Light.** A soft white glow from the top left, 650 px high.
3. **Gradient.** Gray-blue, settling at `#e3e8ed` 1400 px from the top. Because the stops are in pixels rather than percentages, the top of the page looks the same on every screen and doesn't change when products are added.

Measured colors behind the text: `#eaedf0`–`#f8fafb` behind the hero text, and `#d9dfe4`–`#e3e8ed` behind "KONTAKT". Contrast is 7.1:1 or better everywhere (section 8).

**The previous background** (until 2 November 2026) was:

```css
background-color: #e2e8f0;
background-image: linear-gradient(160deg, #f8fafc 0%, #e2e8f0 45%, #cbd5e1 100%);
```

It was stretched over the full page height (3112 px desktop, 4718 px phone). As a result:

- the hero sat in its lightest part and "KONTAKT" in a darker part (`#d6dee8`)
- the colors shifted whenever the page height changed
- faint banding could show on some screens

---

## 6. Screenshots

The screenshots are in `docs/screenshots/`. They come from the built site in headless Chrome at device pixel ratio 1, so 1 image pixel = 1 CSS pixel. The font is Noto Sans, the Linux system font. The Google map is blank in full-page captures (headless Chrome does not draw that iframe); on the real site it shows.

| File | What |
|---|---|
| `first-screen-1920x1080.png` | First screen, full-HD desktop |
| `first-screen-1366x768.png` | First screen, common laptop |
| `first-screen-390x844.png` | First screen, phone (iPhone 12–15 size) |
| `full-page-1366x768.jpg` | Whole page at 1366 wide (1366 × 3112) |
| `full-page-390x844.jpg` | Whole page on a phone (390 × 4718) |

The screenshots show the brushed-steel background. To retake them after a change, run `npm run build`, then `npm run screenshots`.

The comparison screenshots of all five backgrounds were removed together with the switcher. They are still in git history: folder `docs/screenshots/variants/` in commit `179bed0`.

---

## 7. No image background

The page background is CSS only (the brushed steel), with no image. An image behind the top of the page had been prepared and left switched off. It was removed on 2 November 2026 (Session 3), together with its helper script, because no AI image is planned. Reasons for CSS:

- below the hero, the background shows only in side strips (16 px on a phone), so an image would be mostly hidden
- the page grows with every product
- iOS Safari ignores `background-attachment: fixed`
- the brushed steel costs under 1 KB

**To bring the image option back,** restore it from git history:

- the CSS (`.page-bg-image` in `src/index.css`) and `scripts/make-backgrounds.mjs`: commit `ca1c42e`
- the image specification, safe zones and AI prompts (former sections 7–9 of this brief): commit `e063139`

---

## 8. CSS-only alternatives compared (variant 1 chosen)

These four backgrounds use no images. Their colors come from the palette above, and each costs under 1 KB. They were compared in the browser with a temporary `?bg=` switcher.

**Variant 1 (brushed steel) was chosen on 2 November 2026** and moved into `src/index.css`. The switcher and the other variants were then removed. They are still in git history:

- the CSS: `dev/background-variants.css` in commit `fe9a354`
- the screenshots: commit `179bed0`

| # | Name | What it is |
|---|---|---|
| 0 | Previous | The old gradient (section 5) |
| 1 | **Brushed steel (chosen)** | A narrower, softer gray-blue range (`#f1f4f7` → `#e3e8ed`) with fine horizontal "brushed" streaks (SVG noise, which also hides banding) and a soft light from the top left |
| 2 | Steel blue | Soft steel blue at the top (`#d4e0e9`) fading to light gray (`#eceff1`) within the first 1600 px, with a very fine grain |
| 3 | Technical drawing | Light surface `#f1f5f7` with a faint 24 px grid and a stronger line every 120 px, in the buttons' dark cyan. A light wash keeps the hero text calm. |
| 4 | Plain + band | Plain `#f5f6f7`; the products section sits on a slightly darker full-width band `#eaedf0` with hairlines at its edges |

In variants 1 and 2 the color shift happens within the first 1400–1600 px rather than over the whole page, so the top of the page looks the same on every screen.

### Contrast check (WCAG)

The background was sampled from screenshots in text-free strips right next to each text, at both 1366 and 390 wide. The textures, noise and grid lines are included in the samples. Each figure is the contrast against the **darkest** sampled pixel, and the lower of the two widths. The gradient headings are counted with their lighter end (`#134e4a`).

| Variant | h1 (needs 3:1) | Hero paragraph (4.5:1) | Outlined button (4.5:1) | "PROIZVODI" (3:1) | Products note (4.5:1) | "KONTAKT" (3:1) |
|---|---|---|---|---|---|---|
| 0 Previous | 8.7 | 9.3 | 8.2 | 8.1 | 9.0 | 7.0 |
| **1 Brushed steel (chosen)** | 8.2 | 8.5 | 7.4 | 7.3 | 8.0 | 7.1 |
| 2 Steel blue | 7.1 | 7.9 | 7.0 | 7.2 | 7.9 | 7.8 |
| 3 Technical drawing | 7.5 | 8.0 | 7.3 | 5.7 ¹ | 7.0 | 5.7 ¹ |
| 4 Plain + band | 8.8 | 9.5 | 8.4 | 8.1 | 8.7 | 8.8 |

¹ Measured on the spot where two strong grid lines cross; on the plain surface between the lines the title has 8:1 or better.

**All variants pass WCAG AA everywhere, and AAA (7:1) for normal text.** Variant 4 adds no horizontal scrolling: its full-width band is drawn with `border-image` and does not widen the page.

### Decision

**Variant 1, brushed steel** (2 November 2026).

---

## 9. How to change the background later

### Adjust the brushed steel

The rules are in `.background-div` in `src/index.css`:

- **Streak strength:** `opacity='.13'` inside the SVG. Lower is calmer.
- **Light from the top left:** the `0.7` in the radial gradient.
- **Colors:** the three stops of the linear gradient.

After a change, check the contrast of the text that sits directly on the background (the hero and the section titles), then retake the screenshots (`npm run build`, then `npm run screenshots`).

**Contrast limits.** The text on the background is:

- `#44403c`: hero paragraph and the products note, 18–20 px regular
- `#164e63`: outlined "Pogledajte proizvode" button, 18 px semibold
- `#134e4a`: h1 and section titles, large

WCAG AA needs **4.5:1** for the paragraph and the button. The most demanding color is `#164e63`.

- **Minimum:** nothing behind this text darker than about **`#b8b8b8`** (relative luminance 0.48).
- **Target:** about **`#e3e3e3` or lighter** (7:1 or better), as the brushed steel is now (`#eaedf0`–`#f8fafb` behind the hero text).
- Tinted colors count by their lightness. Light steel blue `#dfe7ed` is fine; mid gray `#a0a0a0` is not.

Section 8 has the measured contrast of the current background.
