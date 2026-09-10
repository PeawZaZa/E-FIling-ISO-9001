"""ส่งออกแผนภาพจากไฟล์ HTML ของ diagram-design เป็น .svg และ .png

- .svg  = ดึงบล็อก <svg> ตัวแรกออกมาเป็นไฟล์เดี่ยว พร้อมฝัง @import ของฟอนต์ (escape & เป็น &amp;)
- .png  = เรนเดอร์ด้วย Chrome headless จากไฟล์ HTML ชั่วคราวที่ครอบเฉพาะ <svg> ให้เต็มหน้าต่าง

ใช้: python scripts/export_diagram.py <file.html> [file2.html ...] [--scale 2]
ไม่ต้องติดตั้งไลบรารีเพิ่ม ใช้ Chrome ที่มีอยู่ในเครื่อง
"""

import os
import re
import subprocess
import sys
import tempfile

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

FONT_IMPORT = (
    "@import url('https://fonts.googleapis.com/css2?"
    "family=Sarabun:wght@400;500;600;700&amp;"
    "family=Geist+Mono:wght@400;500&amp;display=swap');"
)

SVG_RE = re.compile(r"<svg\b.*?</svg>", re.S)
VIEWBOX_RE = re.compile(r'viewBox="([\d.\s-]+)"')


def find_chrome():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    return None


def extract_svg(html_path):
    with open(html_path, encoding="utf-8") as fh:
        html = fh.read()
    match = SVG_RE.search(html)
    if not match:
        raise SystemExit(f"ไม่พบบล็อก <svg> ใน {html_path}")
    return match.group(0)


def write_svg(svg, out_path):
    if "xmlns=" not in svg.split(">", 1)[0]:
        svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    style_block = f"\n    <style>{FONT_IMPORT}</style>"
    if "<defs>" in svg:
        svg = svg.replace("<defs>", "<defs>" + style_block, 1)
    else:
        svg = re.sub(r"(</title>|</desc>)", r"\1\n  <defs>" + style_block + "\n  </defs>", svg, count=1)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        fh.write(svg)
        fh.write("\n")


def viewbox_size(svg):
    match = VIEWBOX_RE.search(svg)
    if not match:
        raise SystemExit("แผนภาพไม่มี viewBox — ตรวจไฟล์ต้นฉบับก่อน")
    parts = [float(v) for v in match.group(1).split()]
    return int(round(parts[2])), int(round(parts[3]))


def write_png(html_path, svg, out_path, chrome, scale):
    out_path = os.path.abspath(out_path)
    width, height = viewbox_size(svg)
    shell = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        "<link href=\"https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700"
        "&family=Geist+Mono:wght@400;500&display=swap\" rel='stylesheet'>"
        "<style>html,body{margin:0;padding:0;background:#ffffff}"
        f"svg{{display:block;width:{width}px;height:{height}px}}</style></head><body>"
        + svg
        + "</body></html>"
    )
    tmp = tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8")
    tmp.write(shell)
    tmp.close()
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-sandbox",
        "--default-background-color=00000000",
        f"--force-device-scale-factor={scale}",
        f"--window-size={width},{height}",
        f"--screenshot={out_path}",
        "--virtual-time-budget=8000",
        f"file:///{tmp.name.replace(os.sep, '/')}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    os.unlink(tmp.name)
    if not os.path.exists(out_path):
        raise SystemExit(f"Chrome เรนเดอร์ไม่สำเร็จ: {result.stderr[-800:]}")
    return width * scale, height * scale


def main():
    args = [a for a in sys.argv[1:]]
    scale = 2
    if "--scale" in args:
        idx = args.index("--scale")
        scale = int(args[idx + 1])
        del args[idx : idx + 2]
    if not args:
        raise SystemExit(__doc__)
    chrome = find_chrome()
    if chrome is None:
        raise SystemExit("ไม่พบ Chrome/Edge ในเครื่อง — ส่งออก PNG ไม่ได้")
    for html_path in args:
        svg = extract_svg(html_path)
        base = os.path.splitext(html_path)[0]
        write_svg(svg, base + ".svg")
        px = write_png(html_path, svg, base + ".png", chrome, scale)
        print(f"{os.path.basename(base)}: svg ok · png {px[0]}x{px[1]}")


if __name__ == "__main__":
    main()
