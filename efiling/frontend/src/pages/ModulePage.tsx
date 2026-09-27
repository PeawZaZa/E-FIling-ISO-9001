type Props = { userId: string; page: string; pageError: string; access: { label: string } | null; firstMenu: string };
export function ModulePage({ userId, page, pageError, access, firstMenu }: Props) {
  return <main className="module-page" key={`${userId}:${page}`}>
      {pageError ? <><h1>เข้าเมนูไม่ได้</h1><p role="alert">{pageError}</p><a href={`#${firstMenu}`}>กลับเมนูที่มีสิทธิ์</a></> :
      access ? <><p className="eyebrow">เมนูตามสิทธิ์ของบัญชี</p><h1>{access.label}</h1><div className="empty-state"><h2>ส่วนนี้ยังไม่เริ่มพัฒนา</h2><p>ขณะนี้เปิดใช้งานการเลือกบัญชี การเข้าใช้ และสิทธิ์เข้าเมนูแล้ว<br/>ฟีเจอร์งานจะเพิ่มในขั้นถัดไป</p></div></> : <p role="status">กำลังตรวจสิทธิ์…</p>}
    </main>;
}
