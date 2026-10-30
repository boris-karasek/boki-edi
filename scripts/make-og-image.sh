#!/usr/bin/env bash
# Regenerates public/og-image.jpg (1200x630), the preview image shown when a link to the site is
# shared (Viber, WhatsApp, e-mail). Run it after changing the headline.
# Requires ImageMagick 7 (`magick`) and the Noto Sans fonts (Linux: fonts-noto-core).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PHOTO="$ROOT/src/assets/Brzovez.webp"
OUT="$ROOT/public/og-image.jpg"
BOLD=/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf
REGULAR=/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Background: site colors (stone-900 -> teal-900)
magick -size 630x1200 gradient:'#1c1917'-'#134e4a' -rotate 90 "$TMP/bg.png"

# Product photo with rounded corners (the caption below uses a non-breaking space in "A table")
magick "$PHOTO" -resize 420x560^ -gravity center -extent 420x500 \
  \( -size 420x500 xc:none -fill white -draw "roundrectangle 0,0 419,499 28,28" \) \
  -compose DstIn -composite "$TMP/photo.png"

magick "$TMP/bg.png" \
  "$TMP/photo.png" -gravity east -geometry +60+0 -compose over -composite \
  -gravity northwest \
  -font "$BOLD" -pointsize 44 -fill '#fafaf9' -annotate +64+64 'BOKI-EDI' \
  -font "$BOLD" -pointsize 66 -fill '#ffffff' -annotate +64+150 'Metalni delovi' \
  -font "$BOLD" -pointsize 66 -fill '#ffffff' -annotate +64+232 'po meri' \
  -fill '#2dd4bf' -draw "roundrectangle 66,330 226,340 5,5" \
  \( -size 620x -background none -font "$REGULAR" -pointsize 32 -fill '#e7e5e4' -interline-spacing 4 \
     caption:'Lajsne za kalendare, brzovezi, uglovi za A table i druga sitna metalna galanterija' \) \
     -geometry +64+370 -compose over -composite \
  -font "$REGULAR" -pointsize 30 -fill '#5eead4' -annotate +64+500 'Dobanovci · od 2007.' \
  -font "$REGULAR" -pointsize 26 -fill '#a8a29e' -annotate +64+548 'www.boki-edi.com' \
  -quality 85 -strip "$OUT"

echo "Written $OUT ($(magick identify -format '%wx%h, %b' "$OUT"))"
