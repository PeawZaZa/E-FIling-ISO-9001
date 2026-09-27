"""Explicit, source-specific editorial rules for the approved SRS merge.

Requirement identifiers and external document section numbers are immutable.
The original module files remain the input, never the output of these rules.
"""
import re

REF_MAP = {
    'A': {1:15,2:13,3:9,4:11,5:2,6:5,7:6,8:7,9:8,10:27,11:28,12:29,13:30,15:1,16:16},
    'B': {1:10,2:12,3:14,4:21,5:22,6:23,7:24,8:25,9:26,10:15,11:3,12:4,13:2,14:1,15:31},
}

# Exact replacements, reviewed individually; kept separate from mechanical maps.
corrections = {
    'A': {
        '`REF-A-05` ถึง `REF-A-09` และ `REF-A-15`':
        '`REF-A-05`, `REF-A-06`, `REF-A-07`, `REF-A-08`, `REF-A-09` และ `REF-A-15`',
        '**รายการข้อมูลขั้นต่ำสองทิศทาง — ยึดตาม `REF-A-14` §3.3.1 เป็นฐานการเจรจา** (`TBD-A-08`)':
        '**รายการข้อมูลขั้นต่ำสองทิศทาง — ยึดตาม §3.3.3 ของเอกสารฉบับนี้** (`TBD-A-08`)',
        '**ตรงกับ `REF-A-14` §3.3.2 เพื่อให้สองโมดูลมีพฤติกรรมเหมือนกัน**':
        '**ตรงกับ §3.3.5 ของเอกสารฉบับนี้ เพื่อให้สองโมดูลมีพฤติกรรมเหมือนกัน**',
        # The per-module scope note contradicts the merged volume it now sits in.
        'ขอบเขตของเอกสารฉบับนี้จำกัดเฉพาะส่วนความรับผิดชอบของกลุ่ม A ซึ่งทำงานร่วมกับโมดูลของกลุ่ม B ภายในระบบเดียวกัน โดยใช้ข้อมูลและกติกาส่วนร่วมอย่างสอดคล้องกัน เอกสารฉบับนี้จะใช้ประกอบการจัดทำ SRS รวมของระบบในภายหลัง':
        'หัวข้อนี้เป็นจุดประสงค์เดิมของโมดูลควบคุมเอกสาร ซึ่งรวมเข้าเป็นส่วนหนึ่งของเอกสารฉบับนี้แล้ว โมดูลนี้ทำงานร่วมกับโมดูลตรวจติดตามและใบคำร้องภายในระบบเดียวกัน โดยใช้ข้อมูลและกติกาส่วนร่วมอย่างสอดคล้องกัน',
        '| `OBJ-A-1.2.x` | วัตถุประสงค์ของโครงงานตามหัวข้อ 1.2.x ในบทที่ 1 ของกลุ่ม A |':
        '| `OBJ-A-1.2.x` | วัตถุประสงค์ของโครงงานตามหัวข้อ 1.2.x ในบทที่ 1 ของโมดูลควบคุมเอกสาร |',
    },
    'B': {
        '`REF-11` ถึง `REF-14`': '`REF-11`, `REF-12`, `REF-13` และ `REF-14`',
        '**ยังไม่ใช่ SRS ฉบับสมบูรณ์ของระบบ E-Filing** และจะถูกนำไปรวมกับเอกสารความต้องการของโมดูลควบคุมเอกสารเป็นฉบับเดียวในภายหลัง · การรวมเอกสารต้องคงรหัส infix `-B-` ไว้เพื่อไม่ให้ชนกับรหัสของอีกโมดูล':
        'เนื้อหาของโมดูลนี้รวมกับโมดูลควบคุมเอกสารไว้ใน SRS ฉบับนี้แล้ว โดยคงรหัส infix `-B-` เพื่อรักษาการสอบกลับ การรวมครบทั้งระบบยังไม่ใช่การอนุมัติ Baseline',
        '| **Working Draft (0.x)** |': '| **Working Draft** |',
        '| **Review Candidate (1.0)** |': '| **Review Candidate** |',
        '| จำนวนบทบาทผู้ใช้ | 4 บทบาท (§1.4.1.1) | 10 บทบาท ตามระเบียบปฏิบัติจริง | `TBD-B-01` |':
        '| จำนวนบทบาทผู้ใช้ | 4 บทบาท (§1.4.1.1) | ทะเบียนกลาง 14 บทบาท · ต้นทางโมดูล B ระบุ 12 บทบาท โดยมีกรณีการใช้งานจริง 9 บทบาท · ดู §2.3 | `TBD-B-01` |',
        'ตารางนี้แยก **สถานะการยืนยัน** ของแต่ละรายการไว้ชัดเจน เนื่องจากที่เก็บของโครงงานนี้ไม่มีไฟล์ต้นฉบับของเอกสารคุณภาพจริง มีเพียงการอ้างถึงผ่านเอกสารที่จัดทำขึ้นภายหลัง การเขียนความต้องการจึงต้องระวังไม่อ้างข้อความเฉพาะเจาะจงของเอกสารที่ยังเปิดต้นฉบับไม่ได้':
        'ตารางนี้แยก **สถานะการยืนยัน** ของแต่ละรายการไว้ชัดเจน เอกสารคุณภาพสี่ฉบับได้รับการเปิดอ่านครบตามบันทึกของต้นทางแล้ว แต่การยืนยันว่าไฟล์ตรงกับฉบับที่หน่วยงานบังคับใช้ยังเป็นรายการค้างตามหมายเหตุท้ายตาราง การรวมเล่มครั้งนี้ไม่ได้เป็นการตรวจต้นฉบับคุณภาพซ้ำหรือรับรองข้ออ้างในเอกสารวิเคราะห์ทั้งหมด',
        # §1.1 and §2.1 still announced a merge that this volume already is.
        'เอกสารฉบับนี้ **ไม่ใช่ SRS ฉบับสมบูรณ์ของระบบ E-Filing ทั้งระบบ** แต่เป็นเอกสารตั้งต้นระดับโมดูลที่จะถูกนำไปรวมกับเอกสารความต้องการของโมดูลควบคุมเอกสารเป็น SRS ฉบับเดียวในภายหลัง จึงกำหนดความต้องการเฉพาะสิ่งที่โมดูลนี้รับผิดชอบ':
        'ข้อกำหนดของโมดูลนี้รวมกับข้อกำหนดของโมดูลควบคุมเอกสารเป็น SRS ฉบับเดียวแล้วในเอกสารฉบับนี้ หัวข้อที่อยู่ใต้หัวเรื่องของโมดูลนี้จึงกำหนดความต้องการเฉพาะสิ่งที่โมดูลนี้รับผิดชอบ',
        'ฉบับ 0.1 นี้เป็น **Working Draft** ยังไม่ใช่ Baseline':
        'เอกสารอยู่ในสถานะ **Working Draft** ยังไม่ใช่ Baseline',
        'ทั้งสองโมดูลจะถูกรวมเป็นเอกสารข้อกำหนดความต้องการฉบับเดียวในภายหลัง เอกสารฉบับนี้จึงกำหนดความต้องการเฉพาะโมดูลที่สอง และอธิบายสิ่งที่ต้องพึ่งพาโมดูลแรก':
        'ทั้งสองโมดูลรวมเป็นเอกสารข้อกำหนดความต้องการฉบับเดียวแล้วในเอกสารฉบับนี้ หัวข้อของโมดูลนี้จึงกำหนดความต้องการเฉพาะโมดูลที่สอง และอธิบายสิ่งที่ต้องพึ่งพาโมดูลแรก',
        'ได้ทันทีเมื่อรวมเอกสาร': 'ได้ทันทีในเล่มรวมนี้',
        '| **ผู้รวบรวม SRS ฉบับรวม** | 1.2, Appendix E | นำรหัสและสายโยงไปรวมกับอีกโมดูลโดยไม่ให้รหัสชนกัน |':
        '| **ผู้ดูแลฉบับรวม** | 1.2, Appendix E | ตรวจว่ารหัสของสองโมดูลไม่ชนกันและสายโยงข้ามโมดูลยังครบ |',
    },
}

# Applied after the mechanical maps, so section numbers written here are final
# positions in the merged volume and must not be renumbered a second time.
post_corrections = {
    'A': {},
    'B': {
        '| **โมดูลควบคุมเอกสาร** | ทะเบียนเอกสารคุณภาพ วงจรชีวิตเอกสาร คำร้องขอดำเนินการทางเอกสาร และการรับทราบเอกสาร | อีกฉบับหนึ่ง (อยู่นอกเอกสารนี้) |':
        '| **โมดูลควบคุมเอกสาร** | ทะเบียนเอกสารคุณภาพ วงจรชีวิตเอกสาร คำร้องขอดำเนินการทางเอกสาร และการรับทราบเอกสาร | **เอกสารฉบับนี้** — §1.4.1 และ §4.4–4.16 |',
    },
}

# A's browser bullet in §2.4 repeats B's almost word for word and cites the same
# quality manual (REF-A-15 and REF-14 both map to REF-01), so only B's copy is
# kept. A's separate TBD-A-07 caveat line is unaffected.
DUPLICATE_A_LINES = {
    '- **ชุดเบราว์เซอร์ที่รองรับ** — บนเดสก์ท็อปคือ **Google Chrome และ Microsoft Edge สองรุ่นล่าสุด** · บนอุปกรณ์เคลื่อนที่คือเบราว์เซอร์ประจำระบบปฏิบัติการ คือ Chrome บน Android และ Safari บน iOS · ต้องใช้ฟังก์ชันหลักได้ครบที่ **ความกว้างหน้าจอตั้งแต่ 360 CSS pixel ขึ้นไป** · เหตุที่รวม Edge เพราะหน่วยงานทำงานบน **Microsoft 365** ตาม `REF-A-15` §7.1.3 · **ใช้ชุดเดียวกับโมดูลกลุ่ม B เพราะเป็นระบบเดียวสองโมดูล**',
}

def module_name(text):
    """Resolution of 7 Sep 2569: name the module, never the student group.

    Applied to text drawn from the other project records too, so the merged
    volume reads consistently. The space that separated the Latin "B" from
    Thai text is dropped along with it.
    """
    text = re.sub(r'โมดูลกลุ่ม B ?(?=[฀-๿])', 'โมดูลตรวจติดตามและใบคำร้อง', text)
    return text.replace('โมดูลกลุ่ม B', 'โมดูลตรวจติดตามและใบคำร้อง')

def feature(n, side):
    n = int(n)
    return n + 3 if side == 'A' else n if n <= 3 else n + 13

def convert(text, side):
    for old, new in corrections[side].items():
        text = text.replace(old, new)
    # A reference range must be expanded before its endpoints are remapped:
    # the unified REF register is not ordered like either source register.
    text = re.sub(r'REF-'+side+r'-(\d{2})–(\d{2})(?!\d)',
                  lambda m: ', '.join(f'REF-{side}-{n:02d}'
                                      for n in range(int(m[1]), int(m[2]) + 1)),
                  text)
    text = module_name(text)
    # The A -> B references just handled above already use their final numbers.
    protected = {}
    def hold(m):
        key = f'@@EXTERNAL{len(protected)}@@'
        protected[key] = m[0]
        return key
    # Explicitly preserve external references that overlap our nested headings.
    for pattern in [r'บทที่ 1 §1\.4\.[123](?:\.\d+)?',
                    r'§1\.4\.1\.1',
                    r'(?<=`REF-11` )§6\.(?:2\.1|3\.3|3\.4)',
                    r'(?<=`REF-12` )§6\.1\.1']:
        text = re.sub(pattern, hold, text)
    text = re.sub(r'§4\.(\d+)(?:–4\.(\d+))?',
                  lambda m: '§4.'+str(feature(m[1],side)) +
                  ('–4.'+str(feature(m[2],side)) if m[2] else ''), text)
    if side == 'B':
        text=text.replace('§4.1–§4.29','§4.1–§4.3 และ §4.17–§4.29')
    text = re.sub(r'^(## )4\.(\d+)(?= )',
                  lambda m: m[1]+'4.'+str(feature(m[2],side)),text,flags=re.M)
    branch = '1' if side == 'A' else '2'
    # All occurrences here refer to this SRS's analysis/traceability appendices.
    text = re.sub(r'(?<![\w/-])([B-F])\.(\d+)(?!\d)',
                  lambda m: m[1]+'.'+branch+'.'+m[2],text)
    text = re.sub(r'([ขคงจฉ])\.(\d+)',
                  lambda m: m[1]+'.'+branch+'.'+m[2],text)
    # Add one module level beneath paired main sections.
    text = re.sub(r'(?<![\w-])((?:1\.4|2\.2|5\.4|6\.[123]))\.(\d+)(?![\d.])',
                  lambda m: m[1]+'.'+branch+'.'+m[2],text)
    # References into the newly unified interface, B only (A specials above).
    if side == 'B':
        text = re.sub(r'§3\.3\.([123])(?!\d)',
                      lambda m:'§3.3.'+{'1':'3','2':'5','3':'6'}[m[1]],text)
    for key, value in protected.items():
        text = text.replace(key,value)
    # Two disjoint source namespaces prevent replacement cascades.
    if side == 'B':
        text = re.sub(r'(?<!-)\bREF-(\d{2})\b',r'REF-B-\1',text)
    text = re.sub(r'REF-([AB])-(\d{2})',
                  lambda m: 'REF-%02d'%REF_MAP[m[1]][int(m[2])]
                  if int(m[2]) in REF_MAP[m[1]] else m[0],text)
    # Demote source subheadings under the new module wrapper, not new features.
    text = re.sub(r'^(#{3,5}) ((?:1\.4|2\.2|5\.4|6\.[123])\.\d+\.\d+.*)$',r'#\1 \2',text,flags=re.M)
    for old, new in post_corrections[side].items():
        text = text.replace(old, new)
    return text
