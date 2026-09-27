"""Build Chapter 3 from its Markdown source using the formatted Chapter 2 DOCX.

No Chapter 2 project text is retained.  Its section setup, Word styles,
settings, theme, and table conventions are the formatting base.
"""

import re
import zipfile
from pathlib import Path
from tempfile import NamedTemporaryFile

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches
from lxml import etree


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "CHAPTER_3_DRAFT.md"
REFERENCE = ROOT / "Chapter_2_E-Filing_Draft.docx"
OUTPUT = ROOT / "Chapter_3_E-Filing_Draft.docx"
FIGURES = ROOT / ".chapter3-figures"
ARCHITECTURE = ROOT / ".chapter2-figures" / "architecture-unified.png"

IMAGES = {
    "3.1": (ARCHITECTURE, 5.3),
    "3.2": (FIGURES / "use-case-unified.png", 5.45),
    "3.3": (FIGURES / "er-conceptual-unified.png", 5.45),
    "3.4": (FIGURES / "dar-ack-workflow.png", 5.2),
    "3.5": (FIGURES / "car-ncr-workflow.png", 5.2),
}


def set_font(run):
    run.font.name = "TH Sarabun New"
    rpr = run._r.get_or_add_rPr()
    fonts = rpr.rFonts
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        rpr.insert(0, fonts)
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        fonts.set(qn("w:" + attr), "TH Sarabun New")


def rich_text(paragraph, raw):
    """Remove Markdown delimiters but preserve every substantive character."""
    for chunk in re.split(r"(`[^`]+`)", raw):
        if not chunk:
            continue
        run = paragraph.add_run(chunk[1:-1] if chunk.startswith("`") and chunk.endswith("`") else chunk)
        set_font(run)


def parse_source():
    lines = SOURCE.read_text(encoding="utf-8").splitlines()
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [x.strip() for x in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"-+", c) for c in cells):
                    rows.append(cells)
                i += 1
            blocks.append(("table", rows))
            continue
        if line.startswith("# "):
            blocks.append(("chapter", line[2:]))
        elif line.startswith("## "):
            blocks.append(("major", line[3:]))
        elif line.startswith("### "):
            blocks.append(("sub", line[4:]))
        elif line.startswith("**ตารางที่ "):
            blocks.append(("table_caption", line))
        elif line.startswith("**รูปที่ "):
            blocks.append(("figure_caption", line))
        elif line.startswith("[ต้อง") and "รูป" in line:
            blocks.append(("figure_placeholder", line))
        else:
            blocks.append(("body", line))
        i += 1
    return blocks


def add_caption(doc, text, kind):
    match = re.fullmatch(r"\*\*(.+?)\*\* (.*)", text)
    if not match:
        raise ValueError(f"Bad caption: {text}")
    style = "E-Filing Table Caption" if kind == "table" else "E-Filing Thai Body"
    p = doc.add_paragraph(style=style)
    p.paragraph_format.keep_together = True
    if kind == "table":
        p.paragraph_format.keep_with_next = True
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    else:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = 0
    number = p.add_run(match.group(1))
    number.bold = True
    set_font(number)
    rich_text(p, " " + match.group(2))


def add_table(doc, rows, table_index):
    if not rows or any(len(row) != len(rows[0]) for row in rows):
        raise ValueError(f"Uneven table {table_index}")
    tbl = doc.add_table(rows=0, cols=len(rows[0]))
    tbl.style = "Table Grid"
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    widths_by_table = {
        1: [1.25, 2.20, 2.25],
        2: [1.28, 2.17, 2.25],
        3: [1.35, 2.20, 2.15],
        4: [1.72, 3.98],
        5: [1.28, 1.72, 2.70],
        6: [0.58, 1.83, 3.29],
        7: [1.45, 4.25],
        8: [1.52, 1.85, 2.33],
    }
    widths = widths_by_table[table_index]
    if len(widths) != len(rows[0]):
        raise ValueError(f"Unexpected column count in table {table_index}")
    for ri, values in enumerate(rows):
        row = tbl.add_row()
        for ci, value in enumerate(values):
            cell = row.cells[ci]
            cell.width = Inches(widths[ci])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.style = "E-Filing Table Text"
            p.paragraph_format.first_line_indent = 0
            if ri == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            rich_text(p, value)
            if ri == 0:
                for run in p.runs:
                    run.bold = True
        if ri == 0:
            trpr = row._tr.get_or_add_trPr()
            repeat = OxmlElement("w:tblHeader")
            repeat.set(qn("w:val"), "true")
            trpr.append(repeat)
        trpr = row._tr.get_or_add_trPr()
        cant_split = OxmlElement("w:cantSplit")
        trpr.append(cant_split)
    for col, width in zip(tbl.columns, widths):
        col.width = Inches(width)


def add_image(doc, number):
    path, width = IMAGES[number]
    if not path.is_file():
        raise FileNotFoundError(path)
    p = doc.add_paragraph(style="E-Filing Thai Body")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = 0
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.keep_together = True
    p.add_run().add_picture(str(path), width=Inches(width))


def remove_unused_reference_images(path):
    """Remove Chapter 2 images left orphaned by clearing its body content."""
    rels_part = "word/_rels/document.xml.rels"
    with zipfile.ZipFile(path) as source:
        document_xml = source.read("word/document.xml")
        document_tree = etree.fromstring(document_xml)
        embed_attr = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed"
        used_images = {value for element in document_tree.iter()
                       if (value := element.get(embed_attr))}
        relations = etree.fromstring(source.read(rels_part))
        removed_media = set()
        for relation in list(relations):
            if not relation.get("Type", "").endswith("/image"):
                continue
            rid = relation.get("Id", "")
            if rid in used_images:
                continue
            target = relation.get("Target", "")
            if target.startswith("media/"):
                removed_media.add("word/" + target)
            relations.remove(relation)
        rel_bytes = etree.tostring(relations, xml_declaration=True, encoding="UTF-8", standalone=True)
        with NamedTemporaryFile(dir=path.parent, suffix=".docx", delete=False) as temporary:
            tmp_path = Path(temporary.name)
        with zipfile.ZipFile(tmp_path, "w") as result:
            for info in source.infolist():
                if info.filename in removed_media:
                    continue
                data = rel_bytes if info.filename == rels_part else source.read(info.filename)
                result.writestr(info, data)
    tmp_path.replace(path)


def build():
    doc = Document(REFERENCE)
    body = doc._body._body
    for child in list(body):
        if child.tag != qn("w:sectPr"):
            body.remove(child)

    blocks = parse_source()
    figure_n = 0
    table_n = 0
    for kind, value in blocks:
        if kind == "chapter":
            p = doc.add_paragraph(style="E-Filing Chapter Title")
            p.paragraph_format.keep_with_next = True
            rich_text(p, value)
        elif kind == "major":
            p = doc.add_paragraph(style="E-Filing Main Heading")
            p.paragraph_format.keep_with_next = True
            rich_text(p, value)
        elif kind == "sub":
            p = doc.add_paragraph(style="E-Filing Subheading")
            p.paragraph_format.keep_with_next = True
            rich_text(p, value)
        elif kind == "table_caption":
            table_n += 1
            add_caption(doc, value, "table")
        elif kind == "figure_caption":
            figure_n += 1
            add_caption(doc, value, "figure")
        elif kind == "table":
            if table_n == 8:
                # The final design table spans two pages in the Chapter 2
                # typography.  Repeat its chapter-based number and heading.
                add_table(doc, value[:2], table_n)
                continuation = doc.add_paragraph(style="E-Filing Table Caption")
                continuation.paragraph_format.page_break_before = True
                continuation.paragraph_format.keep_with_next = True
                r = continuation.add_run("ตารางที่ 3.8 (ต่อ)")
                r.bold = True
                set_font(r)
                add_table(doc, [value[0]] + value[2:], table_n)
            else:
                add_table(doc, value, table_n)
        elif kind == "figure_placeholder":
            if figure_n < 5:
                add_image(doc, f"3.{figure_n + 1}")
            else:
                p = doc.add_paragraph(style="E-Filing Figure Placeholder")
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.first_line_indent = 0
                rich_text(p, value)
        else:
            p = doc.add_paragraph(style="E-Filing Thai Body")
            rich_text(p, value)

    if (table_n, figure_n) != (8, 7):
        raise AssertionError((table_n, figure_n))
    doc.core_properties.title = "E-Filing ISO 9001 Chapter 3 Draft"
    doc.core_properties.author = ""
    doc.core_properties.last_modified_by = ""
    doc.save(OUTPUT)
    remove_unused_reference_images(OUTPUT)
    print(f"Created {OUTPUT}; tables={len(doc.tables)}, images={len(doc.inline_shapes)}")


if __name__ == "__main__":
    build()
