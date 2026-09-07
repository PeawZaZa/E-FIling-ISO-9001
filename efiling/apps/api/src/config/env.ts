import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * โหลดค่าตั้งจากไฟล์ .env ที่รากของโมโนรีโป
 *
 * ทำที่นี่เพราะสั่งรันได้จากหลายที่ (รากโมโนรีโป, โฟลเดอร์ apps/api, หรือผ่าน tsx watch)
 * และในสภาพแวดล้อมจริงจะไม่มีไฟล์ .env แต่ตั้งค่าผ่านตัวแปรสภาพแวดล้อมโดยตรง
 */
function loadDotEnv() {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const candidate of [
    resolve(here, '../../../../.env'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
  ]) {
    if (existsSync(candidate)) {
      process.loadEnvFile(candidate);
      return;
    }
  }
}

loadDotEnv();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`ไม่ได้กำหนดตัวแปรสภาพแวดล้อม ${name} — ดูตัวอย่างใน .env.example`);
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  policyVariant: process.env.POLICY_VARIANT ?? 'srsab',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  groupABaseUrl: process.env.GROUP_A_BASE_URL,
} as const;
