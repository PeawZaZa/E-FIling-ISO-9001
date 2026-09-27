export function StatusRow({ title, status }: { title: string; status: boolean | null }) {
  return <div className="status-row"><span>{title}</span><strong className={status === null ? 'checking' : status ? 'ready' : 'unavailable'}>
    {status === null ? 'กำลังตรวจสอบ…' : status ? 'พร้อมใช้งาน' : 'เชื่อมต่อไม่ได้'}
  </strong></div>;
}
