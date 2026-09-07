import type { PolicyPack } from '../contract.js';
import { car } from './car-states.js';
import { roles } from './roles.js';
import { createGroupAClient } from './integration.js';

export const pack: PolicyPack = {
  id: 'proposal',
  source: 'แบบเสนอหัวข้อ SE02 ข้อ 10.2.2–10.2.4 และบทที่ 1 §1.4.1.1, §1.4.2, §1.4.5',
  car,
  roles,
  createGroupAClient,
};
