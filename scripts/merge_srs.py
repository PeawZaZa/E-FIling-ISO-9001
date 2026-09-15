from pathlib import Path
import re, sys
sys.dont_write_bytecode = True
root=Path(__file__).resolve().parent.parent
A=(root/'GroupA_SRS_v2.md').read_text(encoding='utf-8'); B=(root/'GroupB_SRS_v2.md').read_text(encoding='utf-8')
ma={1:15,2:13,3:9,4:11,5:2,6:5,7:6,8:7,9:8,10:27,11:28,12:29,13:30,15:1,16:16}
mb={1:10,2:12,3:14,4:21,5:22,6:23,7:24,8:25,9:26,10:15,11:3,12:4,13:2,14:1,15:31}
from srs_merge_rules import convert, corrections, module_name, DUPLICATE_A_LINES
def sec(s,n):
 return re.search(r'^## '+re.escape(n)+r'(?: |\n).*?(?=^##? |\Z)',s,re.M|re.S).group().rstrip().removesuffix('---').rstrip()
def body(s,n): return sec(s,n).split('\n',1)[1].strip()
def rows(s): return [l for l in s.splitlines() if l.startswith('|') and not re.match(r'^\|\s*:?-',l)]
def cells(l): return [c.strip() for c in l.strip('|').split('|')]
def table_blocks(s): return re.findall(r'(?:^\|[^\n]*\n?)+',s,re.M)
def title(s,n):return sec(s,n).split('\n')[0]
def sub(s,n):
 return re.search(r'^### '+re.escape(n)+r' .*?(?=^#{1,3} |\Z)',s,re.M|re.S).group().split('\n',1)[1].strip().removesuffix('---').strip()
def pair(n):
 return title(B,n)+'\n\n### '+n+'.1 โมดูลควบคุมเอกสาร\n\n'+convert(body(A,n),'A')+'\n\n### '+n+'.2 โมดูลตรวจติดตามและใบคำร้อง\n\n'+convert(body(B,n),'B')
parts=['# Software Requirements Specification\n\n## ระบบ E-Filing Phase 1 — โมดูลควบคุมเอกสารและโมดูลตรวจติดตามและใบคำร้อง\n\n| รายการ | รายละเอียด |\n| :--- | :--- |\n| Version | 1.1 |\n| วันที่ | 16 ก.ย. 2569 |\n| สถานะ | Working Draft — รวมครบ §1–6 และ Appendix A–F ยังไม่ใช่ Baseline |\n| หน่วยงานผู้ใช้ | สำนักงานคณบดีคณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา |\n\n> เอกสารภายในโครงงาน ห้ามเผยแพร่ต่อสาธารณะโดยไม่ได้รับอนุญาตจากอาจารย์ที่ปรึกษาและหน่วยงานเจ้าของเอกสาร']
toc=sec(B,'สารบัญ (Table of Contents)') if False else re.search(r'^## สารบัญ.*?(?=^## Revision History)',B,re.M|re.S).group().strip().removesuffix('---').strip()
toc=re.sub(r'^\| \*\*4\*\*.*$', '| **4** | System Features — ส่วนกลาง UC-B-01–03 · โมดูลควบคุมเอกสาร UC-A-01–12 · โมดูลตรวจติดตามและใบคำร้อง UC-B-04–16 |',toc,flags=re.M)
toc=re.sub(r'^\| \*\*Appendix B\*\*.*$', '| **Appendix B** | Analysis Models — แบบจำลองของทั้งสองโมดูล, State Semantics และ Authority Matrix |',toc,flags=re.M)
toc=re.sub(r'^\| \*\*Appendix C\*\*.*$', '| **Appendix C** | To Be Determined List — `TBD-A-xx` และ `TBD-B-xx` พร้อมผู้รับผิดชอบและหลักฐานที่ใช้ปิดประเด็น |',toc,flags=re.M)
toc=re.sub(r'^\| \*\*Appendix D\*\*.*$', '| **Appendix D** | Acceptance Criteria — `AC-A-xx` และ `AC-B-xx` แบบ Given–When–Then และกรณีขอบ |',toc,flags=re.M)
parts.append(toc)
hist=('## Revision History\n\n| Version | Date | Reason for Changes | Status | โมดูลต้นทาง |\n| :--- | :--- | :--- | :--- | :--- |\n'
 '| 1.1 | 16 ก.ย. 2569 | แก้ข้อความค้างจากฉบับแยกโมดูลที่ขัดกับเล่มรวมเก้าจุด (§1.1, §1.2, §1.3, §2.1 และคำเรียกโมดูล) และกู้เนื้อหาโมดูลควบคุมเอกสารที่ตกหล่นสี่จุด (§1.2.2, §1.2.3, §1.3, §3.2) | Working Draft | ระบบรวม |\n'
 '| 1.0 | 12 ก.ย. 2569 | รวมเอกสารสองโมดูลเป็นฉบับเดียว | Working Draft | ระบบรวม |')
for side,s in [('A',A),('B',B)]:
 for row in rows(sec(s,'Revision History'))[1:]:hist+='\n'+convert(row,side)+' '+side+' |'
parts += [hist,'# 1. Introduction']
parts.append('## 1.1 Purpose\n\nเอกสารนี้รวมข้อกำหนดของโมดูลควบคุมเอกสารและโมดูลทะเบียนหลักฐาน การตรวจติดตาม ใบคำร้อง และแดชบอร์ด เป็นข้อกำหนดของระบบ E-Filing ระบบเดียว เพื่อใช้ตรวจขอบเขต ออกแบบ พัฒนา และทวนสอบร่วมกัน โดยคงรหัสข้อกำหนดและรายการรอยืนยันของทั้งสองโมดูล\n\n### 1.1.1 โมดูลควบคุมเอกสาร\n\n'+convert(body(A,'1.1'),'A')+'\n\n### 1.1.2 โมดูลตรวจติดตามและใบคำร้อง\n\n'+convert(body(B,'1.1'),'B'))
x=convert(sec(B,'1.2'),'B'); tab=table_blocks(x)[0]
add=[convert(l,'A') for l in rows(body(A,'1.2')) if re.search(r'`(?:FR|NFR|BR|CON|US|UC|AC|M|TBD|OBJ)-A-',l)]
x=x.replace(tab,tab.rstrip()+'\n'+'\n'.join(add)+'\n',1)
# A separates necessity from confirmation status and defines ห้าม; B does neither.
a122=convert(sub(A,'1.2.2'),'A'); rider=a122.split(table_blocks(a122)[0],1)[1].strip()
x=x.replace('### 1.2.3',rider+'\n\n### 1.2.3',1)
# A's six term pairs are a distinct device; B only locks three concepts.
x=x.replace('### 1.2.4','#### ศัพท์คู่ที่ต้องแยกความหมาย (โมดูลควบคุมเอกสาร)\n\n'
 +convert(sub(A,'1.2.3'),'A')+'\n\n### 1.2.4',1)
# A's rule against presenting proposed state names as wording set by the QP.
parts.append(x.rstrip()+'\n\n'+convert(sub(A,'1.2.4'),'A').split('\n\n')[-1].strip())
x=convert(sec(B,'1.3'),'B');tab=table_blocks(x)[0]
# A adds policy owners and analysts not separately listed by B.
add=[convert(l,'A') for l in rows(body(A,'1.3'))[1:3]]
x=x.replace(tab,tab.rstrip()+'\n'+'\n'.join(add)+'\n',1)
# A's caveat that the table grants no software permissions has no counterpart.
a13=body(A,'1.3')
parts.append(x.rstrip()+'\n\n'+convert(a13.split(table_blocks(a13)[0],1)[1].strip(),'A'))
parts.append('## 1.4 Product Scope\n\n### 1.4.1 โมดูลควบคุมเอกสาร\n\n'+convert(body(A,'1.4'),'A')+'\n\n### 1.4.2 โมดูลตรวจติดตามและใบคำร้อง\n\n'+convert(body(B,'1.4'),'B'))
refs={}
for side,s,mapping in [('A',A,ma),('B',B,mb)]:
 for l in rows(body(s,'1.5'))[1:]:
  c=cells(l); num=int(re.search(r'REF-(?:A-)?(\d+)',c[0])[1])
  if side=='A' and num==14:continue
  refs.setdefault(mapping[num],[]).append((side,c))
x='## 1.5 References\n\n'+convert(body(B,'1.5').split('| Ref')[0].strip(),'B')+'\n\n| Ref | เอกสาร | การใช้ในเอกสารนี้ | สถานะการยืนยัน |\n| :--- | :--- | :--- | :--- |'
for n in range(1,32):
 if n in [17,18,19,20]:
  f={17:'GroupB_TBD_Decisions.md',18:'Module_Interface_Agreement.md',19:'Shared_Role_Registry.md',20:'Design_Assumptions_Register.md'}[n]
  name=module_name((root/f).read_text(encoding='utf-8').splitlines()[0].lstrip('# '))
  x+=f'\n| REF-{n:02d} | `{f}` | {name} | เอกสารโครงงาน · คงสถานะมติและรายการรอยืนยันตามต้นทาง |';continue
 entries=refs[n];docs=[];uses=[];status=[]
 for side,c in entries:
  docs.append(convert(c[1],side));uses.append(convert(c[2],side))
  if len(c)>3:status.append(convert(c[3],side))
 x+='\n| REF-%02d | '%n+' · '.join(dict.fromkeys(docs))+' | '+' · '.join(uses)+' | '+(' · '.join(status) if status else '—')+' |'
for side,s in [('A',A),('B',B)]:
 tables=table_blocks(body(s,'1.5')); tail=body(s,'1.5').split(tables[0],1)[1].strip()
 x+='\n\n'+convert(tail,side)
parts += [x,'# 2. Overall Description']
parts.append(pair('2.1').replace('\n\n','\n\nระบบ E-Filing ประกอบด้วยสองโมดูลภายในระบบเดียวกัน\n\n',1));parts.append(pair('2.2'))
registry=(root/'Shared_Role_Registry.md').read_text(encoding='utf-8')
reg=re.search(r'^## 2\..*?(?=^## 3\.)',registry,re.M|re.S).group()
x=title(B,'2.3')+'\n\n'+table_blocks(reg)[0].strip()+'\n\nทะเบียนบทบาทฉบับเต็มอยู่ที่ REF-19'
for side,s in [('A',A),('B',B)]:
 text=body(s,'2.3');tab=table_blocks(text)[0]
 x+='\n\n### ขอบเขตอำนาจรายโมดูล '+side+'\n\n'+convert(text,side)
parts.append(x)
x=convert(sec(B,'2.4'),'B')+'\n\n### รายละเอียดเพิ่มเติมจากโมดูลควบคุมเอกสาร\n\n'
# Preserve every non-identical A line after comparison; no semantic rewriting.
x+='\n'.join(convert(l,'A') for l in body(A,'2.4').splitlines()
 if l.strip() and l not in DUPLICATE_A_LINES
 and convert(l,'A') not in convert(body(B,'2.4'),'B'));parts.append(x)
parts += [pair('2.5'),pair('2.6'),pair('2.7')+'\n\nค่าที่ยังไม่ยืนยันรวมอยู่ในทะเบียนสมมติฐาน REF-20']

def app(s, letter):
 return re.search(r'^# Appendix '+letter+r':.*?(?=^# |\Z)',s,re.M|re.S).group().strip().removesuffix('---').strip()

I=(root/'Module_Interface_Agreement.md').read_text(encoding='utf-8')
def ib(n):
 return re.search(r'^## '+str(n)+r'\..*?(?=^## |\Z)',I,re.M|re.S).group().split('\n',1)[1].strip().removesuffix('---').strip()

def chapter_intro(s,n):
 return re.search(r'^# '+str(n)+r'\..*?\n(.*?)(?=^## )',s,re.M|re.S)[1].strip().removesuffix('---').strip()

parts += ['# 3. External Interface Requirements']
for side,s in [('A',A),('B',B)]:
 pre=chapter_intro(s,3)
 if pre: parts.append(convert(pre,side))
parts += [pair('3.1'),convert(sec(B,'3.2'),'B')
 +'\n\n### รายละเอียดเพิ่มเติมจากโมดูลควบคุมเอกสาร\n\n'+convert(body(A,'3.2'),'A')]
interface=['## 3.3 Software Interfaces',
 'ข้อตกลงฉบับเต็มอยู่ที่ REF-18 · มติ Q1–Q6 ตกลงแล้วเมื่อ 12 ก.ย. 2569 แต่ยังรอลงนามรับรอง การรวมเล่มไม่ถือเป็นการลงนามหรือปิดรายการค้างแทนผู้รับผิดชอบ',
 '### 3.3.1 หลักการ',ib(1),
 '### 3.3.2 รหัสข้อมูลที่ใช้ร่วมกัน',ib(2),
 '### 3.3.3 ข้อมูลสองทิศทาง',
 '#### โมดูลควบคุมเอกสาร → โมดูลตรวจติดตามและใบคำร้อง',ib(3),
 '#### โมดูลตรวจติดตามและใบคำร้อง → โมดูลควบคุมเอกสาร',ib(4),
 '#### รายละเอียดและที่มาจาก SRS ของแต่ละโมดูล',
 '> ข้อความต่อไปนี้เก็บรายละเอียดจากต้นทางเพื่อการสอบกลับ ถ้อยคำที่ยังระบุว่าต้องตกลงนิยามหรือเลือกรูปแบบ ให้พิจารณาร่วมกับมติ Q1–Q6 ใน §3.3.7 ซึ่งเกิดภายหลัง',
 convert(sub(B,'3.3.1'),'B'),
 '### 3.3.4 รูปแบบทางเทคนิค',
 'เรียกภายในกระบวนการเดียวกันผ่านฟังก์ชันหรือบริการโดยตรง ไม่แยกเป็น microservices และไม่เรียกผ่าน HTTP ภายใน ตามมติ Q2 ของ REF-18 · ใช้สถาปัตยกรรมสามชั้น (Three-tier) + Modular Service Design',
 '### 3.3.5 พฤติกรรมเมื่ออ่านไม่สำเร็จ',
 '> เลข §3.3.2 ในตารางเปรียบเทียบต่อไปนี้เป็นเลขหัวข้อเดิมของ SRS โมดูล B ซึ่งยกมาอยู่ในหัวข้อ §3.3.5 นี้แล้ว',
 ib(5),convert(sub(B,'3.3.2'),'B'),
 '### 3.3.6 ส่วนต่อประสานประกอบและข้อจำกัดที่ต้องคงไว้',
 '#### รายละเอียดจากโมดูลควบคุมเอกสาร',convert(body(A,'3.3'),'A'),
 '#### ส่วนต่อประสานภายนอกที่มีจริง',convert(sub(B,'3.3.3'),'B'),
 '### 3.3.7 มติร่วมที่ใช้ประกอบข้อกำหนด',
 module_name(table_blocks(ib(7))[0].strip()),
 '> เลข §6 Q1 และ §6 Q5 ในตารางมติเป็นเลขหัวข้อของข้อตกลงส่วนเชื่อมต่อ REF-18 ไม่ใช่หัวข้อ 6 ของ SRS ฉบับนี้',
 '#### กติกาการสร้างร่าง DAR จากใบคำร้อง — Q1',
 table_blocks(re.search(r'^### Q1 .*?(?=^### Q2)',I,re.M|re.S).group())[1].strip(),
 '#### กติกาข้อมูลส่วนกลาง — Q5',
 table_blocks(re.search(r'^### Q5 .*?(?=^### Q6)',I,re.M|re.S).group())[1].strip(),
 '#### การสอบกลับมติร่วม',
 '| มติ | ข้อกำหนด/กรณีการใช้งานที่ต้องอ่านร่วม | สถานะ |\n| :--- | :--- | :--- |\n'
 '| Q1 | UC-A-02, FR-A-04–05, FR-A-20, FR-B-42 | เก็บกติกาห้าข้อข้างต้นครบ · ยังไม่สร้างรหัส FR/AC ใหม่แทนทีม |\n'
 '| Q2 | FR-A-20, FR-B-42, NFR-A-05, NFR-B-06 | มติรูปแบบส่วนเชื่อมต่อแล้ว · รอลงนาม |\n'
 '| Q3 | FR-A-13–14, FR-B-38 | ตัวหารตามบัญชีแจกจ่ายตามมติ |\n'
 '| Q4 | FR-B-10–11, FR-A-20 | ไม่ตัดความเชื่อมโยงประวัติเมื่อเอกสารถูกยกเลิก |\n'
 '| Q5–Q6 | FR-B-06, FR-A-19, CON-A-01 | ข้อมูลผู้ใช้และบทบาทอยู่ส่วนกลาง · คงหลักบทบาทใช้งานและแยกหน้าที่ |']
parts.append('\n\n'.join(interface))
parts.append(convert(sec(B,'3.4'),'B')+'\n\n### รายละเอียดเพิ่มเติมจากโมดูลควบคุมเอกสาร\n\n'+convert(body(A,'3.4'),'A'))
parts += ['# 4. System Features']
# Preserve both introductory blocks and the A use-case figure.
for side,s in [('A',A),('B',B)]:
 pre=s.split('# 4. System Features',1)[1].split('## 4.1 ',1)[0].strip()
 parts.append(convert(pre,side))
for n in range(1,4):
 if n==1: parts.append('ส่วนกลางของระบบครอบคลุมการเข้าสู่ระบบ การจัดการผู้ใช้และบทบาท และการตรวจร่องรอยการใช้งาน สำหรับผู้ใช้และผู้ดูแลของทั้งสองโมดูล')
 parts.append(convert(sec(B,'4.'+str(n)),'B'))
for n in range(1,14):
 if n==1: parts.append('โมดูลควบคุมเอกสารครอบคลุมร่างเอกสาร DAR การพิจารณา ประกาศใช้ แจกจ่าย และรับทราบ สำหรับผู้มีอำนาจในกระบวนการควบคุมเอกสาร')
 parts.append(convert(sec(A,'4.'+str(n)),'A'))
for n in range(4,19):
 if n==4: parts.append('โมดูลตรวจติดตามและใบคำร้องครอบคลุมทะเบียนหลักฐาน รอบตรวจ ประเด็นที่พบ การแก้ไขและป้องกัน การติดตาม และรายงาน สำหรับผู้ปฏิบัติงานและผู้มีอำนาจตามวงจรใบคำร้อง')
 parts.append(convert(sec(B,'4.'+str(n)),'B'))
for chapter,count in [(5,5),(6,3)]:
 parts.append(re.search(r'^# '+str(chapter)+r'\..*$',B,re.M).group())
 for side,s in [('A',A),('B',B)]:
  pre=chapter_intro(s,chapter)
  if pre: parts.append(convert(pre,side))
 for n in range(1,count+1): parts.append(pair(f'{chapter}.{n}'))

# B glossary is authoritative for the six overlapping concepts.
gloss=convert(app(B,'A'),'B')
extra={'DAR','Document Owner','Reviewer / Approver','Issue / Revision','Current Version',
       'Copy Holder / Acknowledgement','Approved / Closed DAR','Audit Trail / Revision History','Provisional / TBD'}
for row in rows(app(A,'A'))[1:]:
 c=cells(row)
 if c[0] in extra: gloss+='\n| — | '+c[0]+' | '+convert(c[1],'A')+' |'
parts.append(gloss)
for letter in 'BCDEF':
 parts.append(app(B,letter).split('\n')[0])
 if letter=='F':
  parts.append('บันทึกใน F.1 และ F.2 เป็นผลตรวจเดิมของแต่ละโมดูลตามวันที่ต้นทาง ไม่ใช่ผลตรวจฉบับรวม ข้อความเก่าที่ระบุว่ายังไม่รวมเล่มหรือยังไม่ตกลงส่วนเชื่อมต่อให้ดูสถานะปัจจุบันใน F.3 และ §3.3.7 · ไม่อ้างผลตรวจเอกสารเป็นผลทดสอบซอฟต์แวร์')
 for side,s in [('A',A),('B',B)]:
  branch='1' if side=='A' else '2'
  text=convert(app(s,letter).split('\n',1)[1].strip(),side)
  text=re.sub(r'^(#{2,5}) ',r'#\1 ',text,flags=re.M)
  # The old end marker is superseded by one marker at the end of this volume.
  text=re.sub(r'^End of Software Requirements Specification.*$','',text,flags=re.M).strip()
  parts.append('## '+letter+'.'+branch+' '+('โมดูลควบคุมเอกสาร' if side=='A' else 'โมดูลตรวจติดตามและใบคำร้อง')+'\n\n'+text)

parts.append('''## F.3 ข้อสังเกตจากการรวมเล่ม

### F.3.1 สถานะของฉบับรวม

รวม §1–6 และ Appendix A–F ครบแล้วเมื่อ 12 ก.ย. 2569 · เป็น Working Draft ไม่ใช่ Baseline · รายงานวิธีตรวจและตัวเลขอยู่ใน `SRS_Merge_Report.md` · การยืนยันของผู้มีอำนาจ การลงนามส่วนเชื่อมต่อ ผลทดสอบซอฟต์แวร์ และข้อขัดแย้งกับบทที่ 1 ไม่ได้เกิดขึ้นจากการรวมเล่ม

ทะเบียนบทบาทกลางมี 14 บทบาท ใช้ในโมดูลควบคุมเอกสาร 8 และโมดูลตรวจติดตามและใบคำร้อง 9 ตาม §2.3 · ตัวเลข 10/12 และข้อความ “ยังไม่เลือกกราฟ” ในบันทึกหรือกติกาเก่าต้องอ่านตามบริบทวันที่ต้นทาง ชุดกราฟที่ SRS โมดูล B ระบุอยู่ใน §2.4 · ไม่ใช้ข้อความเก่าแทนมติปัจจุบัน

### F.3.2 ข้อกำหนดที่คล้ายกันและคงไว้ทั้งคู่

| คู่ข้อกำหนด | ประเด็นร่วม | วิธีจัดการในการรวมครั้งนี้ |
| :--- | :--- | :--- |
| CON-A-04 / CON-B-04 | ชุดเทคโนโลยีร่วม | คงทั้งคู่ ไม่ยุบรหัส |
| CON-A-01 / CON-B-01 | ตัวตน บัญชีผู้ใช้ และข้อจำกัดการเชื่อมต่อ | คงรายละเอียดและขอบเขตของแต่ละข้อ |
| FR-A-19 / FR-B-01–06 | ตัวตน สิทธิ์ และบทบาทใช้งาน | อ่านร่วมกับส่วนกลาง §4.1–4.3 และทะเบียนบทบาท ไม่ยุบความรับผิดชอบเฉพาะโมดูล |
| FR-A-20 / FR-B-42 | ส่วนเชื่อมต่อระหว่างโมดูล | คงทั้งสองด้านและมติร่วมใน §3.3 |
| NFR-A-01 / NFR-B-01 | การควบคุมสิทธิ์ | คงทั้งคู่เพื่อไม่สูญเสียเงื่อนไขเฉพาะ |

### F.3.3 ประเด็นที่ยังต้องตัดสินหรือยืนยัน

- วงจรพึ่งพาระหว่างการตรวจติดตามกับใบคำร้อง: คงประเด็นเดิมใน F.2.3 ไม่แก้ FR-B-19 หรือเลือกสถาปัตยกรรมแทนทีม
- ข้อขัดแย้งกับบทที่ 1 เรื่องบทบาท สถานะ และถ้อยคำวัตถุประสงค์: คงรายการค้างและผู้มีอำนาจยืนยันเดิม
- ข้อตกลงส่วนเชื่อมต่อมีมติแล้ว แต่ยังรอลงนาม: คงสถานะตาม REF-18 ไม่ปิด TBD-A-08 แทนผู้รับผิดชอบ
- มติ Q1 เพิ่มพฤติกรรมสร้างร่าง DAR อัตโนมัติที่ยังไม่มีรหัสข้อกำหนด/เกณฑ์ยอมรับเฉพาะในต้นทาง: กติกาครบอยู่ §3.3.7 และตารางสอบกลับระบุข้อที่เกี่ยวข้องแล้ว ควรกำหนดรหัสเพิ่มในรอบทบทวนข้อกำหนด ไม่แทรกรหัสใหม่ในการรวมเชิงกล
- ภาพประกอบยกไฟล์เดิมมาใช้เพื่อการสอบกลับ ยังไม่ได้วาดใหม่ให้เป็นภาพระบบรวม หรือยืนยันว่ารหัสบทบาทและสถานะภายในภาพทุกภาพตรงกับมติล่าสุด

End of Software Requirements Specification — E-Filing Phase 1
''')

output='\n\n'.join(parts)+'\n'
assert 'REF-A-14' not in output
# Keep the two original purposes as explicitly labelled historical source text.
output=output.replace('### 1.1.1 โมดูลควบคุมเอกสาร',
 '### 1.1.1 จุดประสงค์เดิมของโมดูลควบคุมเอกสาร')
output=output.replace('### 1.1.2 โมดูลตรวจติดตามและใบคำร้อง',
 '### 1.1.2 จุดประสงค์เดิมของโมดูลตรวจติดตามและใบคำร้อง')
# Source subheads with no numeric identifier are demoted inside appendix wrappers.
for heading in ['Negative / Boundary Scenarios']:
 output=output.replace('### '+heading,'### D.1.1 '+heading)
# Clarify scope of preserved module wording and historical verification results.
output=output.replace('## Revision History',
 '> **วิธีอ่านฉบับรวม:** ข้อความ “โมดูลนี้” ใต้หัวข้อแยกโมดูลหมายถึงโมดูลต้นทางนั้น รหัสข้อกำหนดคงเดิม การอ้างหัวข้อปรับเป็นตำแหน่งในเล่มรวม ยกเว้นเลขข้อของเอกสารภายนอกและตารางเปรียบเทียบที่ระบุว่าเป็นเลขเดิม · ประวัติและผลตรวจเดิมไม่ใช่ผลตรวจฉบับรวม\n\n## Revision History',1)
output=output.replace('| Infix `-X-` (Case X) | Infix `-B-` |',
 '| Infix `-X-` (Case X) | Infix `-A-` และ `-B-` |')
output=output.replace('หัวข้อ 4 มี 14 Use Case + 2 หัวข้อแบบ Stimulus/Response',
 'หัวข้อ 4 มี 28 Use Case + 3 หัวข้อพฤติกรรมร่วม')
(root/'SRS_v1.md').write_text(output,encoding='utf-8')
print('Created full SRS:',len(output.splitlines()),'lines')
