"""Editable HTML/SVG sources for the verified Chapter 3 diagrams.

The existing Chapter 2 architecture image is reused separately.  This file
creates only diagrams whose content is supported by PROJECT_STATE.md, the
Chapter 3 source draft, and the current Prisma data model.
"""

from html import escape
from pathlib import Path


OUT = Path(__file__).resolve().parent / ".chapter3-figures"
OUT.mkdir(exist_ok=True)
INK = "#172554"
BLUE = "#1e40af"
MID = "#2563eb"
PALE = "#eff6ff"
LIGHT = "#dbeafe"
LINE = "#93c5fd"
NOTE = "#9a3412"
FONT = "TH Sarabun New, Sarabun, Tahoma, sans-serif"


class Figure:
    def __init__(self, slug, title, desc, height):
        self.slug, self.title, self.desc, self.height = slug, title, desc, height
        self.edges = []
        self.nodes = []

    def path(self, d, *, dashed=False, arrow=True, color=MID):
        attrs = f' stroke-dasharray="7 5"' if dashed else ""
        marker = f' marker-end="url(#{self.slug}-arrow)"' if arrow else ""
        self.edges.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.1"{attrs}{marker}/>')

    def text(self, x, y, value, size=21, bold=False, anchor="middle", color=INK):
        self.nodes.append(
            f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{FONT}" '
            f'font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}">{escape(value)}</text>'
        )

    def box(self, x, y, w, h, lines, *, focal=False, ellipse=False, size=20):
        fill = LIGHT if focal else PALE
        stroke = BLUE if focal else LINE
        if ellipse:
            self.nodes.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        else:
            self.nodes.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        step = 23
        first = y + (h - step * (len(lines)-1)) / 2 + 7
        for i, line in enumerate(lines):
            self.text(x+w/2, round(first+i*step), line, size=size, bold=i == 0)

    def save(self):
        slug = self.slug
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="560" height="{self.height}" '
            f'viewBox="0 0 560 {self.height}" role="img" aria-labelledby="{slug}-title {slug}-desc">'
            f'<title id="{slug}-title">{escape(self.title)}</title>'
            f'<desc id="{slug}-desc">{escape(self.desc)}</desc>'
            f'<defs><marker id="{slug}-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">'
            f'<polygon points="0 0,9 3.5,0 7" fill="{MID}"/></marker></defs>'
            '<rect width="100%" height="100%" fill="white"/>'
            + "".join(self.edges) + "".join(self.nodes) + "</svg>"
        )
        html = (
            '<!doctype html><html lang="th"><head><meta charset="utf-8">'
            f'<title>{escape(self.title)}</title><style>html,body{{margin:0;background:#fff}}'
            'svg{display:block;width:560px;height:auto}</style></head><body>'
            + svg + '</body></html>'
        )
        (OUT / f"{slug}.html").write_text(html, encoding="utf-8")


def use_case():
    f = Figure("use-case-unified", "กรณีการใช้งานหลักของระบบ E-Filing", "กลุ่มผู้ใช้งานปัจจุบันสัมพันธ์กับกรณีใช้งานหลักแปดด้านของระบบเดียว โดย CAR/NCR สิ้นสุดที่การตรวจประสิทธิผล", 700)
    f.text(280, 31, "ผู้เกี่ยวข้องตามบทบาท  —  กรณีการใช้งาน", 23, True)
    rows = [
        (["ทุกบทบาท"], ["เข้าสู่ระบบ"]),
        (["ผู้มีสิทธิ์อ่าน / DCC"], ["ค้นหาและใช้เอกสารควบคุม"]),
        (["เจ้าของเอกสาร / ผู้คุมทะเบียน", "ผู้ทบทวน / ผู้อนุมัติ / DCC"], ["ดำเนิน DAR ตามหน้าที่"]),
        (["DCC / ผู้รับทราบ"], ["มอบหมายและยืนยันรับทราบ"]),
        (["ผู้มีสิทธิ์บันทึก"], ["จัดการ Record / Evidence"]),
        (["ผู้ตรวจ / หัวหน้าทีม"], ["บันทึกรอบ Audit / Finding"]),
        (["ผู้รับผิดชอบ / QMR", "ผู้แจ้ง Finding เดิม"], ["ดำเนิน CAR / NCR", "ถึงตรวจประสิทธิผล"]),
        (["ผู้มีสิทธิ์ / Sponsor"], ["ดู Dashboard ตามสิทธิ์"]),
    ]
    for i, (actors, case) in enumerate(rows):
        y = 52 + 76*i
        f.path(f"M207 {y+29} H242", arrow=False)
        f.box(14, y, 193, 59, actors, size=17)
        f.box(242, y, 304, 59, case, ellipse=True, focal=i in (2, 6), size=18)
    f.text(280, 677, "กลุ่มบทบาทใช้เพื่อย่อภาพ ไม่ใช่การเพิ่มบทบาทหรือสิทธิ์ใหม่", 18, color=NOTE)
    f.save()


def er():
    f = Figure("er-conceptual-unified", "ความสัมพันธ์ข้อมูลหลักของระบบ E-Filing", "แบบจำลองระดับแนวคิดเชื่อมผู้ใช้ บทบาท เอกสาร ฉบับ DAR การรับทราบ บันทึก หลักฐาน รอบตรวจ Finding และ CAR/NCR", 700)
    f.text(280, 29, "ความสัมพันธ์ระดับแนวคิด  ·  เอนทิตีหลัก", 23, True)
    # Two linked domains.  N denotes many children per parent; optional links
    # are described in the Chapter 3 prose rather than overstated in the art.
    f.path("M151 110 H205", arrow=False)
    f.path("M120 145 V229", arrow=False)
    f.path("M120 301 V337", arrow=False)
    f.path("M370 301 V337", arrow=False)
    f.path("M120 409 V449", arrow=False)
    f.path("M370 409 V449", arrow=False)
    f.path("M224 265 H250 V597 H285", arrow=False)
    f.box(16, 70, 135, 75, ["User", "UserRole"], focal=True, size=20)
    f.box(205, 70, 340, 75, ["AuditEvent", "ผู้กระทำและบทบาทขณะบันทึก"], size=20)
    f.box(16, 229, 208, 72, ["Document", "เอกสารควบคุม"], size=20)
    f.box(285, 229, 260, 72, ["AuditRound", "รอบตรวจติดตาม"], size=20)
    f.box(16, 337, 208, 72, ["DocumentVersion / File", "ฉบับและไฟล์"], size=18)
    f.box(285, 337, 260, 72, ["Finding", "ประเด็นและแหล่งที่มา"], size=20)
    f.box(16, 449, 208, 72, ["DAR / Acknowledgment", "คำขอและผลรับทราบ"], size=18)
    f.box(285, 449, 260, 72, ["CAR/NCR / ActionPlan", "ใบแก้ไขและแผน"], focal=True, size=18)
    f.box(285, 561, 260, 72, ["QualityRecord / Evidence", "บันทึกและหลักฐาน"], size=18)
    f.text(175, 215, "0..N", 16)
    f.text(175, 325, "1 : N", 16)
    f.text(426, 325, "0..N", 16)
    f.text(175, 435, "DAR อ้างเอกสาร / รับทราบผูกฉบับ", 15)
    f.text(426, 435, "Finding → ใบที่รองรับ", 16)
    f.text(417, 548, "Record อาจอ้าง Document", 15)
    f.text(280, 675, "ภาพย่อกลุ่มข้อมูล; ความสัมพันธ์รายตารางให้ยึด Prisma schema", 17, color=NOTE)
    f.save()


def dar():
    f = Figure("dar-ack-workflow", "ลำดับ DAR และการรับทราบ", "คำขอเอกสารผ่านผู้คุมทะเบียน การทบทวนและอนุมัติแยกตามประเภท การประกาศใช้ แจกจ่ายหรือเรียกคืนก่อนปิด DAR และการรับทราบแยกตามฉบับ", 800)
    f.text(280, 30, "DAR  ·  เส้นทางอนุมัติแยกตามประเภทเอกสาร", 22, True)
    f.path("M280 108 V132")
    f.path("M280 194 V215")
    f.path("M280 275 V298 H148 V315")
    f.path("M280 275 V298 H411 V315")
    f.path("M148 372 V406")
    f.path("M411 372 V406")
    f.path("M148 463 V486 H280 V501")
    f.path("M411 463 V486 H280 V501")
    f.path("M280 562 V588")
    f.path("M280 647 V675")
    f.box(93, 48, 374, 60, ["ผู้ขอส่ง DAR", "สร้างใหม่ / แก้ไข QM QP WI SD FM"], size=19)
    f.box(93, 132, 374, 62, ["ผู้คุมทะเบียนตรวจรับ", "หนึ่งเอกสารต่อใบ"], size=19)
    f.box(148, 215, 264, 60, ["แยกประเภทเอกสาร"], focal=True, size=20)
    f.box(15, 315, 266, 57, ["QM: QMR ทบทวน"], size=20)
    f.box(285, 315, 260, 57, ["อื่น ๆ: รองคณบดีทบทวน"], size=19)
    f.box(15, 406, 266, 57, ["คณบดีอนุมัติ"], size=20)
    f.box(285, 406, 260, 57, ["QMR อนุมัติ"], size=20)
    f.box(93, 501, 374, 61, ["DCC ประกาศใช้ฉบับเอกสาร"], size=20)
    f.box(93, 588, 374, 59, ["แจกจ่าย / เรียกคืนตามกรณี"], size=20)
    f.box(93, 675, 374, 59, ["ผู้คุมทะเบียนตรวจครบและปิด DAR"], focal=True, size=19)
    f.text(280, 763, "แยกต่างหาก: DCC มอบหมายผู้รับทราบต่อฉบับ → ผู้รับยืนยันเอง", 17, color=NOTE)
    f.save()


def car():
    f = Figure("car-ncr-workflow", "วงจร CAR/NCR ถึงรอปิดใบ", "สถานะที่ระบบทดลองรองรับตั้งแต่ OPEN ถึง PENDING_CLOSURE พร้อมส่งกลับเมื่อแผนหรือการตรวจประสิทธิผลไม่ผ่าน โดยไม่มี transition ไป CLOSED", 780)
    f.text(280, 30, "CAR / NCR  ·  วงจรที่ยืนยันในระบบทดลอง", 22, True)
    states = [
        ("OPEN", "เปิดใบจาก Finding ที่รองรับ"),
        ("CORRECTION", "แก้ไขเฉพาะหน้า"),
        ("ANALYSIS_PLANNING", "วิเคราะห์สาเหตุและจัดทำแผน"),
        ("PENDING_PLAN_APPROVAL", "QMR พิจารณาแผน"),
        ("IMPLEMENTING", "ดำเนินกิจกรรมและบันทึกผล"),
        ("PENDING_VERIFICATION", "ตรวจประสิทธิผลโดยผู้มีสิทธิ์"),
        ("PENDING_CLOSURE", "รอข้อยุติเรื่องผู้ปิดใบ"),
    ]
    for i, lines in enumerate(states):
        y = 47 + 94*i
        if i < 6:
            f.path(f"M280 {y+62} V{y+93}")
        f.box(75, y, 410, 62, list(lines), focal=i == 6, size=18)
    # Verified return paths.  Place on opposite margins to keep strokes apart.
    f.path("M75 391 H36 V235 H75", dashed=True)
    f.path("M485 579 H524 V235 H485", dashed=True)
    f.text(54, 320, "แผน", 15, color=NOTE)
    f.text(54, 338, "ไม่ผ่าน", 15, color=NOTE)
    f.text(506, 427, "ตรวจ", 15, color=NOTE)
    f.text(506, 445, "ไม่ผ่าน", 15, color=NOTE)
    f.text(280, 735, "หยุดที่ PENDING_CLOSURE — ยังไม่เปิดใช้การปิดใบ", 19, color=NOTE)
    f.save()


if __name__ == "__main__":
    use_case()
    er()
    dar()
    car()
    print("Created 4 HTML/SVG diagram sources")
