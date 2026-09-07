import type { PolicyPack } from '../contract.js';
import { car } from './car-states.js';
import { roles } from './roles.js';
import { createGroupAClient } from './integration.js';

export const pack: PolicyPack = {
  id: 'srsab',
  source: 'SRS_A+B.md v0.12 (ฉบับรวมของกลุ่ม A) — §2.3, §3.3.1, ภาคผนวก B.4',
  car,
  roles,
  createGroupAClient,
};
