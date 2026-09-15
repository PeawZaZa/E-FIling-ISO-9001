"""Read-only verification of source preservation under the approved merge rules.

Unlike a raw substring comparison, this checks reference rows cell-by-cell,
checks the explicit editorial replacements, and lists every intentional omission.
No output of the merge generator is used as the expected document.
"""
from collections import Counter
from pathlib import Path
import hashlib
import re
from urllib.parse import unquote
from srs_merge_rules import convert, REF_MAP, corrections, DUPLICATE_A_LINES

ROOT = Path(__file__).resolve().parent.parent
DROPPED_GLOSSARY = {'Document / Record','DCC','QMR','Controlled / Uncontrolled Copy',
                    'Active Role','Internal Module Interface'}
EXTRA_GLOSSARY = {'DAR','Document Owner','Reviewer / Approver','Issue / Revision',
                  'Current Version','Copy Holder / Acknowledgement','Approved / Closed DAR',
                  'Audit Trail / Revision History','Provisional / TBD'}

def body(text, heading):
    return re.search(r'^'+re.escape(heading)+r'\n(.*?)(?=^#{1,2} |\Z)',
                     text,re.M|re.S)[1]

def cell(text):
    return text.strip().strip('*`')

def omission(side, section, line, before_intro):
    if before_intro and section != '## Revision History':
        return 'หัวเรื่อง/สารบัญเขียนใหม่ตามใบสั่งงาน §3'
    if before_intro and section == '## Revision History' and not line.startswith('|'):
        return 'เกณฑ์สถานะเดิมใช้สถานะ Working Draft ของฉบับรวมแทน'
    if side=='A' and section.startswith('## 1.2 '):
        # Only duplicated rows and two superseded paragraphs may go. Any other
        # A prose here carries a distinction B never states, so it must surface.
        if line.startswith('|'):
            return 'ใช้ตาราง B และเพิ่มเฉพาะรหัสของ A ตามใบสั่งงาน §3'
        if line.startswith('ใช้ส่วนรหัส `-A-`'):
            return 'อธิบายวิธีรวมเอกสารซึ่งทำเสร็จแล้ว · หมายเหตุ infix ของ B ครอบคลุมแทน'
        if line.startswith('ห้ามนำรหัสสถานะและรหัสบทบาทภาษาอังกฤษ'):
            return 'B §1.2.4 ห้ามข้อเดียวกันและชี้ตำแหน่งตารางจับคู่ได้แล้ว (§4.31)'
        return None
    if side=='A' and section.startswith('## 1.3 '):
        # The additional audience rows and A's caveat MUST be preserved.
        if not line.startswith('|'):
            return None
        if line.startswith('| ผู้ใช้งาน/ผู้รับผิดชอบนโยบาย') or line.startswith('| ผู้จัดทำ/นักวิเคราะห์'):
            return None
        return 'ใช้ผู้อ่าน B และเพิ่มสองกลุ่มที่ไม่ซ้ำตามใบสั่งงาน §3'
    if side=='A' and line in DUPLICATE_A_LINES:
        return 'ซ้ำกับ B เกือบคำต่อคำและอ้าง REF-01 ฉบับเดียวกัน'
    if side=='A' and section.startswith('## 1.5 ') and '`REF-A-14`' in line:
        return 'ตัดเอกสาร B ออกจากทะเบียนภายนอก ตามใบสั่งงาน §2.4'
    if side=='A' and section=='# Appendix A: Glossary' and line.startswith('|'):
        if line.split('|')[1].strip() in DROPPED_GLOSSARY:
            return 'ใช้นิยาม B สำหรับหกแนวคิดที่ซ้ำ ตามใบสั่งงาน §7'
    if line.startswith('End of Software Requirements Specification'):
        return 'ใช้เครื่องหมายจบเล่มรวมเพียงแห่งเดียว'
    return None

def inspect(merged):
    errors=[]; audit=[]; hashes={}
    merged_lines=merged.splitlines()
    refs_body=body(merged,'## 1.5 References')
    ref_rows={int(m[1]):m[0] for m in re.finditer(r'^\| REF-(\d{2}) \|.*$',refs_body,re.M)}
    for side in 'AB':
        path=ROOT/f'Group{side}_SRS_v2.md'
        raw=path.read_bytes(); hashes[path.name]=hashlib.sha256(raw).hexdigest()
        source=raw.decode('utf-8'); section='front'; before=True
        for number,line in enumerate(source.splitlines(),1):
            if line=='# 1. Introduction':before=False
            if re.match(r'^#{1,2} ',line):section=line
            if not line.strip() or line.startswith('#') or re.fullmatch(r'[| :>\-]+',line):
                continue
            transformed=convert(line,side).strip()
            mode=None; reason=None
            # Strong requirement: complete transformed lines must be preserved.
            if transformed in merged:
                mode='exact' if line.strip()==transformed else 'mapped'
            elif line.startswith('|') and section.startswith('## 1.5 ') and re.search(r'REF-(?:A-)?\d+',line):
                n=int(re.search(r'REF-(?:A-)?(\d+)',line)[1])
                if n in REF_MAP[side]:
                    target=ref_rows.get(REF_MAP[side][n],'')
                    values=transformed.strip('|').split('|')
                    if all(cell(c) in target for c in values):mode='reference-cells'
            elif line.startswith('|') and (section=='## Revision History' or
                    (side=='A' and section=='# Appendix A: Glossary')):
                # Changes in column structure are limited to these two sections.
                values=[cell(c) for c in transformed.strip('|').split('|')]
                if any(all(c in target for c in values) for target in merged_lines if target.startswith('|')):
                    mode='table-cells'
            if mode is None:
                reason=omission(side,section,line,before)
                if reason:mode='intentional-omission'
            # Table labels changed because references/glossary gained columns.
            if mode is None and line in [
                    '| รหัส | เอกสาร | การใช้ |','| Ref | เอกสาร | การใช้ในเอกสารนี้ | สถานะการยืนยัน |',
                    '| Term | คำอธิบาย |']:
                mode='table-header';reason='คอลัมน์ตามโครงสร้างทะเบียนรวม'
            if mode is None:
                errors.append(f'{side}:{number} {line[:130]}')
                mode='MISSING'
            audit.append({'side':side,'line':number,'section':section,'mode':mode,
                          'reason':reason,'before':line,'after':transformed if mode!='intentional-omission' else None})

    # Check complete source System Features blocks, so a sentence in another
    # section cannot conceal its deletion from the operative requirement block.
    for side in 'AB':
        source=(ROOT/f'Group{side}_SRS_v2.md').read_text(encoding='utf-8')
        for match in re.finditer(r'^## 4\.\d+ .*?(?=^##? |\Z)',source,re.M|re.S):
            expected=convert(match[0].strip().removesuffix('---').strip(),side)
            if expected not in merged:errors.append('Feature block differs: '+expected.splitlines()[0])

    numeric=re.findall(r'^#{1,6} ([1-6A-F](?:\.\d+)+) ',merged,re.M)
    duplicates=[n for n,count in Counter(numeric).items() if count>1]
    if duplicates:errors.append('Duplicate section numbers: '+', '.join(duplicates))
    if set(ref_rows)!=set(range(1,32)):errors.append('Reference table must contain exactly 01–31')

    # Every added reference file really exists; a placeholder title is insufficient.
    for n,name in {17:'GroupB_TBD_Decisions.md',18:'Module_Interface_Agreement.md',
                   19:'Shared_Role_Registry.md',20:'Design_Assumptions_Register.md'}.items():
        if not (ROOT/name).is_file() or name not in ref_rows.get(n,''):
            errors.append(f'Additional reference missing: {name}')

    registry=(ROOT/'Shared_Role_Registry.md').read_text(encoding='utf-8')
    table=re.search(r'^\| # \|.*?(?=\n\n)',registry,re.M|re.S)[0]
    role_body=body(merged,'## 2.3 User Classes and Characteristics')
    if table not in role_body:errors.append('Central role table differs from the signed-off registry')
    interface=(ROOT/'Module_Interface_Agreement.md').read_text(encoding='utf-8')
    for key in ['Q1','Q5']:
        block=re.search(r'^### '+key+r' .*?(?=^### |^## |\Z)',interface,re.M|re.S)[0]
        tables=re.findall(r'(?:^\|[^\n]*\n?)+',block,re.M)
        if tables[1].strip() not in merged:errors.append(f'Missing agreed safeguards: {key}')

    images=re.findall(r'!\[[^\]]*\]\(([^)]+)\)',merged)
    for image in images:
        if not (ROOT/unquote(image)).is_file():errors.append('Image missing: '+image)
    if len(images)!=9:errors.append('Expected all nine source image links')

    return {'errors':errors,'source_sha256':hashes,'lines':audit,
            'summary':dict(Counter(row['mode'] for row in audit)),
            'reference_mentions':len(re.findall(r'(?<![-\w])REF-\d{2}\b',merged)),
            'images':len(images)}


def mutation_checks(merged):
    """Prove the checks fail on damage; runs on in-memory copies only."""
    import check_merged_srs as gate
    results = {}
    for name, (before, after) in {
            'missing_FR_A_20_1': ('| FR-A-20.1 |', '| FR-A-20.9 |'),
            'wrong_reference_in_feature': ('`REF-02` §6.2', '`REF-03` §6.2'),
            'altered_role_registry': ('| **หัวหน้างาน**', '| **หัวหน้าแผนก**'),
            'missing_Q1_safeguard': ('| **ห้ามปลอมลายมือชื่อ** |', '| **หมายเหตุ** |'),
            'broken_image': ('a1_system_context.svg', 'a1_missing.svg'),
            'duplicate_section_number': ('## 4.31 ', '## 4.30 '),
    }.items():
        damaged = merged.replace(before, after, 1)
        results[name] = 'PASS (detected)' if damaged != merged and inspect(damaged)['errors'] \
            else 'FAIL (not detected)'
    for name, (before, after) in {
            'stale_unmerged_wording': ('เอกสารอยู่ในสถานะ **Working Draft**', 'ฉบับ 0.1 นี้เป็น **Working Draft**'),
            'group_instead_of_module': ('โมดูลตรวจติดตามและใบคำร้องไม่สำเร็จ', 'โมดูลกลุ่ม B ไม่สำเร็จ'),
            'one_sided_toc_row': ('`TBD-A-xx` และ `TBD-B-xx`', '`TBD-B-xx`'),
            'dropped_restored_content': ('Scanner integration หรือ OCR', 'อุปกรณ์ต่อพ่วง'),
    }.items():
        damaged = merged.replace(before, after, 1)
        gate.results.clear()
        gate.check_merged_voice(damaged)
        caught = any(not ok for _, ok, _ in gate.results)
        results[name] = 'PASS (detected)' if damaged != merged and caught else 'FAIL (not detected)'
    gate.results.clear()
    return results


if __name__ == '__main__':
    import json
    merged = (ROOT / 'SRS_v1.md').read_text(encoding='utf-8')
    report = inspect(merged)
    report['mutation_checks'] = mutation_checks(merged)
    (ROOT / 'SRS_Merge_Audit.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
    print('errors:', len(report['errors']), '· summary:', report['summary'])
    print('mutation checks:', report['mutation_checks'])
