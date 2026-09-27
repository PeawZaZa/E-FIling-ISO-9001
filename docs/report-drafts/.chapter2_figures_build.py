"""Task-local Chapter 2 figure builder. HTML files are the editable sources."""

from __future__ import annotations

from html import escape
from pathlib import Path


OUT = Path(__file__).resolve().parent / ".chapter2-figures"
BLUE = "#1e40af"
MID = "#2563eb"
LIGHT = "#dbeafe"
PALE = "#eff6ff"
INK = "#172554"
AMBER = "#b45309"


class Diagram:
    def __init__(self, slug: str, title: str, desc: str, height: int):
        self.slug, self.title, self.desc, self.height = slug, title, desc, height
        self.edges: list[str] = []
        self.shapes: list[str] = []

    def arrow(self, x1: int, y1: int, x2: int, y2: int, dashed=False):
        dash = ' stroke-dasharray="7 5"' if dashed else ""
        self.edges.append(
            f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{MID}" '
            f'stroke-width="2.5"{dash} marker-end="url(#{self.slug}-arrow)"/>'
        )

    def elbow(self, x1: int, y1: int, x2: int, y2: int, dashed=False):
        mid = (x1 + x2) // 2
        dash = ' stroke-dasharray="7 5"' if dashed else ""
        self.edges.append(
            f'<path d="M{x1} {y1} H{mid-8} Q{mid} {y1} {mid} {y1+8} '
            f'V{y2-8} Q{mid} {y2} {mid+8} {y2} H{x2}" fill="none" '
            f'stroke="{MID}" stroke-width="2.5"{dash} marker-end="url(#{self.slug}-arrow)"/>'
        )

    def box(self, x: int, y: int, w: int, h: int, lines: list[str], fill=PALE, focal=False):
        border = BLUE if focal else "#93c5fd"
        text_fill = INK
        self.shapes.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" '
            f'fill="{fill}" stroke="{border}" stroke-width="2"/>'
        )
        gap = 29
        start = y + (h - gap * (len(lines) - 1)) / 2 + 8
        for i, value in enumerate(lines):
            self.shapes.append(
                f'<text x="{x+w/2}" y="{start+i*gap:.0f}" text-anchor="middle" '
                f'font-family="TH Sarabun New, Sarabun, Tahoma, sans-serif" '
                f'font-size="23" font-weight="{700 if i == 0 else 400}" '
                f'fill="{text_fill}">{escape(value)}</text>'
            )

    def note(self, x: int, y: int, value: str, color=AMBER):
        self.shapes.append(
            f'<text x="{x}" y="{y}" text-anchor="middle" '
            f'font-family="TH Sarabun New, Sarabun, Tahoma, sans-serif" '
            f'font-size="23" fill="{color}">{escape(value)}</text>'
        )

    def save(self):
        title = escape(self.title)
        desc = escape(self.desc)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="560" height="{self.height}" '
            f'viewBox="0 0 560 {self.height}" role="img" '
            f'aria-labelledby="{self.slug}-title {self.slug}-desc">'
            f'<title id="{self.slug}-title">{title}</title>'
            f'<desc id="{self.slug}-desc">{desc}</desc>'
            f'<defs><marker id="{self.slug}-arrow" markerWidth="9" markerHeight="7" '
            f'refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" '
            f'fill="{MID}"/></marker></defs>'
            '<rect x="0" y="0" width="560" height="100%" fill="#ffffff"/>'
            + "".join(self.edges) + "".join(self.shapes) + "</svg>"
        )
        page = (
            '<!doctype html><html lang="th"><head><meta charset="utf-8">'
            f'<title>{title}</title><style>body{{margin:0;background:white}}'
            'svg{display:block;width:560px;height:auto}</style></head><body>'
            f'{svg}</body></html>'
        )
        (OUT / f"{self.slug}.html").write_text(page, encoding="utf-8")


def vertical(slug: str, title: str, desc: str, rows: list[list[str]],
             note: str | None = None, skip_last_arrow: bool = False):
    h = 20 + len(rows) * 63 + (len(rows) - 1) * 13 + (50 if note else 15)
    d = Diagram(slug, title, desc, h)
    for i in range(len(rows) - 1):
        if skip_last_arrow and i == len(rows) - 2:
            continue
        y = 20 + i * 76
        d.arrow(280, y + 63, 280, y + 74)
    for i, lines in enumerate(rows):
        d.box(42, 20 + i * 76, 476, 63, lines, LIGHT if i in (0, len(rows)-1) else PALE,
              focal=i == len(rows)-1)
    if note:
        d.note(280, h-17, note)
    d.save()


def make_pdca():
    d = Diagram("pdca-unified", "PDCA กับงานในระบบ E-Filing เดียว",
                "สี่ช่วงของ PDCA ที่มีงานเอกสาร หลักฐาน การตรวจติดตาม และใบแก้ไขในระบบเดียว", 365)
    d.arrow(265, 95, 295, 95)
    d.arrow(410, 153, 410, 207)
    d.arrow(295, 265, 265, 265)
    d.arrow(150, 207, 150, 153)
    d.box(30, 35, 235, 118, ["Plan วางแผน", "เอกสารควบคุม / DAR"], LIGHT)
    d.box(295, 35, 235, 118, ["Do ปฏิบัติ", "รับทราบ / Records", "และ Evidence"], PALE)
    d.box(295, 207, 235, 118, ["Check ตรวจสอบ", "Audit / Finding"], LIGHT)
    d.box(30, 207, 235, 118, ["Act ปรับปรุง", "CAR / NCR"], PALE, True)
    d.save()


def make_dar():
    vertical("dar-ack", "วงจรเอกสาร DAR และการรับทราบ",
             "คำขอเอกสารผ่านตรวจรับ ทบทวน อนุมัติ ประกาศใช้ แจกจ่ายหรือเรียกคืนก่อนปิด และการรับทราบแยกตามฉบับ",
             [["คำขอสร้างหรือแก้ไขเอกสาร / DAR"], ["ตรวจรับ → ทบทวน → อนุมัติ"],
              ["ประกาศใช้ฉบับเอกสาร"], ["แจกจ่าย / เรียกคืนตามกรณี"],
              ["ปิด DAR"], ["มอบหมายและยืนยันรับทราบต่อฉบับ"]],
             "การรับทราบเนื้อหาไม่ใช่การรับสำเนา", skip_last_arrow=True)


def make_audit():
    d = Diagram("audit-finding", "หลักฐานและเกณฑ์ของ Finding",
                "รอบตรวจเชื่อมเกณฑ์ เอกสาร และหลักฐานเพื่อบันทึก Finding ที่ตรวจสอบที่มาได้", 358)
    d.arrow(280, 88, 280, 122)
    d.arrow(280, 198, 280, 232)
    d.box(44, 25, 472, 63, ["รอบตรวจ / ขอบเขต / ทีมผู้ตรวจ"], LIGHT)
    d.box(44, 122, 472, 76, ["เกณฑ์และเอกสารอ้างอิง", "Record / Evidence ที่เกี่ยวข้อง"], PALE)
    d.box(44, 232, 472, 76, ["Finding พร้อมหลักฐานและที่มา"], LIGHT, True)
    d.note(280, 339, "การเปิด CAR/NCR ขึ้นกับแหล่ง Finding ที่รองรับ")
    d.save()


def make_car():
    vertical("car-pending-closure", "วงจร CAR NCR ของระบบทดลอง",
             "เจ็ดสถานะที่ยืนยันจาก OPEN ถึง PENDING_CLOSURE โดยไม่มีการอ้างว่าปิดใบสมบูรณ์",
             [["OPEN", "เปิดใบจาก Finding"], ["CORRECTION", "แก้ไขเฉพาะหน้า"],
              ["ANALYSIS_PLANNING", "วิเคราะห์สาเหตุและจัดทำแผน"],
              ["PENDING_PLAN_APPROVAL", "รอ QMR อนุมัติแผน"],
              ["IMPLEMENTING", "บันทึกผลและหลักฐาน"],
              ["PENDING_VERIFICATION", "ตรวจประสิทธิผล"],
              ["PENDING_CLOSURE", "รอปิดใบ ไม่ใช่ CLOSED"]],
             "ผู้ลงนามปิดใบและเส้นทางปิดยังต้องยืนยัน")


def make_rbac():
    d = Diagram("rbac-unified", "หลักการควบคุมสิทธิ์ตามบทบาท",
                "ผู้ใช้เชื่อมกับบทบาท บทบาทกำหนดสิทธิ์ และงานบางขั้นตรวจความเกี่ยวข้องกับรายการและการแยกหน้าที่", 280)
    d.arrow(178, 103, 191, 103)
    d.arrow(369, 103, 382, 103)
    d.box(20, 50, 158, 106, ["ผู้ใช้", "User"], LIGHT)
    d.box(191, 50, 178, 106, ["บทบาท", "Role"], PALE, True)
    d.box(382, 50, 158, 106, ["สิทธิ์", "Permission"], LIGHT)
    d.note(280, 213, "บางขั้นตรวจผู้เกี่ยวข้องกับรายการด้วย")
    d.note(280, 248, "ผู้จัดทำแผนไม่อนุมัติตนเอง")
    d.save()


def make_architecture():
    d = Diagram("architecture-unified", "สถาปัตยกรรมระบบ E-Filing เดียว",
                "ผู้ใช้เข้าถึงเว็บแอป React เชื่อม API Express ที่ใช้งาน PostgreSQL และพื้นที่เก็บไฟล์ภายในระบบ E-Filing เดียว", 510)
    d.arrow(280, 82, 280, 111)
    d.arrow(280, 184, 280, 218)
    d.arrow(154, 296, 154, 334)
    d.arrow(406, 296, 406, 334)
    d.box(42, 20, 476, 62, ["ผู้ใช้ตามบทบาท"], LIGHT)
    d.box(42, 111, 476, 73, ["เว็บแอปพลิเคชัน React / Vite"], LIGHT)
    d.box(42, 218, 476, 78, ["API Express / TypeScript", "เอกสาร DAR Audit CAR/NCR Dashboard"], PALE, True)
    d.box(42, 334, 224, 100, ["PostgreSQL", "ข้อมูลและความสัมพันธ์"], LIGHT)
    d.box(294, 334, 224, 100, ["ที่เก็บไฟล์", "เอกสารและหลักฐาน"], LIGHT)
    d.note(280, 482, "ทุกโมดูลอยู่ในระบบ E-Filing เดียว")
    d.save()


def make_data_model():
    d = Diagram("data-relations-unified", "ความสัมพันธ์ข้อมูลระดับแนวคิด",
                "สายเอกสาร ฉบับ DAR และการรับทราบสัมพันธ์กับสาย Record Evidence Audit Finding และ CAR NCR ในระบบเดียว", 448)
    d.arrow(280, 91, 280, 119)
    d.arrow(280, 287, 280, 315)
    d.box(45, 21, 470, 70, ["Document / Revision"], LIGHT)
    d.box(45, 119, 470, 70, ["DAR / Acknowledgement ต่อฉบับ"], PALE)
    d.box(45, 217, 470, 70, ["Record / Evidence"], LIGHT)
    d.box(45, 315, 470, 70, ["Audit / Finding; CAR / NCR ตามกรณี"], PALE, True)
    d.note(280, 426, "แสดงความสัมพันธ์เชิงแนวคิด ไม่ใช่ตารางฐานข้อมูล")
    d.save()


def make_dashboard():
    d = Diagram("dashboard-unified", "การรวบรวมข้อมูลแดชบอร์ดหกหมวด",
                "ข้อมูลหกหมวดผ่านการจำกัดสิทธิ์ของผู้ใช้ก่อนคำนวณเป็นการ์ด รายการ และกราฟพื้นฐาน", 420)
    d.arrow(280, 321, 280, 346)
    domains = [(["Documents", "DAR"], 25, 24), (["Acknowledgement", "Records / Evidence"], 285, 24),
               (["Audit / Finding", "CAR / NCR"], 25, 137), (["ข้อมูลในระบบเดียว"], 285, 137)]
    for lines, x, y in domains:
        d.box(x, y, 250, 88, lines, LIGHT if y == 24 else PALE)
    d.box(42, 251, 476, 70, ["กรองข้อมูลตามสิทธิ์ก่อนสรุป"], PALE, True)
    d.box(42, 346, 476, 65, ["การ์ด / รายการ / กราฟพื้นฐาน"], LIGHT)
    d.save()


def make_traceability():
    vertical("traceability-unified", "เส้นทางตรวจสอบย้อนกลับของ E-Filing",
             "เอกสารและฉบับสัมพันธ์กับบันทึกหรือหลักฐาน Finding และ CAR NCR ที่ตรวจไปถึงรอปิดใบได้",
             [["เอกสารและฉบับที่อ้างอิง"], ["Record / Evidence"],
              ["Audit / Finding"], ["CAR / NCR และหลักฐานการแก้ไข"],
              ["PENDING_CLOSURE — รอปิดใบ"]],
             "Audit Trail บันทึกผู้ดำเนินการและเวลา")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for make in (make_pdca, make_dar, make_audit, make_car, make_rbac,
                 make_architecture, make_data_model, make_dashboard, make_traceability):
        make()
    print(f"Created {len(list(OUT.glob('*.html')))} HTML diagrams in {OUT}")


if __name__ == "__main__":
    main()
