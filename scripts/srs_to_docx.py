# -*- coding: utf-8 -*-
"""สร้าง GroupB_SRS_v2.docx จาก GroupB_SRS_v2.md

    python scripts/srs_to_docx.py [ไฟล์ปลายทาง]

แหล่งความจริงคือไฟล์ .md เสมอ — แก้ที่ .md แล้วรันสคริปต์นี้ใหม่ ห้ามแก้ .docx โดยตรง
เพราะจะถูกเขียนทับ

สิ่งที่สคริปต์ทำตามลำดับ
  1. แปลงแผนภาพ .svg ในภาคผนวก ข เป็น .png ความละเอียดสูงด้วย Chrome แบบไม่มีหน้าต่าง
     (PyMuPDF อ่าน <style> ใน SVG ไม่ได้ จึงใช้เบราว์เซอร์แทน)
  2. สร้างเอกสารฐานเปล่าจากเทมเพลตรายวิชา guide/ENGSE206_CaseX_SRS_v1.0_TH.docx
     เพื่อคงฟอนต์ TH Sarabun New สีหัวข้อ และขนาดกระดาษให้ตรงแบบฟอร์ม
  3. แปลงมาร์กดาวน์เป็นเนื้อหา Word แล้วบันทึก

ต้องมี  python-docx  และ Google Chrome ในเครื่อง
"""
import os
import re
import shutil
import subprocess
import sys
import zipfile

import docx
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml.ns import qn
from docx.shared import Cm, Emu, Pt, RGBColor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'GroupB_SRS_v2.md')
TEMPLATE = os.path.join(ROOT, 'guide', 'ENGSE206_CaseX_SRS_v1.0_TH.docx')
FIGURES = os.path.join(ROOT, 'Project report', 'figures', 'ch3')
BUILD = os.path.join(ROOT, '.build_srs')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    ROOT, 'ENGSE206_CaseX(B)_SRS_v0.2_TH.docx')

CHROME = next((p for p in [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
] if os.path.exists(p)), None)

# ค่าทั้งหมดในกลุ่มนี้ถอดจาก guide/ENGSE206_CaseX_SRS_v1.0_TH.docx โดยตรง
INK = RGBColor(0x18, 0x3B, 0x63)       # สีตัวอักษรหลัก
TEAL = '176B87'                        # สีบรรทัดขยายความบนหน้าปก เท่ากับ Heading 2
HEAD_BG = '183B63'                     # พื้นหัวตาราง
BAND_BG = 'F2F7FA'                     # พื้นแถวสลับ
CODE_BG = 'EDF2F6'
NOTE_BORDER = 'E28A2B'                 # ขอบกล่องหมายเหตุ
NOTE_BG = 'FFF0CC'                     # พื้นกล่องหมายเหตุ
BODY_PT = Pt(16)                       # ขนาดตัวอักษรเนื้อความ
TABLE_PT = Pt(14)                      # ขนาดตัวอักษรในตาราง
LOGOS = [('image1.jpg', 3.00), ('image2.png', 2.62)]   # โลโก้บนหน้าปก (กว้าง ซม.)
MAX_W, MAX_H = 16.0, 17.0              # ขนาดรูปสูงสุด (เซนติเมตร)
TEXT_W_TWIPS = 9866                    # ความกว้างเนื้อหาในหน้ากระดาษ (ทวิป)
IMG_SIZE = {'b1_system_context': (960, 640),
            'b2_domain_model': (1280, 760),
            'b3_car_state': (880, 1000)}


# ───────────────────────── ขั้นที่ 1 แปลงแผนภาพเป็น .png ─────────────────────────
def render_figures():
    """Chrome แบบไม่มีหน้าต่างเก็บภาพหน้าจอของ .svg ที่ 3 เท่าของขนาดจริง"""
    if CHROME is None:
        raise SystemExit('ไม่พบ Google Chrome ซึ่งจำเป็นต่อการแปลงแผนภาพ .svg เป็น .png')
    os.makedirs(BUILD, exist_ok=True)
    for name, (w, h) in IMG_SIZE.items():
        svg = os.path.join(FIGURES, name + '.svg')
        png = os.path.join(BUILD, name + '.png')
        if not os.path.exists(svg):
            raise SystemExit(f'ไม่พบแผนภาพ {svg}')
        if os.path.exists(png) and os.path.getmtime(png) > os.path.getmtime(svg):
            continue                                   # ยังใหม่กว่าไฟล์ต้นทาง ไม่ต้องแปลงซ้ำ
        subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                        '--force-device-scale-factor=3', f'--window-size={w},{h}',
                        f'--screenshot={png}', 'file:///' + svg.replace(os.sep, '/')],
                       check=True, capture_output=True)
        if not os.path.exists(png):
            raise SystemExit(f'Chrome แปลง {name}.svg ไม่สำเร็จ')


# ───────────────────────── ขั้นที่ 2 เอกสารฐานจากเทมเพลตรายวิชา ─────────────────────────
def fix_thai(styles):
    """ตัวไทยเป็น complex script — Word ใช้ szCs กับ rFonts w:cs คนละชุดกับตัวละติน
    ถ้าไม่ตั้ง ตัวไทยจะตกไปใช้ค่าเริ่มต้น 11 pt และตัดบรรทัดกลางคำเพราะภาษาเป็น ar-SA"""
    styles = styles.replace('w:bidi="ar-SA"', 'w:bidi="th-TH"')
    styles = styles.replace(
        '<w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia"'
        ' w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/><w:sz w:val="22"/>'
        '<w:szCs w:val="22"/>',
        '<w:rFonts w:ascii="TH Sarabun New" w:eastAsia="TH Sarabun New"'
        ' w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New"/><w:sz w:val="30"/>'
        '<w:szCs w:val="30"/>')

    def sync(m):
        """ให้ขนาดอักษรไทยในแต่ละสไตล์เท่ากับขนาดอักษรละติน"""
        block = m.group(0)
        sz = re.search(r'<w:sz w:val="(\d+)"/>', block)
        if not sz:
            return block
        if re.search(r'<w:szCs w:val="\d+"/>', block):
            block = re.sub(r'<w:szCs w:val="\d+"/>', f'<w:szCs w:val="{sz.group(1)}"/>', block)
        else:
            block = block.replace(sz.group(0), sz.group(0) + f'<w:szCs w:val="{sz.group(1)}"/>')
        block = re.sub(r'(<w:rFonts [^>]*?)\s*w:cstheme="[^"]*"',
                       lambda mm: mm.group(1) + ' w:cs="TH Sarabun New"', block)
        return block

    return re.sub(r'<w:style w:type="paragraph".*?</w:style>', sync, styles, flags=re.S)

def set_texts(xml, values):
    """แทน <w:t> ตามลำดับด้วยค่าใน values (None = คงเดิม)"""
    it = iter(values)

    def rep(m):
        try:
            v = next(it)
        except StopIteration:
            return m.group(0)
        return m.group(0) if v is None else m.group(1) + v + m.group(3)

    return re.sub(r'(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)', rep, xml, flags=re.S)


def set_core_props(xml):
    """เขียนคุณสมบัติเอกสารใหม่ ไม่ให้ค้างข้อมูลของไฟล์ต้นแบบไว้"""
    fields = {
        'dc:title': 'Software Requirements Specification — Case X (B): '
                    'ระบบทะเบียนหลักฐาน การตรวจติดตามภายใน '
                    'การติดตามการแก้ไขและการป้องกัน พร้อมแดชบอร์ดปฏิบัติการ',
        'dc:subject': 'ENGSE206 · เอกสารข้อกำหนดความต้องการระดับโมดูล SE02 Group B',
        'dc:creator': 'ปวริศ คูณศรี · อภิรญา สายนาคำ',
        'dc:description': 'เอกสารภายในโครงงาน อ้างอิงเอกสารคุณภาพของสำนักงานคณบดี'
                          'คณะวิศวกรรมศาสตร์ ห้ามเผยแพร่ต่อสาธารณะโดยไม่ได้รับอนุญาต',
        'cp:lastModifiedBy': 'ปวริศ คูณศรี',
    }
    for tag, value in fields.items():
        xml = re.sub(f'<{tag}>.*?</{tag}>|<{tag}/>', f'<{tag}>{value}</{tag}>', xml, flags=re.S)
    return xml

def extract_logos():
    """โลโก้ SE RMUTL และตราสถาบันบนหน้าปก ดึงจากเทมเพลตของอาจารย์โดยตรง"""
    z = zipfile.ZipFile(TEMPLATE)
    out = []
    for name, _ in LOGOS:
        dst = os.path.join(BUILD, name)
        with open(dst, 'wb') as f:
            f.write(z.read('word/media/' + name))
        out.append(dst)
    return out


def make_base(path):
    """คัดลอกเทมเพลตรายวิชาโดยล้างเนื้อหาทิ้ง เหลือแต่สไตล์ ธีม และการตั้งหน้ากระดาษ"""
    z = zipfile.ZipFile(TEMPLATE)
    doc = z.read('word/document.xml').decode('utf-8')
    sect = re.search(r'<w:sectPr.*?</w:sectPr>', doc, re.S).group(0)
    head = doc[:doc.index('<w:body>') + len('<w:body>')]

    rels = z.read('word/_rels/document.xml.rels').decode('utf-8')
    rels = re.sub(r'<Relationship[^>]*Type="[^"]*/image"[^>]*/>', '', rels)

    repl = {
        'word/document.xml': head + sect + '</w:body></w:document>',
        'word/_rels/document.xml.rels': rels,
        'word/styles.xml': fix_thai(z.read('word/styles.xml').decode('utf-8')),
        'docProps/core.xml': set_core_props(z.read('docProps/core.xml').decode('utf-8')),
        'word/header1.xml': set_texts(
            z.read('word/header1.xml').decode('utf-8'),
            ['ENGSE206 Intensive Weekend Class | Case X (B) SRS',
             'SE RMUTL · RMUTL']),
        'word/footer1.xml': set_texts(
            z.read('word/footer1.xml').decode('utf-8'),
            ['SRS v0.2 · Working Draft · ', None, None, None]),
    }
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as o:
        for it in z.infolist():
            if it.filename.startswith('word/media/'):
                continue                               # รูปของเทมเพลตไม่ได้ใช้
            data = repl[it.filename].encode('utf-8') if it.filename in repl                 else z.read(it.filename)
            o.writestr(it, data)


# ───────────────────────── ตัวช่วยระดับ XML ─────────────────────────
def shade(el, fill):
    shd = el.makeelement(qn('w:shd'), {})
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill)
    el.append(shd)


def border(pPr, edges, sz=6, color='176B87'):
    bd = pPr.makeelement(qn('w:pBdr'), {})
    for e in edges:
        b = bd.makeelement(qn('w:' + e), {})
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), str(sz))
        b.set(qn('w:space'), '4')
        b.set(qn('w:color'), color)
        bd.append(b)
    pPr.append(bd)


def cell_margins(cell, v=80, h=100):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = tcPr.makeelement(qn('w:tcMar'), {})
    for tag, w in (('top', v), ('left', h), ('bottom', v), ('right', h)):
        el = mar.makeelement(qn('w:' + tag), {})
        el.set(qn('w:w'), str(w))
        el.set(qn('w:type'), 'dxa')
        mar.append(el)
    tcPr.append(mar)


def valign_center(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    va = tcPr.makeelement(qn('w:vAlign'), {})
    va.set(qn('w:val'), 'center')
    tcPr.append(va)


def cell_borders(cell, color, sz=18):
    tcPr = cell._tc.get_or_add_tcPr()
    bd = tcPr.makeelement(qn('w:tcBorders'), {})
    for edge in ('top', 'left', 'bottom', 'right'):
        el = bd.makeelement(qn('w:' + edge), {})
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), str(sz))
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), color)
        bd.append(el)
    tcPr.append(bd)


def keep_with_next(p):
    p.paragraph_format.keep_with_next = True


def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    th = trPr.makeelement(qn('w:tblHeader'), {})
    trPr.append(th)


def full_width(table):
    """ยึดความกว้างตารางเท่าความกว้างเนื้อหา และล็อกไม่ให้ Word คำนวณคอลัมน์ใหม่"""
    tblPr = table._tbl.tblPr
    for tag in ('w:tblW', 'w:tblLayout'):
        for el in tblPr.findall(qn(tag)):
            tblPr.remove(el)
    w = tblPr.makeelement(qn('w:tblW'), {})
    w.set(qn('w:w'), str(TEXT_W_TWIPS))
    w.set(qn('w:type'), 'dxa')
    tblPr.append(w)
    lay = tblPr.makeelement(qn('w:tblLayout'), {})
    lay.set(qn('w:type'), 'fixed')
    tblPr.append(lay)


def set_size(run, pt, cs_font=None):
    """ตั้งขนาดทั้งตัวละตินและตัวไทย (complex script) พร้อมกัน"""
    run.font.size = pt
    rPr = run._r.get_or_add_rPr()
    for el in rPr.findall(qn('w:szCs')):
        rPr.remove(el)
    szCs = rPr.makeelement(qn('w:szCs'), {})
    szCs.set(qn('w:val'), str(int(round(pt.pt * 2))))
    rPr.append(szCs)
    if cs_font:
        rf = rPr.find(qn('w:rFonts'))
        if rf is None:
            rf = rPr.makeelement(qn('w:rFonts'), {})
            rPr.insert(0, rf)
        rf.set(qn('w:cs'), cs_font)


# ───────────────────────── ตัวเน้นในบรรทัด ─────────────────────────
INLINE = re.compile(r'(\*\*.+?\*\*|`[^`]+`)', re.S)


def add_runs(p, text, bold=False, size=None):
    base = size or Pt(15)                      # ขนาดตัวอักษรรอบข้าง
    code = Pt(base.pt - 3)                     # Consolas ดูใหญ่กว่าตัวไทยที่ขนาดเท่ากัน
    for tok in INLINE.split(text):
        if not tok:
            continue
        if tok.startswith('**') and tok.endswith('**') and len(tok) > 4:
            r = p.add_run(tok[2:-2])
            r.bold = True
            if size:
                set_size(r, size)
        elif tok.startswith('`') and tok.endswith('`') and len(tok) > 2:
            r = p.add_run(tok[1:-1])
            r.font.name = 'Consolas'
            set_size(r, code, 'Consolas')
            shade(r._r.get_or_add_rPr(), CODE_BG)
        else:
            r = p.add_run(tok)
            r.bold = bold
            if size:
                set_size(r, size)
    return p


# ───────────────────────── แยกบล็อกจากมาร์กดาวน์ ─────────────────────────
def parse_blocks(lines):
    blocks, i, n = [], 0, len(lines)
    while i < n:
        ln = lines[i]
        s = ln.strip()
        if not s:
            i += 1
            continue
        if re.match(r'^-{3,}$', s):
            blocks.append(('hr', None))
            i += 1
        elif re.match(r'^#{1,6} ', s):
            lvl = len(s) - len(s.lstrip('#'))
            blocks.append(('h', (lvl, s[lvl:].strip())))
            i += 1
        elif re.match(r'^!\[.*?\]\(.*?\)$', s):
            m = re.match(r'^!\[(.*?)\]\((.*?)\)$', s)
            blocks.append(('img', (m.group(1), m.group(2))))
            i += 1
        elif s.startswith('|'):
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(lines[i].strip())
                i += 1
            blocks.append(('table', rows))
        elif s.startswith('>'):
            q = []
            while i < n and lines[i].strip().startswith('>'):
                q.append(re.sub(r'^>\s?', '', lines[i].strip()))
                i += 1
            blocks.append(('quote', q))
        elif re.match(r'^\s*(?:\d+\.|[-*])\s', ln):
            items = []
            while i < n and re.match(r'^\s*(?:\d+\.|[-*])\s', lines[i]):
                raw = lines[i]
                indent = (len(raw) - len(raw.lstrip(' '))) // 3
                body = raw.strip()
                m = re.match(r'^(\d+\.|[-*])\s+(.*)$', body)
                mark = m.group(1)
                mark = '•' if mark in '-*' else mark
                items.append((indent, mark, m.group(2)))
                i += 1
            blocks.append(('list', items))
        else:
            para = []
            while i < n and lines[i].strip() and not re.match(
                    r'^\s*(#{1,6} |\||>|!\[|-{3,}$|\d+\.\s|[-*]\s)', lines[i]):
                para.append(lines[i].strip())
                i += 1
            blocks.append(('p', ' '.join(para)))
    return blocks


def split_row(row):
    return [c.strip() for c in row.strip().strip('|').split('|')]


ALIGN = {(True, True): WD_ALIGN_PARAGRAPH.CENTER,
         (False, True): WD_ALIGN_PARAGRAPH.RIGHT,
         (True, False): WD_ALIGN_PARAGRAPH.LEFT,
         (False, False): WD_ALIGN_PARAGRAPH.LEFT}


def plain(cell):
    """ความยาวข้อความหลังตัดเครื่องหมายมาร์กดาวน์ออก"""
    return len(re.sub(r'[`*]', '', cell))


def set_widths(table, header, data, ncol):
    """กระจายความกว้างคอลัมน์ตามความยาวเนื้อหา แล้วบังคับความกว้างขั้นต่ำ
    ให้พอกับคำที่ตัดบรรทัดกลางคำไม่ได้ เช่นรหัส AC-B-29 หรือ FM-QP-2301-0109-01"""
    rows = [header] + data
    longest, token = [0] * ncol, [0] * ncol
    for row in rows:
        for j in range(min(ncol, len(row))):
            txt = re.sub(r'[`*]', '', row[j])
            longest[j] = max(longest[j], len(txt))
            for word in txt.split():
                token[j] = max(token[j], len(word))

    weights = [max(8.0, min(52.0, float(longest[j]))) for j in range(ncol)]
    total = sum(weights)
    widths = [int(TEXT_W_TWIPS * w / total) for w in weights]

    # ขั้นต่ำ ≈ ความกว้างของคำที่ยาวที่สุด บวกระยะขอบในช่อง
    floor = int(1.5 * 567)
    mins = [min(3400, max(floor, token[j] * 135 + 340)) for j in range(ncol)]
    if sum(mins) > TEXT_W_TWIPS:                       # กันกรณีบีบจนเกินหน้ากระดาษ
        k = TEXT_W_TWIPS / sum(mins)
        mins = [int(m * k) for m in mins]

    for _ in range(6):
        deficit = sum(max(0, mins[j] - widths[j]) for j in range(ncol))
        if deficit <= 0:
            break
        slack = [max(0, widths[j] - mins[j]) for j in range(ncol)]
        if sum(slack) <= 0:
            break
        for j in range(ncol):
            if slack[j]:
                widths[j] -= int(deficit * slack[j] / sum(slack))
        widths = [max(mins[j], widths[j]) for j in range(ncol)]

    widths[widths.index(max(widths))] += TEXT_W_TWIPS - sum(widths)

    grid = table._tbl.find(qn('w:tblGrid'))
    for col, w in zip(grid.findall(qn('w:gridCol')), widths):
        col.set(qn('w:w'), str(w))
    for row in table.rows:
        for cell, w in zip(row.cells, widths):
            cell.width = Emu(w * 635)                  # 1 ทวิป = 635 EMU


def add_cover_logos(doc):
    """โลโก้สองตัววางเรียงกันในตารางไร้เส้น เหมือนหน้าปกของเทมเพลต"""
    paths = extract_logos()
    t = doc.add_table(rows=1, cols=len(paths))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for cell, path, (_, cm) in zip(t.rows[0].cells, paths, LOGOS):
        par = cell.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.add_run().add_picture(path, width=Cm(cm))


# ───────────────────────── ขั้นที่ 3 แปลงมาร์กดาวน์เป็นเนื้อหา ─────────────────────────
render_figures()
base_path = os.path.join(BUILD, 'base.docx')
make_base(base_path)

doc = docx.Document(base_path)
lines = open(SRC, encoding='utf-8').read().split('\n')
blocks = parse_blocks(lines)

h1_seen = 0
front = True          # ยังอยู่ในส่วนหน้าปกก่อนเส้นคั่นแรก
stats = dict(h=0, p=0, table=0, list=0, quote=0, img=0, hr=0)

for bi, (kind, val) in enumerate(blocks):
    nxt = blocks[bi + 1][0] if bi + 1 < len(blocks) else None
    nxt_val = blocks[bi + 1][1] if bi + 1 < len(blocks) else None

    if kind == 'hr':
        front = False
        # ถ้าถัดไปเป็นหัวข้อใหญ่ที่จะขึ้นหน้าใหม่อยู่แล้ว ไม่ต้องวาดเส้น
        if nxt == 'h' and nxt_val[0] == 1:
            continue
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(8)
        border(p._p.get_or_add_pPr(), ['bottom'], sz=4, color='C9D6E0')
        stats['hr'] += 1

    elif kind == 'h':
        lvl, txt = val
        # หน้าปกวางแบบเดียวกับเทมเพลตของอาจารย์ — Title, Subtitle แล้วบรรทัดขยายความ
        # ทั้งหมดชิดซ้าย และไม่นับเป็นหัวข้อในสารบัญ
        if front and lvl == 1 and h1_seen == 0:
            add_cover_logos(doc)
            p = doc.add_paragraph(style='Title')
            add_runs(p, txt)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            h1_seen = 1
        elif front and lvl == 2:
            p = doc.add_paragraph(style='Subtitle')
            add_runs(p, txt)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif front:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            add_runs(p, txt, size=Pt(16))
            for r in p.runs:
                r.font.color.rgb = INK
        else:
            if lvl == 1:
                p = doc.add_paragraph()
                p.add_run().add_break(WD_BREAK.PAGE)
                h1_seen += 1
            p = doc.add_paragraph(style=f'Heading {min(lvl, 4)}')
            add_runs(p, txt)
        keep_with_next(p)
        stats['h'] += 1

    elif kind == 'p':
        p = doc.add_paragraph()
        if front:                                      # บรรทัดขยายความใต้ชื่อเรื่อง
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            add_runs(p, val, size=Pt(18))
            for r in p.runs:
                r.font.color.rgb = RGBColor(0x17, 0x6B, 0x87)
        else:
            add_runs(p, val, size=BODY_PT)
            if val.startswith('**รูปที่'):
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        stats['p'] += 1

    elif kind == 'quote':
        # กล่องหมายเหตุ ใช้รูปแบบเดียวกับกล่อง PUBLIC / PRIVATE BOUNDARY ในเทมเพลต
        t = doc.add_table(rows=1, cols=1)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        full_width(t)
        cell = t.rows[0].cells[0]
        cell.width = Emu(TEXT_W_TWIPS * 635)
        cell_borders(cell, NOTE_BORDER)
        shade(cell._tc.get_or_add_tcPr(), NOTE_BG)
        cell_margins(cell, v=130, h=150)
        for k, q in enumerate(val):
            p = cell.paragraphs[0] if k == 0 else cell.add_paragraph()
            p.paragraph_format.space_after = Pt(2)
            add_runs(p, q, size=BODY_PT)
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        stats['quote'] += 1

    elif kind == 'list':
        for indent, mark, txt in val:
            p = doc.add_paragraph()
            pf = p.paragraph_format
            pf.left_indent = Cm(0.85 + 0.7 * indent)
            pf.first_line_indent = Cm(-0.65)
            pf.space_after = Pt(2)
            add_runs(p, f'{mark}\t{txt}', size=BODY_PT)
        stats['list'] += 1

    elif kind == 'img':
        alt, path = val
        name = os.path.splitext(os.path.basename(path))[0]
        png = os.path.join(BUILD, name + '.png')
        if not os.path.exists(png):
            raise SystemExit(f'ไม่พบไฟล์รูป {png}')
        stats['img'] += 1
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(6)
        w, h = IMG_SIZE[name]
        cm_w = min(MAX_W, MAX_H * w / h)
        p.add_run().add_picture(png, width=Cm(cm_w))
        keep_with_next(p)

    elif kind == 'table':
        rows = val
        header = split_row(rows[0])
        is_sep = len(rows) > 1 and re.fullmatch(r'[\s:|-]+', rows[1]) and '-' in rows[1]
        sep = split_row(rows[1]) if is_sep else None
        data = [split_row(r) for r in rows[(2 if sep else 1):]]
        ncol = len(header)
        aligns = []
        for c in (sep or []):
            aligns.append(ALIGN[(c.startswith(':'), c.endswith(':'))])
        aligns += [WD_ALIGN_PARAGRAPH.LEFT] * (ncol - len(aligns))

        t = doc.add_table(rows=1, cols=ncol)
        try:
            t.style = 'Table Grid'
        except KeyError:
            pass
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        full_width(t)
        # เทมเพลตใช้ 14 pt ทุกตาราง · ตารางกว้าง 4–5 คอลัมน์ลดลงหนึ่งขั้นให้พอดีหน้า
        size = TABLE_PT if ncol <= 3 else Pt(13)

        for j, cell in enumerate(header):
            c = t.rows[0].cells[j]
            p = c.paragraphs[0]
            p.alignment = aligns[j]                    # เทมเพลตวางหัวตารางชิดซ้าย
            add_runs(p, cell, bold=True, size=size)
            for r in p.runs:
                r.bold = True
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                if r.font.name != 'Consolas':
                    set_size(r, size)
            shade(c._tc.get_or_add_tcPr(), HEAD_BG)
            cell_margins(c)
            valign_center(c)
        repeat_header(t.rows[0])

        for ri, row in enumerate(data):
            cells = t.add_row().cells
            for j in range(ncol):
                p = cells[j].paragraphs[0]
                p.alignment = aligns[j]
                p.paragraph_format.space_after = Pt(1)
                add_runs(p, row[j] if j < len(row) else '', size=size)
                for r in p.runs:
                    if r.font.name != 'Consolas':
                        set_size(r, size)
                cell_margins(cells[j])
                valign_center(cells[j])
            if ri % 2 == 1:
                for c in cells:
                    shade(c._tc.get_or_add_tcPr(), BAND_BG)
        set_widths(t, header, data, ncol)
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        stats['table'] += 1

doc.save(OUT)
shutil.rmtree(BUILD, ignore_errors=True)
print('บันทึก:', OUT)
print('สรุปบล็อก:', stats)
