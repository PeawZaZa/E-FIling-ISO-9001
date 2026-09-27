"""Render the edited Word export for visual page-by-page review."""

from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / ".chapter2_figures_final_render.pdf"
OUT = ROOT / ".chapter2-figures-word-render"
OUT.mkdir(exist_ok=True)

pdf = pdfium.PdfDocument(str(SOURCE))
thumbs = []
for index in range(len(pdf)):
    image = pdf[index].render(scale=1.4).to_pil().convert("RGB")
    image.save(OUT / f"page-{index + 1:02}.png")
    thumb = image.copy()
    thumb.thumbnail((620, 900))
    thumbs.append(thumb)

for start in range(0, len(thumbs), 4):
    subset = thumbs[start : start + 4]
    sheet = Image.new("RGB", (1280, 1900), "#e5e7eb")
    draw = ImageDraw.Draw(sheet)
    for offset, thumb in enumerate(subset):
        x = 20 + (offset % 2) * 640
        y = 35 + (offset // 2) * 940
        sheet.paste(thumb, (x, y))
        draw.text((x, y - 18), f"Page {start + offset + 1}", fill="black")
    sheet.save(OUT / f"contact-{start // 4 + 1:02}.png")

print(f"Rendered {len(pdf)} pages and {(len(thumbs) + 3) // 4} contact sheets")
