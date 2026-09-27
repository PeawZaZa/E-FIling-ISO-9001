import { useEffect, useState } from 'react';
import { api, ApiError } from '../services/apiClient';
import { statusLabels as carLabels } from './CarPage';
import { DonutChart, StatusBarChart } from './DashboardCharts';

type Metrics = { total?: number; published?: number; previousVersions?: number; open?: number; closed?: number; assigned?: number; confirmed?: number; pending?: number; personal?: boolean; withFiles?: number; files?: number; rounds?: number; findings?: number; withOpenRequest?: number; withoutRequest?: number; overdue?: number; byType?: Record<string, number>; byStatus?: Record<string, number> };
type Dashboard = { sections: Record<string, Metrics>; unavailable: string[]; aggregateOnly: boolean };
const darLabels: Record<string, string> = { DAR_DRAFT: 'ร่าง', DAR_AWAITING_INTAKE: 'รอตรวจรับ', DAR_AWAITING_REVIEW: 'รอทบทวน', DAR_AWAITING_APPROVAL: 'รออนุมัติ', DAR_CHANGES_REQUESTED: 'ส่งกลับแก้ไข', DAR_APPROVED: 'อนุมัติแล้ว', DAR_REJECTED: 'ไม่อนุมัติ', DAR_DISTRIBUTING: 'แจกจ่าย', DAR_RECALLING: 'เรียกคืน', DAR_CLOSED: 'ปิดใบแล้ว' };
const documentLabels: Record<string, string> = { DOC_DRAFT: 'ร่าง', DOC_PUBLISHED: 'ประกาศใช้', DOC_OBSOLETE: 'ฉบับก่อนหน้า', UNSPECIFIED: 'ยังไม่ระบุ' };
const typeLabels: Record<string, string> = { QM: 'QM', QP: 'QP', WI: 'WI', SD: 'SD', FM: 'FM', UNSPECIFIED: 'ยังไม่ระบุ' };
const number = (value?: number) => (value ?? 0).toLocaleString('th-TH');
const chartColors = ['#2365a4', '#24928c', '#e3a23e', '#7862ad', '#ca6e56', '#4d789b', '#63a177', '#a6789f', '#7489a1', '#b39b59'];
const chartItems = (values: Record<string, number> | undefined, labels: Record<string, string>) => {
  const keys = [...Object.keys(labels), ...Object.keys(values ?? {}).filter(key => !(key in labels))];
  return keys.map((key, index) => ({ label: labels[key] ?? key, value: values?.[key] ?? 0, color: chartColors[index % chartColors.length] }));
};

function Counts({ values, labels, href, aggregateOnly }: { values?: Record<string, number>; labels: Record<string, string>; href?: string; aggregateOnly: boolean }) {
  return <div className="dashboard-breakdown">{Object.entries(labels).map(([key, label]) => <div key={key}><span>{href && !aggregateOnly ? <a href={`#${href}?status=${key}`}>{label}</a> : label}</span><strong>{number(values?.[key])}</strong></div>)}</div>;
}
function Metric({ label, value }: { label: string; value?: number }) { return <div className="dashboard-metric"><span>{label}</span><strong>{number(value)}</strong></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="dashboard-panel"><h2>{title}</h2>{children}</section>; }
function Unavailable({ title }: { title: string }) { return <Panel title={title}><p className="dashboard-denied">ไม่มีสิทธิ์ดูข้อมูลหมวดนี้</p></Panel>; }
function Missing({ title, domain, unavailable }: { title: string; domain: string; unavailable: string[] }) { return unavailable.includes(domain) ? <Panel title={title}><p className="dashboard-denied">ไม่สามารถโหลดข้อมูลส่วนนี้ได้</p></Panel> : <Unavailable title={title}/>; }

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null), [error, setError] = useState('');
  useEffect(() => { let active = true; api<Dashboard>('/dashboard').then(result => { if (active) setData(result); }).catch(reason => { if (active) setError(reason instanceof ApiError ? reason.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่'); }); return () => { active = false; }; }, []);
  return <main className="module-page dashboard-page"><div className="registry-heading"><div><p className="eyebrow">ภาพรวมงานตามสิทธิ์</p><h1>Dashboard</h1><p>ค่าสรุปจากข้อมูลปัจจุบันของระบบ</p></div></div>
    {error && <p role="alert" className="registry-error">{error}</p>}{!data && !error && <p role="status">กำลังโหลดภาพรวม…</p>}
    {data?.aggregateOnly && <p className="registry-metadata-note">บัญชีผู้บริหารเห็นเฉพาะค่าสรุปรวม ไม่มีลิงก์เข้ารายการ</p>}
    {data && <DashboardPanels data={data}/>}
  </main>;
}

export function DashboardPanels({ data }: { data: Dashboard }) {
  const s = data.sections;
  return <div className="dashboard-grid">
      {s.documents ? <Panel title="เอกสาร"><div className="dashboard-metrics"><Metric label="ทะเบียนเอกสาร" value={s.documents.total}/><Metric label="ฉบับประกาศใช้" value={s.documents.published}/><Metric label="ฉบับก่อนหน้า" value={s.documents.previousVersions}/></div><DonutChart title="สัดส่วนตามประเภทเอกสาร" items={chartItems(s.documents.byType, typeLabels)}/><h3>ประเภท</h3><Counts values={s.documents.byType} labels={typeLabels} aggregateOnly={data.aggregateOnly}/><h3>สถานะฉบับ</h3><Counts values={s.documents.byStatus} labels={documentLabels} aggregateOnly={data.aggregateOnly}/></Panel> : <Missing title="เอกสาร" domain="documents" unavailable={data.unavailable}/>}
      {s.dars ? <Panel title="DAR"><div className="dashboard-metrics"><Metric label="ทั้งหมด" value={s.dars.total}/><Metric label="ยังไม่ปิด" value={s.dars.open}/><Metric label="ปิดแล้ว" value={s.dars.closed}/></div><StatusBarChart title="จำนวน DAR ตามขั้นงาน" items={chartItems(s.dars.byStatus, darLabels)}/><Counts values={s.dars.byStatus} labels={darLabels} href="dar" aggregateOnly={data.aggregateOnly}/></Panel> : <Missing title="DAR" domain="dars" unavailable={data.unavailable}/>}
      {s.acknowledgements ? <Panel title="การรับทราบ"><div className="dashboard-metrics"><Metric label="มอบหมาย" value={s.acknowledgements.assigned}/><Metric label="ยืนยันแล้ว" value={s.acknowledgements.confirmed}/><Metric label="ค้าง" value={s.acknowledgements.pending}/></div><DonutChart title="ผลการรับทราบ" items={[{ label: 'ยืนยันแล้ว', value: s.acknowledgements.confirmed ?? 0, color: '#24928c' }, { label: 'ค้าง', value: s.acknowledgements.pending ?? 0, color: '#e3a23e' }]}/>{s.acknowledgements.personal && <p>เฉพาะรายการของบัญชีนี้</p>}</Panel> : <Missing title="การรับทราบ" domain="acknowledgements" unavailable={data.unavailable}/>}
      {s.records ? <Panel title="บันทึกและหลักฐาน"><div className="dashboard-metrics"><Metric label="บันทึก" value={s.records.total}/><Metric label="บันทึกที่มีไฟล์" value={s.records.withFiles}/><Metric label="ไฟล์หลักฐาน" value={s.records.files}/></div></Panel> : <Missing title="บันทึกและหลักฐาน" domain="records" unavailable={data.unavailable}/>}
      {s.audit ? <Panel title="รอบตรวจและ Finding"><div className="dashboard-metrics"><Metric label="รอบตรวจ" value={s.audit.rounds}/><Metric label="ประเด็น" value={s.audit.findings}/><Metric label="มีใบเปิดค้าง" value={s.audit.withOpenRequest}/><Metric label="ยังไม่มีใบคำร้อง" value={s.audit.withoutRequest}/></div></Panel> : <Missing title="รอบตรวจและ Finding" domain="audit" unavailable={data.unavailable}/>}
      {s.cars ? <Panel title="CAR / NCR"><div className="dashboard-metrics"><Metric label="ทั้งหมด" value={s.cars.total}/><Metric label="งานเปิด" value={s.cars.open}/><Metric label="เกินกำหนด" value={s.cars.overdue}/><Metric label="ปิดแล้ว" value={s.cars.closed}/></div>{!data.aggregateOnly && (s.cars.overdue ?? 0) > 0 && <p><a href="#cars?overdue=1">ดูรายการงานเกินกำหนด</a></p>}<StatusBarChart title="จำนวน CAR/NCR ตามขั้นงาน" items={chartItems(s.cars.byStatus, carLabels)}/><Counts values={s.cars.byStatus} labels={carLabels} href="cars" aggregateOnly={data.aggregateOnly}/></Panel> : <Missing title="CAR / NCR" domain="cars" unavailable={data.unavailable}/>}
    </div>;
}
