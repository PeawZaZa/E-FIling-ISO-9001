#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""ตรวจไฟล์ SRS ฉบับรวม ว่ารวมครบและไม่มีอะไรหายไประหว่างทาง

วิธีใช้
    python scripts/check_merged_srs.py SRS_v1.md                 ตรวจเต็ม
    python scripts/check_merged_srs.py SRS_v1.md --partial       ตรวจระหว่างทำ ข้ามด่านที่ต้องรอไฟล์ครบ
    python scripts/check_merged_srs.py GroupB_SRS_v2.md --structure-only
                                                                 ตรวจเฉพาะโครงสร้าง ใช้ทดสอบตัวสคริปต์เอง

ด่านตรวจ
    1. รหัสความต้องการครบทุกตระกูล เทียบกับไฟล์ต้นฉบับทีละรหัส
    2. เลขอ้างอิง REF เรียงใหม่ถูกต้อง ไม่มีของเดิมหลงเหลือ
    3. ลิงก์ยึดหัวข้อชี้ตรง
    4. ตารางมาร์กดาวน์ไม่พัง
    5. ข้อความไม่หาย ตรวจทุกบรรทัดยาวของต้นฉบับว่ายังอยู่ในไฟล์รวม
    6. หัวข้อ 4.1 ถึง 4.31 ครบ

หมายเหตุสำคัญ
    การตัดชื่อหัวข้อให้เป็น anchor ห้ามใช้ str.isalnum() เพราะวรรณยุกต์และสระไทย
    อยู่ในหมวด Unicode Mn ซึ่ง isalnum() คืนค่าเท็จ ทำให้ตัดอักษรทิ้งแล้วรายงานผิด
"""

import io
import os
import re
import sys
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC_A = os.path.join(ROOT, 'GroupA_SRS_v2.md')
SRC_B = os.path.join(ROOT, 'GroupB_SRS_v2.md')

FAMILIES = ['FR', 'NFR', 'BR', 'CON', 'US', 'UC', 'AC', 'M', 'TBD']
EXPECTED_REF_CODES = 31
EXPECTED_REF_MENTIONS = 320
EXPECTED_GLOSSARY = 42
EXPECTED_ROLES = 14
EXPECTED_FEATURES = 31
APPROVED_MERGE = False

ANCHOR_PUNCT = '`—–"“”\'().,:;/?!*[]{}<>|&%#@+=~^$\\'

results = []


def out(s=''):
    sys.stdout.write(s + '\n')


def record(name, ok, detail=''):
    results.append((name, ok, detail))
    mark = 'PASS' if ok else 'FAIL'
    out('[%s] %s' % (mark, name))
    if detail:
        for line in detail.splitlines():
            out('       ' + line)


def read(path):
    with io.open(path, encoding='utf-8') as fh:
        return fh.read()


def slug(heading):
    """แปลงชื่อหัวข้อเป็น anchor แบบ GitHub โดยตัดเฉพาะเครื่องหมายวรรคตอนตามบัญชี"""
    text = heading.strip().lower()
    text = ''.join(ch for ch in text if ch not in ANCHOR_PUNCT)
    return '#' + text.replace(' ', '-')


def ids(text, family, side):
    return set(re.findall(r'\b%s-%s-\d+(?:\.\d+)?\b' % (family, side), text))


# ---------- ด่าน 1 : รหัสความต้องการ ----------

def check_ids(merged, partial=False):
    a, b = read(SRC_A), read(SRC_B)
    if partial:
        done = sum(len(ids(merged, f, s)) for f in FAMILIES for s in 'AB')
        total = (sum(len(ids(a, f, 'A')) for f in FAMILIES)
                 + sum(len(ids(b, f, 'B')) for f in FAMILIES))
        out('[ ..  ] ด่าน 1 รหัสความต้องการ — ระหว่างทาง ยกมาแล้ว %d จาก %d รหัส' % (done, total))
        return
    missing, extra = [], []
    for fam in FAMILIES:
        for side, src in (('A', a), ('B', b)):
            want = ids(src, fam, side)
            got = ids(merged, fam, side)
            lost = sorted(want - got)
            new = sorted(got - want)
            if lost:
                missing.append('%s-%s: หาย %d ตัว -> %s' % (fam, side, len(lost), ', '.join(lost[:12])))
            if new:
                extra.append('%s-%s: เกิน %d ตัว -> %s' % (fam, side, len(new), ', '.join(new[:12])))
    detail = '\n'.join(missing + extra)
    record('ด่าน 1 รหัสความต้องการครบทุกตระกูล', not detail, detail)


# ---------- ด่าน 2 : เลขอ้างอิง ----------

def check_refs(merged, partial):
    leftovers = re.findall(r'\bREF-[AB]-\d+\b', merged)
    record('ด่าน 2.1 ไม่มี REF-A-* หรือ REF-B-* หลงเหลือ',
           not leftovers,
           '' if not leftovers else 'พบ %d จุด เช่น %s' % (len(leftovers), ', '.join(sorted(set(leftovers))[:10])))

    mentions = re.findall(r'(?<![-\w])REF-(\d{2})\b', merged)
    codes = sorted(set(int(m) for m in mentions))
    out_of_range = [c for c in codes if c < 1 or c > EXPECTED_REF_CODES]
    record('ด่าน 2.2 ไม่มีเลขอ้างอิงนอกช่วง 01-31',
           not out_of_range,
           '' if not out_of_range else 'นอกช่วง: %s' % out_of_range)

    if partial:
        out('       (ระหว่างทาง) รหัสที่พบแล้ว %d ตัว · จุดที่อ้าง %d จุด' % (len(codes), len(mentions)))
        return

    record('ด่าน 2.3 มีรหัสอ้างอิงครบ 31 ตัว',
           len(codes) == EXPECTED_REF_CODES,
           'พบ %d ตัว · ขาด %s' % (len(codes), sorted(set(range(1, 32)) - set(codes))))
    record('ด่าน 2.4 จำนวนจุดที่อ้างอิงเท่ากับ %d' % EXPECTED_REF_MENTIONS,
           len(mentions) == EXPECTED_REF_MENTIONS,
           'พบ %d จุด (ต่างจากที่ควรได้ %+d)' % (len(mentions), len(mentions) - EXPECTED_REF_MENTIONS))


# ---------- ด่าน 3 : ลิงก์ยึดหัวข้อ ----------

def check_anchors(merged):
    headings = set()
    for line in merged.splitlines():
        m = re.match(r'^#{1,6}\s+(.*)$', line)
        if m:
            headings.add(slug(m.group(1)))
    broken = []
    for target in re.findall(r'\]\((#[^)]+)\)', merged):
        if target.lower() not in headings:
            broken.append(target)
    record('ด่าน 3 ลิงก์ยึดหัวข้อชี้ตรงทุกอัน',
           not broken,
           '' if not broken else 'เสีย %d อัน เช่น %s' % (len(broken), ', '.join(broken[:8])))


# ---------- ด่าน 4 : ตารางมาร์กดาวน์ ----------

def check_tables(merged):
    problems = []
    block = []
    start = 0
    for no, line in enumerate(merged.splitlines(), 1):
        if line.lstrip().startswith('|'):
            if not block:
                start = no
            block.append((no, line))
            continue
        if block:
            problems.extend(scan_table(block, start))
            block = []
    if block:
        problems.extend(scan_table(block, start))
    record('ด่าน 4 ตารางมาร์กดาวน์ไม่พัง',
           not problems,
           '\n'.join(problems[:15]))


def scan_table(block, start):
    problems = []
    widths = []
    for no, line in block:
        stripped = line.rstrip()
        if not stripped.endswith('|'):
            problems.append('บรรทัด %d ไม่ได้ลงท้ายด้วย | -> %s' % (no, stripped[:48]))
            continue
        widths.append((no, len(stripped.split('|'))))
    if widths:
        common = max(set(w for _, w in widths), key=[w for _, w in widths].count)
        for no, w in widths:
            if w != common:
                problems.append('บรรทัด %d มี %d คอลัมน์ ตารางนี้ใช้ %d (ตารางเริ่มบรรทัด %d)'
                                % (no, w - 2, common - 2, start))
    return problems


# ---------- ด่าน 5 : ข้อความหาย ----------

def normalise(text):
    """ลบสิ่งที่ตั้งใจให้เปลี่ยนระหว่างรวมเล่มออก เหลือแต่ถ้อยคำที่ต้องเหมือนเดิม"""
    text = re.sub(r'REF-[AB]-\d+', 'REF-X', text)
    text = re.sub(r'REF-\d+', 'REF-X', text)
    text = re.sub(r'§\s?4\.\d+', '§4.X', text)
    return re.sub(r'\s+', ' ', text).strip()


def check_text_loss(merged, partial=False):
    """ตรวจทุกบรรทัดที่ยาวเกิน 60 อักขระ ไม่ใช่การสุ่ม จึงจับการเรียบเรียงใหม่ได้ครบ"""
    if APPROVED_MERGE and not partial:
        from srs_merge_audit import inspect
        audit = inspect(merged)
        record('ด่าน 5 ข้อความครบตามแผนที่และข้อยกเว้นที่อนุญาต (ตรวจทุกบรรทัดเนื้อหา)',
               not audit['errors'],
               '\n'.join(audit['errors'][:20]) if audit['errors'] else
               'ตรวจ %d บรรทัดเนื้อหา · %s · ตรวจบล็อก Features เต็มทั้ง 31 หัวข้อด้วย'
               % (len(audit['lines']), audit['summary']))
        return
    haystack = normalise(merged)
    if partial:
        done = total = 0
        for path in (SRC_A, SRC_B):
            lines = [l for l in read(path).splitlines() if len(l.strip()) > 60]
            total += len(lines)
            done += sum(1 for l in lines if normalise(l) in haystack)
        out('[ ..  ] ด่าน 5 ข้อความ — ระหว่างทาง ยกมาแล้ว %d จาก %d บรรทัดยาว' % (done, total))
        return
    report = []
    for label, path in (('ควบคุมเอกสาร', SRC_A), ('กลุ่ม B', SRC_B)):
        lines = [l for l in read(path).splitlines() if len(l.strip()) > 60]
        lost = [l for l in lines if normalise(l) not in haystack]
        if lost:
            report.append('ฝั่ง%s หาย %d จาก %d บรรทัด' % (label, len(lost), len(lines)))
            for l in lost[:8]:
                report.append('    ' + l.strip()[:90])
    record('ด่าน 5 ข้อความไม่หายและไม่ถูกเรียบเรียงใหม่',
           not report,
           '\n'.join(report))


# ---------- ด่าน 6 : หัวข้อ 4 ----------

def check_features(merged, partial):
    found = sorted(set(int(m) for m in re.findall(r'^##\s+4\.(\d+)\s', merged, re.M)))
    want = list(range(1, EXPECTED_FEATURES + 1))
    if partial:
        out('       (ระหว่างทาง) หัวข้อ 4.x ที่มีแล้ว %d หัวข้อ' % len(found))
        return
    missing = [n for n in want if n not in found]
    extra = [n for n in found if n not in want]
    detail = ''
    if missing:
        detail += 'ขาด: %s\n' % ', '.join('4.%d' % n for n in missing)
    if extra:
        detail += 'เกิน: %s' % ', '.join('4.%d' % n for n in extra)
    record('ด่าน 6 หัวข้อ 4.1 ถึง 4.31 ครบ', not detail, detail)


# ---------- ด่านนับอื่น ๆ ----------

def check_counts(merged):
    gloss = merged.split('# Appendix A: Glossary')
    if len(gloss) > 1:
        body = gloss[1].split('# Appendix B')[0]
        rows = [l for l in body.splitlines()
                if l.startswith('| ') and not l.startswith('| :') and not l.startswith('| ---')]
        n = max(0, len(rows) - 1)
        record('ด่าน 7 อภิธานศัพท์ %d คำ' % EXPECTED_GLOSSARY, n == EXPECTED_GLOSSARY, 'พบ %d คำ' % n)
    else:
        record('ด่าน 7 อภิธานศัพท์ %d คำ' % EXPECTED_GLOSSARY, False, 'ไม่พบหัวข้อ Appendix A: Glossary')

    roles = re.findall(r'^\|\s*\d+\s*\|\s*`[A-Z_]+`', merged, re.M)
    record('ด่าน 8 ตารางบทบาท 14 แถว', len(roles) == EXPECTED_ROLES, 'พบ %d แถว' % len(roles))


# ---------- ด่าน 9-12 : กันข้อบกพร่องของรอบ v1.0 กลับมา ----------

# ถ้อยคำที่บอกว่าเอกสารยังเป็นฉบับแยกโมดูล ขัดกับเล่มที่รวมแล้ว
STALE_PHRASES = ['ไม่ใช่ SRS ฉบับสมบูรณ์', 'อยู่นอกเอกสารนี้', 'ฉบับเดียวในภายหลัง',
                 'SRS รวมของระบบในภายหลัง', 'ฉบับ 0.1']

# เนื้อหาของโมดูลควบคุมเอกสารที่รอบ v1.0 ทำตกหล่น กู้กลับแล้วใน v1.1
RESTORED_MARKERS = ['Scanner integration หรือ OCR',
                    'ระดับความจำเป็นกับสถานะการยืนยัน',
                    'ถือครอง/รับสำเนา',
                    'ตารางนี้เป็นกลุ่มผู้อ่าน']

# หัวคอลัมน์ของทะเบียนบทบาทกลางยกมาตรงตัวจาก Shared_Role_Registry.md ซึ่งเป็น
# เอกสารร่วมของสองทีม แก้ที่ต้นทางเท่านั้น ไม่แก้ตอนรวมเล่ม
ROLE_REGISTRY_HEADER = 'ฝั่ง A เคยเรียก'


def check_merged_voice(merged):
    found = [p for p in STALE_PHRASES if p in merged]
    record('ด่าน 9 ไม่มีถ้อยคำที่บอกว่ายังไม่ได้รวมเล่ม',
           not found, 'พบ: ' + ', '.join(found))

    lines = [l for l in merged.splitlines()
             if 'โมดูลกลุ่ม' in l and ROLE_REGISTRY_HEADER not in l]
    record('ด่าน 10 เรียกชื่อโมดูล ไม่ใช้คำว่ากลุ่ม',
           not lines, '\n'.join(l[:90] for l in lines[:5]))

    toc = merged.split('## Revision History')[0]
    rows = {letter: next((l for l in toc.splitlines()
                          if l.startswith('| **Appendix %s**' % letter)), '')
            for letter in 'CD'}
    bad = [letter for letter, l in rows.items()
           if not ('-A-' in l and '-B-' in l)]
    record('ด่าน 11 สารบัญภาคผนวก C และ D อ้างรหัสทั้งสองโมดูล',
           not bad, 'แถวที่ยังอ้างโมดูลเดียว: ' + ', '.join(bad))

    missing = [m for m in RESTORED_MARKERS if m not in merged]
    record('ด่าน 12 เนื้อหาโมดูลควบคุมเอกสารที่กู้กลับยังอยู่ครบ',
           not missing, 'หายไป: ' + ', '.join(missing))


def main():
    global APPROVED_MERGE, EXPECTED_REF_MENTIONS, EXPECTED_GLOSSARY
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = set(a for a in sys.argv[1:] if a.startswith('--'))
    if not args:
        out(__doc__)
        return 2

    target = args[0] if os.path.isabs(args[0]) else os.path.join(ROOT, args[0])
    if not os.path.exists(target):
        out('ไม่พบไฟล์: %s' % target)
        return 2

    merged = read(target)
    partial = '--partial' in flags
    structure_only = '--structure-only' in flags
    APPROVED_MERGE = os.path.basename(target) == 'SRS_v1.md' or '--merged-v1' in flags
    if APPROVED_MERGE:
        # Source total 323, not "body references": includes register rows/history.
        # Remove 3 A->B references (1 row + 2 internalised citations), deduplicate
        # 3 shared register rows, add 4 new register rows and 6 editorial citations.
        # Expand two non-contiguous reference ranges after mapping (+3 A, +2 B).
        # v1.1 drops A's duplicated §2.4 browser bullet, which cited REF-A-15
        # (REF-01) — the same manual B already cites on its own copy of the line.
        source_total = sum(len(re.findall(r'\bREF-(?:A-)?\d{2}\b',read(p)))
                           for p in (SRC_A,SRC_B))
        EXPECTED_REF_MENTIONS = source_total - 3 - 3 + 4 + 6 + 5 - 1
        # B has 32 glossary entries, verified against the actual source; A adds 9.
        source_gloss = read(SRC_B).split('# Appendix A: Glossary')[1].split('# Appendix B')[0]
        source_rows = [l for l in source_gloss.splitlines() if l.startswith('|')]
        EXPECTED_GLOSSARY = len(source_rows) - 2 + 9

    out('ตรวจไฟล์: %s (%d บรรทัด)' % (os.path.basename(target), merged.count('\n') + 1))
    if partial:
        out('โหมด: ระหว่างทาง — ข้ามด่านที่ต้องรอไฟล์ครบ')
    if structure_only:
        out('โหมด: เฉพาะโครงสร้าง — ใช้ทดสอบตัวสคริปต์เอง')
    if APPROVED_MERGE:
        out('เกณฑ์ฉบับรวมที่อนุญาต: REF %d จุด · อภิธานศัพท์ %d คำ · ดู SRS_Merge_Report.md'
            % (EXPECTED_REF_MENTIONS, EXPECTED_GLOSSARY))
    out('-' * 64)

    check_anchors(merged)
    check_tables(merged)

    if not structure_only:
        check_ids(merged, partial)
        check_refs(merged, partial)
        check_text_loss(merged, partial)
        check_features(merged, partial)
        if not partial:
            check_counts(merged)
            if APPROVED_MERGE:
                check_merged_voice(merged)

    out('-' * 64)
    failed = [n for n, ok, _ in results if not ok]
    if failed:
        out('ไม่ผ่าน %d ด่าน จาก %d ด่าน' % (len(failed), len(results)))
        return 1
    out('ผ่านครบ %d ด่าน' % len(results))
    return 0


if __name__ == '__main__':
    sys.exit(main())
