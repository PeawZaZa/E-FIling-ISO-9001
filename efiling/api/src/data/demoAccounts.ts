// Fixed demo identities; selecting a role switches person, not a union of permissions.
export const accounts = [
  {
    "id": "dcc",
    "name": "ผู้ใช้ ก",
    "roleLabel": "เจ้าหน้าที่ควบคุมเอกสาร",
    "email": "dcc@example.test"
  },
  {
    "id": "owner",
    "name": "ผู้ใช้ ข",
    "roleLabel": "เจ้าของเอกสาร",
    "email": "owner@example.test"
  },
  {
    "id": "reviewer",
    "name": "ผู้ใช้ ค",
    "roleLabel": "ผู้อนุมัติเอกสาร / รองคณบดี",
    "email": "reviewer@example.test"
  },
  {
    "id": "qmr",
    "name": "ผู้ใช้ ง",
    "roleLabel": "QMR",
    "email": "qmr@example.test"
  },
  {
    "id": "reader",
    "name": "ผู้ใช้ จ",
    "roleLabel": "ผู้ใช้งานเอกสาร",
    "email": "reader@example.test"
  },
  {
    "id": "auditor",
    "name": "ผู้ใช้ ฉ",
    "roleLabel": "ผู้ตรวจติดตาม",
    "email": "auditor@example.test"
  },
  {
    "id": "carowner",
    "name": "ผู้ใช้ ช",
    "roleLabel": "ผู้รับผิดชอบการแก้ไข",
    "email": "carowner@example.test"
  },
  {
    "id": "registrar",
    "name": "ผู้ใช้ ซ",
    "roleLabel": "ผู้คุมทะเบียน DAR",
    "email": "registrar@example.test"
  },
  {
    "id": "sponsor",
    "name": "ผู้ใช้ ฌ",
    "roleLabel": "ผู้บริหาร / สำนักงานคณบดี",
    "email": "sponsor@example.test"
  },
  {
    "id": "deputy",
    "name": "ผู้ใช้ ญ",
    "roleLabel": "ผู้ช่วย QMR",
    "email": "deputy@example.test"
  },
  {
    "id": "sectionhead",
    "name": "ผู้ใช้ ฎ",
    "roleLabel": "หัวหน้างาน",
    "email": "sectionhead@example.test"
  },
  {
    "id": "lead",
    "name": "ผู้ใช้ ฏ",
    "roleLabel": "หัวหน้าทีมผู้ตรวจติดตาม",
    "email": "lead@example.test"
  },
  {
    "id": "assistant",
    "name": "ผู้ใช้ ฐ",
    "roleLabel": "ผู้ช่วยเลขานุการคณะกรรมการฯ",
    "email": "assistant@example.test"
  },
  {
    "id": "dean",
    "name": "ผู้ใช้ ฑ",
    "roleLabel": "คณบดี",
    "email": "dean@example.test"
  }
];
export const menus = [
  {
    "id": "documents",
    "label": "ทะเบียนเอกสาร",
    "roles": [
      "dcc",
      "owner",
      "reviewer",
      "qmr",
      "deputy",
      "reader",
      "registrar",
      "dean"
    ]
  },
  {
    "id": "dar",
    "label": "คำขอเอกสาร (DAR)",
    "roles": [
      "dcc",
      "owner",
      "reviewer",
      "qmr",
      "deputy",
      "registrar",
      "dean"
    ]
  },
  {
    "id": "ack",
    "label": "รับทราบเอกสาร",
    "roles": [
      "dcc",
      "owner",
      "reviewer",
      "qmr",
      "deputy",
      "reader",
      "registrar",
      "dean"
    ]
  },
  {
    "id": "records",
    "label": "บันทึกและหลักฐาน",
    "roles": [
      "dcc",
      "auditor",
      "carowner",
      "qmr",
      "deputy",
      "lead",
      "assistant"
    ]
  },
  {
    "id": "audit",
    "label": "รอบตรวจและประเด็น",
    "roles": [
      "dcc",
      "auditor",
      "qmr",
      "deputy",
      "lead",
      "sectionhead",
      "carowner"
    ]
  },
  {
    "id": "cars",
    "label": "ใบคำร้อง CAR / NCR",
    "roles": [
      "dcc",
      "auditor",
      "carowner",
      "qmr",
      "deputy",
      "lead",
      "assistant",
      "sectionhead"
    ]
  },
  {
    "id": "dashboard",
    "label": "ภาพรวมงาน",
    "roles": [
      "dcc",
      "auditor",
      "qmr",
      "deputy",
      "lead",
      "sponsor"
    ]
  }
];
