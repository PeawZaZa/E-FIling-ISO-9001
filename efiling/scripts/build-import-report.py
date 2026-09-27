"""Build a standalone read-only report from the local inventory/import results."""
from datetime import datetime
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCAL = ROOT / "efiling/.local"


def h(value):
    return escape(str(value)) if value is not None else "—"


def main():
    inventory = json.loads((LOCAL / "iso-inventory.json").read_text(encoding="utf-8"))
    report = json.loads((LOCAL / "iso-import-report.json").read_text(encoding="utf-8"))
    results = {item["sourcePath"]: item for item in report["results"]}
    entries = inventory["entries"]
    summary = report["summary"]
    document_count = len({item["documentId"] for item in report["results"] if item.get("documentId")})
    confirmed_count = sum(bool(item.get("sourceConfirmedAt")) for item in report["results"])
    rows = []
    for index, entry in enumerate(entries, 1):
        result = results.get(entry["sourcePath"], {})
        status = {"existing": "มีอยู่ในทะเบียนแล้ว", "imported": "นำเข้าแล้ว", "failed": "ไม่สำเร็จ"}.get(result.get("status"), result.get("status", "ไม่มีผลนำเข้า"))
        current = bool(result.get("sourceConfirmedAt")) and result.get("reviewStatus") == "VERIFIED"
        field_labels = {"documentCode": "รหัส", "issueNo": "ฉบับที่", "revisionNo": "ครั้งที่แก้ไข", "effectiveDate": "วันที่เริ่มใช้"}
        missing = [label for field, label in field_labels.items() if entry.get(field) is None]
        if entry.get("candidateTitle") is None:
            missing.append("ชื่อเรื่อง")
        note = "ข้อมูลที่ยังว่าง: " + ", ".join(missing) if missing else "มีข้อมูลหลักครบตามหลักฐานที่ระบุ"
        if entry.get("sameRevisionFileGroup"):
            note += "; สองไฟล์ของเอกสารฉบับปัจจุบันเดียวกัน"
        refs = entry.get("historicalDarReferences", [])
        dar_details = ""
        if refs:
            dar_details = "<p>ประวัติ DAR: " + "; ".join(h(f"{ref['number']}/{ref['yearBE']} วันที่ขอ {ref['requestDate']}") for ref in refs) + " (ข้อมูลย้อนหลัง ไม่ใช่สถานะคำขอปัจจุบัน)</p>"
        rows.append(f'''<tr data-type="{h(entry['docType'])}"><td>{index}</td>
<td><strong>{h(entry['fileName'])}</strong><details><summary>ตำแหน่งต้นฉบับ</summary><small>ISO files/{h(entry['sourcePath'])}</small></details></td>
<td>{h(entry['documentCode'])}<br><span class="tag">{h(entry['docType'])}</span></td>
<td>{h(entry['title'])}</td><td>{h(entry['issueNo'])}</td><td>{h(entry['revisionNo'])}</td><td>{h(entry['effectiveDate'])}</td>
<td><span class="tag">{'ยืนยันฉบับปัจจุบัน' if current else 'ยังไม่มีการยืนยันแหล่งข้อมูล'}</span><p>{h(note)}</p><details><summary>หลักฐานและรหัสรายการ</summary>
<p>{h(entry['evidence'])}</p>{dar_details}<p>ผลนำเข้า: {h(status)} · ยืนยันแหล่งข้อมูลเมื่อ {h(result.get('sourceConfirmedAt'))}</p><small>Document ID: {h(result.get('documentId'))}<br>File ID: {h(result.get('fileId'))}<br>SHA-256: {h(entry['sha256'])}</small></details></td></tr>''')
    types = " · ".join(f"{h(key)} {value}" for key, value in inventory["summary"]["docTypesFromFilename"].items())
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")
    content = '''<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>รายงานนำเข้าทะเบียนเอกสาร ISO</title>
<style>
:root{color-scheme:light;--navy:#142942;--muted:#596579;--line:#dce3ec}*{box-sizing:border-box}body{margin:0;background:#f4f6fa;color:var(--navy);font:15px/1.65 Tahoma,Arial,sans-serif}header{background:var(--navy);color:white;padding:36px max(24px,4vw)}h1{font-size:27px;line-height:1.4;margin:0 0 10px}header p{margin:0;color:#d1dbea}main{max-width:1800px;margin:auto;padding:28px max(20px,3vw)}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.metric,.note{background:white;border:1px solid var(--line);border-radius:8px;padding:20px}.metric b{font-size:32px;display:block}.metric span,small{color:var(--muted)}.note{margin:20px 0}.note p{margin:6px 0}.tools{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:22px 0 12px}input,select{font:inherit;padding:10px 12px;border:1px solid #aebdce;border-radius:5px;background:white}input{flex:1;min-width:240px}input:focus,select:focus{outline:3px solid #9ab8dd}table{border-collapse:collapse;width:100%;background:white;font-size:13px}th{background:var(--navy);color:white;text-align:left;white-space:nowrap}th,td{padding:13px 12px;border-bottom:1px solid var(--line);vertical-align:top}td:nth-child(2){min-width:235px;width:24%}td:nth-child(4){min-width:185px;width:18%}td:last-child{min-width:300px;width:33%}td:nth-child(6){white-space:nowrap}td p{margin:6px 0}.table-wrap{overflow:auto;border-radius:6px;border:1px solid var(--line)}tr:hover td{background:#f6f9fd}details{margin-top:8px}summary{cursor:pointer;color:#34547a}small{overflow-wrap:anywhere;display:inline-block}.tag,.pending{font-size:12px;display:inline-block;padding:1px 7px;background:#e9eff7;border-radius:4px}.pending{background:#fff0d5;color:#765010}footer{font-size:12px;color:var(--muted);margin:20px 0}[hidden]{display:none!important}@media(max-width:700px){.metrics{grid-template-columns:repeat(2,1fr)}h1{font-size:22px}}@media print{header{background:white;color:#142942;padding:0}.tools{display:none}.table-wrap{overflow:visible}body{background:white}main{padding:15px 0}details{display:block}th{background:#e9eff7;color:#142942}}
</style></head><body>'''
    content += f'''<header><h1>รายงานนำเข้าทะเบียนเอกสาร ISO</h1><p>สำนักงานคณบดีคณะวิศวกรรมศาสตร์ · รายงานสำหรับตรวจสอบข้อมูล · อ่านอย่างเดียว</p></header><main>
<section class="metrics" aria-label="ยอดรวม"><div class="metric"><b>{len(entries)}</b><span>ไฟล์ต้นฉบับในทะเบียน</span></div><div class="metric"><b>{document_count}</b><span>รายการเอกสาร / ฉบับปัจจุบัน</span></div><div class="metric"><b>{confirmed_count}</b><span>ไฟล์ที่ยืนยันแหล่งข้อมูลปัจจุบันแล้ว</span></div><div class="metric"><b>{summary['failed']}</b><span>ไฟล์นำเข้าไม่สำเร็จ</span></div></section>
<section class="note"><p><strong>มีเอกสารครบ {len(entries)} ไฟล์ในทะเบียน</strong> — ผลตรวจล่าสุดพบ {summary['existing']} ไฟล์ที่มีอยู่แล้ว โดยไม่สร้างซ้ำ</p>
<p>{types} · ไม่พบ WI · ไม่พบไฟล์ที่มี SHA-256 ซ้ำกัน</p>
<p>{h(report.get('sourceConfirmation'))} รายการเอกสารทั้ง 295 รายการเป็นฉบับที่เผยแพร่ใช้งานปัจจุบัน</p>
<p>การยืนยันแหล่งข้อมูลปัจจุบันแยกจากความครบถ้วนของข้อมูลทะเบียน รหัส ชื่อเรื่อง และประเภทที่อ่านจากชื่อไฟล์ยังเป็นข้อมูลเบื้องต้น ช่อง — หมายถึงไม่มีข้อมูลที่ยืนยันได้ ไม่ใช่เลขศูนย์ ไม่มีการเดาค่าทดแทน และไม่มีการแก้ไข PDF ต้นฉบับ</p></section>
<section class="note"><strong>ข้อมูลจากทะเบียน CSV</strong><p>Master List มี 1 รายการ: QM-2301-01 ยืนยันฉบับที่ 1 แก้ไขครั้งที่ 3 วันที่เริ่มใช้ 24 กรกฎาคม 2569 (2026-07-24)</p>
<p>ทะเบียน DAR ปี 2568 มี 68 รายการย้อนหลัง ตรงกับเอกสาร 33 รายการ เก็บเป็นหลักฐานอ้างอิง ไม่มีการสร้างกระบวนการอนุมัติย้อนหลังหรือคัดลอกวันที่ขอมาเป็นวันที่เริ่มใช้ และไม่ทับชื่อเอกสารปัจจุบันด้วยชื่อในอดีต</p>
<p>ชื่อ QP-2301-0303 ในประวัติ DAR มีการสะกดต่างกัน เก็บหลักฐานไว้โดยคงชื่อปัจจุบัน</p></section>
<section class="note"><strong>จุดที่ต้องตรวจต่อ</strong><p>43 ไฟล์มีชื่อไฟล์เป็นรหัสโดยไม่มีชื่อเรื่อง จึงใช้ชื่อไฟล์แสดงชั่วคราว</p>
<p>1 ไฟล์มีรหัสชื่อไฟล์ผิดรูปแบบ: <code>SD-QP2301-0305-01-04</code> — เก็บรหัสเอกสารว่างไว้รอยืนยัน</p>
<p>รหัส <code>FM-QP-2301-0202-07</code> ตรวจภาพแล้วทั้งสองไฟล์เป็นเอกสารเดียวกัน แก้ไขครั้งที่ 0 วันที่เริ่มใช้ 27 มิถุนายน 2568 ส่วนท้ายแสดง Rev.0 และ Rev.00 ต่างรูปแบบ เก็บทั้งสองไฟล์ไว้ในฉบับปัจจุบันเดียวกัน จึงเป็น 296 ไฟล์ / 295 รายการเอกสาร / 295 ฉบับ</p></section>
<div class="tools"><label for="search">ค้นหา</label><input id="search" type="search" placeholder="ชื่อไฟล์ รหัส ชื่อเรื่อง หมายเหตุ หรือรหัสรายการ"><label for="type">ประเภท</label><select id="type"><option value="">ทั้งหมด</option><option>QM</option><option>QP</option><option>SD</option><option>FM</option></select><span id="count" role="status">แสดง {len(entries)} จาก {len(entries)} ไฟล์</span></div>
<div class="table-wrap"><table><thead><tr><th>#</th><th>ไฟล์ / ตำแหน่งต้นฉบับ</th><th>รหัส / ประเภท</th><th>ชื่อเรื่องเบื้องต้น</th><th>ฉบับที่</th><th>แก้ไขครั้งที่</th><th>วันที่มีผลใช้ (ค.ศ.)</th><th>แหล่งข้อมูล / ข้อมูลทะเบียน</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>
<footer>สร้างรายงาน: {h(timestamp)} (เวลาท้องถิ่น) · ผลนำเข้าบันทึกเมื่อ {h(report.get('generatedAt'))}<br>แหล่งข้อมูล: efiling/.local/iso-inventory.json และ efiling/.local/iso-import-report.json · รายงานนี้ไม่เชื่อมต่อบริการภายนอก</footer></main>'''
    content += '''<script>
const search=document.getElementById('search'),type=document.getElementById('type'),rows=[...document.querySelectorAll('tbody tr')];
const indexed=rows.map(row=>({row,text:row.textContent.toLocaleLowerCase()}));
function filter(){const query=search.value.trim().toLocaleLowerCase();let visible=0;for(const item of indexed){const show=(!type.value||item.row.dataset.type===type.value)&&item.text.includes(query);item.row.hidden=!show;if(show)visible++;}document.getElementById('count').textContent=`แสดง ${visible} จาก ${rows.length} ไฟล์`;}
search.addEventListener('input',filter);type.addEventListener('change',filter);
</script></body></html>'''
    output = ROOT / "works/ISO Import Report.html"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")
    print(f"Generated {output}: {len(entries)} files, {document_count} document entries")


if __name__ == "__main__":
    main()
