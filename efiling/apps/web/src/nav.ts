/**
 * ผังงานทั้งระบบ เรียงตามกระบวนการคุณภาพจริง ไม่ได้เรียงตามโมดูลของโปรแกรม
 *
 * ชื่อเมนูเขียนด้วยคำที่เจ้าหน้าที่ ISO/QA ใช้จริง ไม่ใช้ศัพท์ของระบบ
 * เช่น "ยื่นคำขอแก้ไขเอกสาร" แทน "DAR Workflow"
 *
 * ผู้ใช้จะเห็นเฉพาะรายการที่บทบาทของตนเข้าถึงได้ โดยเทียบกับสิทธิ์
 * ที่ส่วนให้บริการข้อมูลคืนมาจาก Policy Pack
 */

export interface NavItem {
  /** รหัสกรณีการใช้งานตาม SRS_A+B.md */
  useCase: string;
  label: string;
  path: string;
  /** คำอธิบายสั้นสำหรับหน้าแรก */
  summary: string;
}

export interface NavSection {
  key: string;
  title: string;
  /** ที่มาของงานส่วนนี้ในระบบคุณภาพ */
  procedure: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    key: 'document',
    title: 'ควบคุมเอกสาร',
    procedure: 'QP-2301-0107',
    items: [
      {
        useCase: 'UC-06',
        label: 'ค้นหาเอกสาร',
        path: '/documents',
        summary: 'ค้นเอกสารฉบับใช้งานจริงด้วยรหัสหรือชื่อ',
      },
      {
        useCase: 'UC-01',
        label: 'สร้างเอกสารฉบับร่าง',
        path: '/documents/new',
        summary: 'ตั้งรหัสเอกสาร กรอกรายละเอียด และแนบไฟล์',
      },
      {
        useCase: 'UC-02',
        label: 'ยื่นคำขอแก้ไขเอกสาร',
        path: '/dar/new',
        summary: 'ขอจัดทำ แก้ไข ยกเลิก หรือขอสำเนาไม่ควบคุม',
      },
      {
        useCase: 'UC-03',
        label: 'พิจารณาคำขอแก้ไข',
        path: '/dar',
        summary: 'อนุมัติหรือส่งกลับพร้อมเหตุผล',
      },
      {
        useCase: 'UC-04',
        label: 'เผยแพร่ฉบับใช้งาน',
        path: '/documents/publish',
        summary: 'ประกาศใช้ฉบับที่อนุมัติแล้ว และปิดฉบับเดิม',
      },
      {
        useCase: 'UC-05',
        label: 'ยกเลิกเอกสาร',
        path: '/documents/obsolete',
        summary: 'ถอนเอกสารออกจากการใช้งานและเรียกคืนสำเนา',
      },
      {
        useCase: 'UC-07',
        label: 'รับทราบเอกสาร',
        path: '/acknowledgements',
        summary: 'กดรับทราบและติดตามว่าใครยังไม่ได้รับทราบ',
      },
    ],
  },
  {
    key: 'audit',
    title: 'ตรวจติดตามและแก้ไข',
    procedure: 'QP-2301-0102 และ 0109',
    items: [
      {
        useCase: 'UC-08',
        label: 'บันทึกหลักฐาน',
        path: '/records',
        summary: 'เก็บหลักฐานการปฏิบัติงานพร้อมไฟล์แนบ',
      },
      {
        useCase: 'UC-09',
        label: 'บันทึกประเด็นที่พบ',
        path: '/findings',
        summary: 'บันทึกข้อบกพร่องจากรอบตรวจหรือจากข้อร้องเรียน',
      },
      {
        useCase: 'UC-10',
        label: 'เปิดใบคำร้องแก้ไข',
        path: '/cars/new',
        summary: 'ออกใบคำร้องจากประเด็นที่พบ พร้อมผู้รับผิดชอบและกำหนดเสร็จ',
      },
      {
        useCase: 'UC-11',
        label: 'ติดตามและปิดใบคำร้อง',
        path: '/cars',
        summary: 'บันทึกสาเหตุ การแก้ไข ทวนสอบ และปิดงาน',
      },
      {
        useCase: 'UC-13',
        label: 'ส่งออกรายงาน',
        path: '/reports',
        summary: 'ส่งออกสรุปตามช่วงเวลาเป็นไฟล์ตาราง',
      },
    ],
  },
  {
    key: 'overview',
    title: 'ภาพรวม',
    procedure: '',
    items: [
      {
        useCase: 'UC-12',
        label: 'แดชบอร์ด',
        path: '/dashboard',
        summary: 'สถานะเอกสาร การรับทราบ ใบคำร้องค้าง และงานเกินกำหนด',
      },
      {
        useCase: 'UC-16',
        label: 'งานของฉัน',
        path: '/my-tasks',
        summary: 'งานค้างที่รอคุณดำเนินการ',
      },
    ],
  },
  {
    key: 'system',
    title: 'ดูแลระบบ',
    procedure: '',
    items: [
      {
        useCase: 'UC-14',
        label: 'ร่องรอยการตรวจสอบ',
        path: '/audit-trail',
        summary: 'ใครทำอะไรกับรายการใด เมื่อใด',
      },
      {
        useCase: 'UC-15',
        label: 'จัดเก็บและทำลายข้อมูล',
        path: '/retention',
        summary: 'รายการที่ครบกำหนดจัดเก็บ และการขออนุมัติทำลาย',
      },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

export function findNavItem(useCase: string): NavItem | undefined {
  return allNavItems.find((i) => i.useCase === useCase);
}
