# Design brief: page background

Boki-Edi (boki-edi.com) is a one-person workshop in Dobanovci, Belgrade, that has made small metal hardware since 2007. Its customers are other businesses: calendar printers and makers of folders, binders, planners and snap frames. The site is a single scrolling page: header, headline (hero), benefits, products, contact, footer.

This brief describes the current design as built, so that a new page background (CSS or an AI-generated image) fits it. All values were taken from the code and measured in headless Chrome on the built site (November 2026, branch `reorganisation`).

Contents:

1. Color palette
2. Fonts
3. Layout and measurements
4. Where the background is visible
5. Current background CSS
6. Screenshots
7. Recommendation: which kind of background
8. Image specification
9. Prompt for an image-generation AI
10. CSS-only alternatives (variants 1–4) and contrast check
11. How to switch the background later

---

## 1. Color palette

The site uses Tailwind's default colors. The hex values below are the ones those classes produce.

### Dominant colors

| | Color | Hex | Where |
|---|---|---|---|
| ★1 | Light slate (page background) | `#f8fafc` → `#e2e8f0` → `#cbd5e1` | Everything behind the content; the largest area |
| ★2 | Stone 900 (warm near-black) | `#1c1917` | Header (90 % opacity), product cards, left end of the benefits panel, headline gradient |
| ★3 | Teal 900 / 800 (dark teal) | `#134e4a` / `#115e59` | Benefits panel, headline and section-title gradient |
| ★4 | Cyan 700 (petrol blue) | `#0e7490` | Menu buttons, product-group chips, "Pošaljite upit" buttons, middle of the products panel |
| ★5 | Teal 700 / 500 | `#0f766e` / `#14b8a6` | Contact panel, main call-to-action button |

The product photos add a neutral mid-gray: the card image box is `#c4c4c4`, and photo backgrounds range from `#a6a6a6` to `#d4d4d4`.

### All colors by area

| Area | Element | Color(s) |
|---|---|---|
| **Page background** | `.background-div` | `#f8fafc` (slate 50) → `#e2e8f0` (slate 200) → `#cbd5e1` (slate 300); fallback `#e2e8f0` |
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

From `src/index.css`:

```css
.background-div {
  background-color: #e2e8f0;
  background-image: linear-gradient(160deg, #f8fafc 0%, #e2e8f0 45%, #cbd5e1 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}
```

`.background-div` wraps the whole page (`src/pages/RootLayout.jsx`). The gradient is stretched over the full page height (3112 px desktop, 4718 px phone). As a result:

- The hero sits in its lightest part, around `#f1f4f8`–`#f6f8fb`.
- "KONTAKT" sits in a darker part, around `#d6dee8`.
- The colors at a given spot shift when the page height changes.
- A 160° gradient over several thousand pixels changes by only about one color step every 50–60 px, so faint banding can show on some screens.

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
| `variants/bg-<n>-<name>-1366x768.png`, `…-390x844.png` | First screen with each CSS variant (section 10) |

To retake them after a change, run `npm run build`, then:

- `npm run screenshots`
- `npm run screenshots -- --variants` for the variants

---

## 7. Recommendation: which kind of background

**Recommended: an image only behind the top of the page (header, hero and benefits), fading out into a calm CSS background below.**

| Approach | Verdict |
|---|---|
| **Image behind the hero, gradient or plain below** | **Recommended.** See the reasons below. |
| Seamless tileable texture for the whole page | Works at any page height and is small. However, image AIs rarely produce truly seamless tiles: seams and repeats show on large light surfaces. A quiet texture is something CSS already does in under 1 KB (variants 1 and 2). If you want a texture, choose a CSS variant instead. |
| One full-page image (fixed or stretched) | Not recommended. See below. |

**Why an image behind the hero:**

- The hero is the only place where the background is seen as a large surface: full width and 388–592 px high, about half of the first screen.
- Below the hero, the background shows only in side strips (131 px on a laptop, **16 px on a phone**) and through the panel ends. Most of a full-page image would be hidden behind panels and cards, so its bytes would be wasted.
- With a hero image, the composition is under control: the text position is known, so a calm safe zone can be left for it. The phone gets its own vertical image.
- It loads once, at the top. The text does not wait for it.
- It fades into whichever CSS background is chosen below. **The CSS choice and the image are therefore independent:** pick a CSS variant now and add the image later, or never.

**Why not one full-page image:**

- The page is 3112 px tall on desktop and 4718 px on a phone, and it grows with every new product. With `background-size: cover`, a 16:9 image would be enlarged about 2.3 times on a laptop, and much more on a phone, and cropped unpredictably. Cards and text would land on random parts of it.
- **iOS Safari ignores `background-attachment: fixed`**, the usual way to keep one screen-sized image still while the page scrolls. It falls back to a normal scrolling background, stretched over the whole page height, so the image looks huge and blurry on every iPhone and iPad. Some Android browsers also repaint fixed backgrounds on every scroll step.
- The working alternative is a fixed pseudo-element. Even with that, the image would still be mostly hidden behind the content.

---

## 8. Image specification (for the recommended approach)

### Where it is shown

| | Desktop and tablet (≥ 768 px wide) | Phone (< 768 px) |
|---|---|---|
| Area | Full width, top 720 px of the page | Full width, top 760 px |
| Scaling | `cover`, anchored at the center top | `cover`, anchored at the center top |
| Fade | Fully visible to 432 px, then fades to transparent at 720 px | Fully visible to 456 px, then fades to transparent at 760 px |

The image starts under the header and ends in a fade behind the benefits panel. Below it, the CSS background continues.

### Files to produce

| File (in `public/backgrounds/`) | Size (px) | Aspect | Used by |
|---|---|---|---|
| `top-desktop.webp` | 1920 × 720 | 8:3 | normal desktop screens |
| `top-desktop@2x.webp` | 3840 × 1440 | 8:3 | sharp ("Retina", 4K) desktop screens |
| `top-mobile.webp` | 450 × 800 | 9:16 | phones at 1× |
| `top-mobile@2x.webp` | 900 × 1600 | 9:16 | phones at 2× and 3× |

**What to generate:**

- **Desktop:** a 21:9 image, at least 3840 px wide if the tool allows; otherwise use the tool's upscaler. `npm run backgrounds` crops it to 8:3 by trimming about 6 % from the top and the bottom.
- **Phone:** a separate 9:16 image, at least 900 × 1600. Without one, the script cuts the phone files from the middle of the desktop image. That works, but gives a plainer result.

**How the crop behaves:**

- 1366-wide laptop: the middle 1366 px of the 1920 × 720 image are shown, and 277 px are cut on each side.
- 1920 screen: the whole image is shown.
- Wider screens: the image is scaled up slightly.

### Safe zones (desktop file, 1920 × 720; double the values for the 2× file)

```
 x: 0        280      536                        1384      1640      1920
 y=0   ┌────────────────────────────────────────────────────────────────┐
       │ under the dark header (0–72): nothing important                │
 72    ├────────┬────────┬───────────────────────────┬────────┬────────┤
       │ cut on │ decor  │      TEXT ZONE              │ decor  │ cut on │
       │ 1366   │ zone   │  x 536–1384, y 120–470      │ zone   │ 1366   │
       │ screens│        │  calm, light, low detail    │        │ screens│
 470   │        │        ├───────────────────────────┤        │        │
 492   │        │        │ benefits panel (dark),      │        │        │
       │        │        │ x 408–1512, y 492–632:      │        │        │
       │        │        │ hidden                      │        │        │
 632   ├────────┴────────┴───────────────────────────┴────────┴────────┤
       │ fades out from 432 to 720: no key detail                       │
 720   └────────────────────────────────────────────────────────────────┘
```

- **Text zone, x 536–1384, y 120–470:** the h1, paragraph and buttons plus a 40 px margin. It must be calm, light and low in contrast, with no lines or edges running through the text.
- **Decor zones:** x 0–536 and x 1384–1920, y 72–600. Put the main interest within x 280–536 and x 1384–1640, so it is still visible on 1366-wide screens.
- **Phone (450 × 800 file):** the text covers almost the whole width (x 24–366 on a 390 px screen) from y 128 to 648. The **whole image behind the text must be calm**. Detail is possible only at the very top (y 0–120, partly under the 80 px header) and faintly along the outer ~30 px of each side.

### Format, size and contrast

- **WebP, under 200 KB per file.** `npm run backgrounds` lowers the quality step by step (82 down to 40) until each file fits. A calm, soft image usually ends up at 30–150 KB. If the 3840 px file stays over 200 KB, the image is too busy.
- **Contrast requirements for the text zone:**
  - The text on top is:
    - `#44403c`: paragraph, 18–20 px regular
    - `#164e63`: outlined button, 18 px semibold
    - `#134e4a`: h1, large
  - WCAG AA needs **4.5:1** for the paragraph and the button. The most demanding of these colors is `#164e63`.
    - **Minimum:** nothing in the text zone darker than about **`#b8b8b8`** (relative luminance 0.48).
    - **Target:** keep the text zone at about **`#e3e3e3` or lighter** (7:1 or better), like today's background (`#eff3f7` behind the hero text, 8:1 or better).
  - Tinted colors count by their lightness. Light steel blue `#dfe7ed` is fine; mid gray `#a0a0a0` is not.
- **Check before switching on:** preview with `?bg=img` (section 11) on a laptop-size and a phone-size window.

---

## 9. Prompt for an image-generation AI

The prompts are written for tools such as Midjourney, DALL·E / ChatGPT, Imagen, Firefly or Stable Diffusion.

- Generate several images and pick the calmest; calm is better than impressive here.
- If the tool has a separate negative-prompt field, put the "Avoid" line there. Otherwise, keep it at the end of the prompt.

### Desktop (21:9)

```
Wide 21:9 background image for the top of a website of a small metalworking
workshop. A calm, very light, high-key close-up of a brushed stainless-steel
sheet seen almost straight on, with fine horizontal brushing grain and soft,
even, diffuse daylight from the upper left. Near the far left and far right
edges only, a few simple flat stamped steel strips and small bent sheet-metal
angle pieces lie on the surface, softly out of focus (shallow depth of field),
silver-gray, matte. The whole central part of the image (the middle 45 % of the
width) is empty, smooth, evenly lit, very light brushed metal with almost no
detail, reserved for dark text on top. The lower fifth fades evenly into plain
light gray. Color palette: pale cool steel gray and silver (#f1f4f7, #e2e8f0,
#cbd5e1) with a barely visible teal-blue tint in the reflections (#0e7490 at
very low intensity); no saturated colors, no warm tones. Low contrast, soft
gradients, clean, quiet, minimal, industrial, photorealistic.

Avoid: text, letters, numbers, rulers, measurements, logos, watermarks,
people, hands, faces, machines, tools, sparks, fire, welding, rust, dirt,
paper clips, staplers, pens, pins, office supplies, stationery, screws in
piles, dark areas, deep shadows, strong highlights, glare, bokeh circles,
vignette, frames, borders, saturated colors.
```

### Phone (9:16)

```
Vertical 9:16 version of the same scene: a calm, very light, high-key close-up
of brushed stainless-steel sheet with fine horizontal grain and soft diffuse
daylight from the upper left. The image is almost entirely empty, smooth,
evenly lit light metal, reserved for dark text across the whole width from 15 %
to 80 % of the height. Only in the two top corners, a hint of softly
out-of-focus flat stamped steel strips, silver-gray, matte. The lower fifth
fades evenly into plain light gray. Colors: pale cool steel gray and silver
(#f1f4f7, #e2e8f0, #cbd5e1) with a barely visible teal-blue tint; no saturated
colors, no warm tones. Low contrast, soft, quiet, minimal, photorealistic.

Avoid: (same list as for desktop)
```

**Variations worth trying:** replace "brushed stainless-steel sheet" with any of:

- "satin-finished aluminium sheet"
- "a light gray workshop workbench with a satin steel plate"
- "perforated light steel sheet, very shallow depth of field"

Keep the rest of the prompt unchanged.

---

## 10. CSS-only alternatives (variants 1–4)

These four backgrounds use no images. Their colors come from the palette above, and each costs under 1 KB. They exist only in development (`dev/background-variants.css`); the production build keeps the current background until one is chosen.

| # | Name | What it is |
|---|---|---|
| 0 | Current | The gradient from section 5 |
| 1 | Brushed steel | A narrower, softer gray-blue range (`#f1f4f7` → `#e3e8ed`) with fine horizontal "brushed" streaks (SVG noise, which also hides banding) and a soft light from the top left |
| 2 | Steel blue | Soft steel blue at the top (`#d4e0e9`) fading to light gray (`#eceff1`) within the first 1600 px, with a very fine grain |
| 3 | Technical drawing | Light surface `#f1f5f7` with a faint 24 px grid and a stronger line every 120 px, in the buttons' dark cyan. A light wash keeps the hero text calm. |
| 4 | Plain + band | Plain `#f5f6f7`; the products section sits on a slightly darker full-width band `#eaedf0` with hairlines at its edges |

In variants 1 and 2 the color shift happens within the first 1400–1600 px rather than over the whole page, so the top of the page looks the same on every screen.

Screenshots of the first screen are in `docs/screenshots/variants/`, at 1366 × 768 and 390 × 844.

### Contrast check (WCAG)

The background was sampled from screenshots in text-free strips right next to each text, at both 1366 and 390 wide. The textures, noise and grid lines are included in the samples. Each figure is the contrast against the **darkest** sampled pixel, and the lower of the two widths. The gradient headings are counted with their lighter end (`#134e4a`).

| Variant | h1 (needs 3:1) | Hero paragraph (4.5:1) | Outlined button (4.5:1) | "PROIZVODI" (3:1) | Products note (4.5:1) | "KONTAKT" (3:1) |
|---|---|---|---|---|---|---|
| 0 Current | 8.7 | 9.3 | 8.2 | 8.1 | 9.0 | 7.0 |
| 1 Brushed steel | 8.2 | 8.5 | 7.4 | 7.3 | 8.0 | 7.1 |
| 2 Steel blue | 7.1 | 7.9 | 7.0 | 7.2 | 7.9 | 7.8 |
| 3 Technical drawing | 7.5 | 8.0 | 7.3 | 5.7 ¹ | 7.0 | 5.7 ¹ |
| 4 Plain + band | 8.8 | 9.5 | 8.4 | 8.1 | 8.7 | 8.8 |

¹ Measured on the spot where two strong grid lines cross; on the plain surface between the lines the title has 8:1 or better.

**All variants pass WCAG AA everywhere, and AAA (7:1) for normal text.** Variant 4 adds no horizontal scrolling: its full-width band is drawn with `border-image` and does not widen the page.

### Opinion

- **CSS only, no image planned:**
  - **3 (Technical drawing)** has the most character and fits "made to measure" work.
  - **1 (Brushed steel)** looks the most like metal.
- **With an AI image on top later:** **2** or **4** work best below it, because they don't compete with the image.

---

## 11. How to switch the background later

### Compare the variants

Run `npm run dev` or `npm run build && npm run preview`, then open the home page with one of these:

- `?bg=1` … `?bg=4`
- `?bg=0` for the current background
- `?bg=img` for the image, once its files exist

A small panel in the bottom-left corner switches between them. Without `?bg`, the site looks exactly like production.

### Make a CSS variant permanent

Its rules move from `dev/background-variants.css` into `.background-div` in `src/index.css`. Then `dev/`, the plugin in `vite.config.js` and the injection in `scripts/preview.mjs` are removed. This is an open task in CHANGES.md.

### Add the AI image

1. Generate the images (section 9).
2. Run `npm run backgrounds -- path/to/desktop.png path/to/phone.png`. This writes the four webp files to `public/backgrounds/` and prints their sizes.
3. Check the result with `npm run dev` and `?bg=img`.
4. Switch it on. **The one-line change** is in `src/pages/RootLayout.jsx`:

   ```jsx
   <div className="background-div">
   ```

   becomes

   ```jsx
   <div className="background-div page-bg-image">
   ```

5. Build, check, commit.
