/**
 * สัญญาของ Policy Pack
 *
 * จุดที่ `SRS_A+B.md` (ฉบับรวมของกลุ่ม A) ขัดกับแบบเสนอหัวข้อ SE02 และบทที่ 1
 * มีอยู่สามก้อน และทั้งสามเป็น "ข้อมูล" ไม่ใช่ "ตรรกะ" ได้แก่
 *
 *   1. ตารางสถานะของใบคำร้องขอให้ดำเนินการแก้ไข (CAR)
 *   2. ชุดบทบาทผู้ใช้และตารางสิทธิ์
 *   3. วิธีอ่านข้อมูลเอกสารและการรับทราบจากระบบกลุ่ม A
 *
 * ไฟล์นี้นิยามว่าแต่ละแพ็กต้องส่งออกอะไรบ้าง เพื่อให้สลับได้ด้วยตัวแปร
 * `POLICY_VARIANT` เพียงตัวเดียว โดยไม่ต้องแก้ตรรกะธุรกิจที่ใช้ร่วมกัน
 *
 * รายละเอียดข้อขัดแย้งอยู่ใน `SRS_AB_Review.md`
 */

/** รหัสกรณีการใช้งานตาม `SRS_A+B.md` หัวข้อ 4 (Use Case Summary) */
export type UseCaseId =
  | 'UC-01' | 'UC-02' | 'UC-03' | 'UC-04' | 'UC-05' | 'UC-06'
  | 'UC-07' | 'UC-08' | 'UC-09' | 'UC-10' | 'UC-11' | 'UC-12'
  | 'UC-13' | 'UC-14' | 'UC-15' | 'UC-16';

export const ALL_USE_CASES: readonly UseCaseId[] = [
  'UC-01', 'UC-02', 'UC-03', 'UC-04', 'UC-05', 'UC-06',
  'UC-07', 'UC-08', 'UC-09', 'UC-10', 'UC-11', 'UC-12',
  'UC-13', 'UC-14', 'UC-15', 'UC-16',
];

/**
 * เงื่อนไขที่ต้องผ่านก่อนเปลี่ยนสถานะ
 *
 * แพ็กเก็บไว้เป็น "ชื่อ" เท่านั้น ส่วนการตรวจจริงอยู่ในทะเบียนเงื่อนไข
 * ที่ชั้นบริการ เพื่อให้แพ็กเป็นข้อมูลล้วน ไม่มีตรรกะปนอยู่
 */
export type GuardId =
  /** ต้องบันทึกสาเหตุรากเหง้าและการปฏิบัติการแก้ไขก่อน (BRULE-EFL-07) */
  | 'requireRootCauseAndAction'
  /** ต้องมีไฟล์หลักฐานอย่างน้อยหนึ่งไฟล์ (BRULE-EFL-07) */
  | 'requireEvidence'
  /** ผู้กระทำต้องไม่ใช่ผู้รับผิดชอบใบคำร้องนั้น — หลักการแยกหน้าที่ */
  | 'actorIsNotCarOwner'
  /** ผู้กระทำต้องไม่ใช่ผู้ทวนสอบคนเดิม (BRULE-EFL-12) */
  | 'actorIsNotVerifier'
  /** ต้องผ่านการทวนสอบมาแล้วจึงปิดงานได้ (UC-11 E4) */
  | 'requireVerified';

export interface CarTransition {
  /** สถานะตั้งต้น */
  readonly from: string;
  /** สถานะปลายทาง — เท่ากับ `from` ได้ในกรณีที่บันทึกผลโดยไม่เปลี่ยนสถานะ */
  readonly to: string;
  /** ชื่อการกระทำที่ผู้ใช้สั่ง ใช้เป็นชื่อปลายทางของ API ด้วย */
  readonly action: string;
  /** บทบาทที่สั่งการกระทำนี้ได้ */
  readonly allowedRoles: readonly string[];
  /** เงื่อนไขที่ต้องผ่านครบทุกข้อ */
  readonly guards: readonly GuardId[];
  /** คำอธิบายภาษาไทยสำหรับแสดงบนหน้าจอและในร่องรอยการตรวจสอบ */
  readonly label: string;
}

export interface CarPolicy {
  readonly states: readonly string[];
  readonly initial: string;
  /**
   * สถานะที่ถือว่าปิดงานแล้ว ใช้คำนวณงานเกินกำหนด
   * เงื่อนไขคือ `due_date < วันนี้ AND status ∉ closedStates`
   */
  readonly closedStates: readonly string[];
  readonly transitions: readonly CarTransition[];
}

export interface RolePolicy {
  readonly all: readonly string[];
  /** บทบาท -> รายการกรณีการใช้งานที่เข้าถึงได้ */
  readonly permissions: Readonly<Record<string, readonly UseCaseId[]>>;
}

/* ---------- การอ่านข้อมูลจากระบบกลุ่ม A ---------- */

export interface DocumentStatusCount {
  readonly status: string;
  readonly count: number;
}

export interface AckRate {
  readonly documentId: string;
  readonly documentCode: string;
  readonly acknowledged: number;
  readonly assigned: number;
}

export interface DocumentRef {
  readonly documentId: string;
  readonly documentCode: string;
  readonly title: string;
  readonly status: string;
  readonly revisionNo: number | null;
}

/**
 * ส่วนต่อประสานที่ระบบกลุ่ม B ใช้อ่านข้อมูลของกลุ่ม A
 *
 * อ่านอย่างเดียว ทิศทางเดียว — กลุ่ม B ห้ามเขียนหรือแก้ข้อมูลเอกสาร
 * และห้ามเก็บสำเนาถาวรจนไม่สอดคล้องกับต้นทาง (Single Source of Truth)
 */
export interface GroupAClient {
  documentSummary(): Promise<DocumentStatusCount[]>;
  ackSummary(): Promise<AckRate[]>;
  publishedDocuments(): Promise<DocumentRef[]>;
  documentById(documentId: string): Promise<DocumentRef | null>;
}

/** ชุดพึ่งพาที่ชั้น API ส่งให้แพ็กตอนสร้างตัวเชื่อมต่อ */
export interface GroupAClientDeps {
  /** โมดูลกลุ่ม A ที่อยู่ในกระบวนการเดียวกัน ใช้โดยแพ็ก srsab */
  readonly local: GroupAClient;
  /** ที่อยู่ของบริการกลุ่ม A ใช้โดยแพ็ก proposal */
  readonly baseUrl?: string;
  /** ระยะเวลารอสูงสุดเป็นมิลลิวินาที */
  readonly timeoutMs?: number;
}

export interface PolicyPack {
  readonly id: 'srsab' | 'proposal';
  /** ที่มาของแพ็กนี้ ใช้แสดงตอนระบบเริ่มทำงานเพื่อกันหยิบผิดแพ็ก */
  readonly source: string;
  readonly car: CarPolicy;
  readonly roles: RolePolicy;
  createGroupAClient(deps: GroupAClientDeps): GroupAClient;
}
