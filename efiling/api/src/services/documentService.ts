import { Prisma, type ImportReviewStatus, type DocumentVersionStatus } from '@prisma/client';
import { access, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { database } from '../lib/prisma.js';
import { CENTRAL_DEPARTMENT, isCentralDocument, dbUserId, DocumentError, documentScope, parseDocumentInput, requireDcc, versionScope, type DocumentInput } from './documentRules.js';
import { discardFile, inspectPdf, storedPath, storePdf } from './documentStorage.js';

const fileSelect = {id:true,fileName:true,sizeBytes:true,uploadedAt:true,uploadedBy:{select:{fullName:true}}} satisfies Prisma.DocumentFileSelect;
const baseInclude = {department:{select:{id:true,code:true,nameTh:true}},owner:{select:{id:true,fullName:true}}};
function include(accountId: string) {
  return {...baseInclude,versions:{where:versionScope(accountId),orderBy:{createdAt:'desc' as const},select:{id:true,issueNo:true,revisionNo:true,status:true,reviewStatus:true,effectiveDate:true,reviewNotes:true,sourceConfirmedAt:true,sourceConfirmationNote:true,createdAt:true,originatingDar:{select:{id:true,darNo:true}},files:{select:fileSelect}}}} satisfies Prisma.DocumentInclude;
}
export function jsonSafe<T>(value: T): T { return JSON.parse(JSON.stringify(value,(_key,v)=>typeof v === 'bigint'? Number(v):v)); }
// Read-only interface used by Records; this module owns document selection rules.
export async function listRecordDocumentReferences() {
  return database().document.findMany({where:{isActive:true,versions:{some:{status:'DOC_PUBLISHED',reviewStatus:'VERIFIED'}}},select:{id:true,documentCode:true,title:true},orderBy:{documentCode:'asc'}});
}
export async function recordDocumentExists(id: string) {
  return Boolean(await database().document.findFirst({where:{id,isActive:true,versions:{some:{status:'DOC_PUBLISHED',reviewStatus:'VERIFIED'}}},select:{id:true}}));
}
export async function listDocuments(accountId: string, query: Record<string, unknown>) {
  const scope = documentScope(accountId);
  const q = typeof query.q === 'string' ? query.q.trim().slice(0,300) : '';
  const type = typeof query.type === 'string' ? query.type : undefined;
  const departmentId = typeof query.departmentId === 'string' && /^[0-9a-f-]{36}$/i.test(query.departmentId) ? query.departmentId : undefined;
  const review: ImportReviewStatus | undefined = query.status === 'pending' ? 'PENDING' : query.status === 'verified' ? 'VERIFIED' : undefined;
  const lifecycle: DocumentVersionStatus | undefined = query.lifecycle === 'DOC_PUBLISHED' || query.lifecycle === 'DOC_OBSOLETE' ? query.lifecycle : undefined;
  const where: Prisma.DocumentWhereInput = {AND:[scope,{isActive:true},...(q ? [{OR:[{documentCode:{contains:q,mode:'insensitive' as const}},{title:{contains:q,mode:'insensitive' as const}}]}]:[]),...(type ? [{docType:type}]:[]),...(departmentId ? [{departmentId}]:[]),...((review || lifecycle) ? [{versions:{some:{AND:[versionScope(accountId),{reviewStatus:review,status:lifecycle}]}}}]:[])]};
  const [documents,departments,owners] = await Promise.all([
    database().document.findMany({where,include:include(accountId),orderBy:[{documentCode:'asc'},{title:'asc'}]}),
    database().department.findMany({where:{isActive:true},select:{id:true,code:true,nameTh:true},orderBy:{nameTh:'asc'}}),
    accountId === 'dcc' ? database().user.findMany({where:{isActive:true},select:{id:true,fullName:true},orderBy:{fullName:'asc'}}) : [],
  ]);
  return jsonSafe({documents,departments,owners,canImport:accountId === 'dcc'});
}
export async function getDocument(accountId: string, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new DocumentError(404,'ไม่พบเอกสาร');
  const document = await database().document.findFirst({where:{AND:[documentScope(accountId),{id}]},include:include(accountId)});
  if (!document) throw new DocumentError(404,'ไม่พบเอกสารหรือไม่มีสิทธิ์เข้าถึง');
  // ประวัติของข้อมูลที่ยังรอตรวจสอบอาจมีข้อมูลซึ่งผู้อ่านไม่มีสิทธิ์เห็น
  const history = ['dcc','qmr'].includes(accountId) ? await database().auditEvent.findMany({where:{entityType:'Document',entityId:id},orderBy:{occurredAt:'desc'},select:{id:true,action:true,occurredAt:true,actor:{select:{fullName:true}},beforeValue:true,afterValue:true}}) : [];
  return jsonSafe({document,history});
}
export async function getDocumentFile(accountId: string, fileId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(fileId)) throw new DocumentError(404,'ไม่พบไฟล์');
  const scope = documentScope(accountId);
  const db = database();
  const file = await db.documentFile.findFirst({where:{id:fileId,version:{AND:[versionScope(accountId),{document:scope}]}},select:{storagePath:true,fileName:true,sizeBytes:true,versionId:true}});
  if (!file) throw new DocumentError(404,'ไม่พบไฟล์หรือไม่มีสิทธิ์เข้าถึง');
  const path = storedPath(file.storagePath);
  try {
    if (!(await stat(path)).isFile()) throw new DocumentError(404,'ไม่พบไฟล์ในพื้นที่จัดเก็บ กรุณาติดต่อผู้ดูแล');
    await access(path, constants.R_OK);
  } catch {
    throw new DocumentError(404,'ไม่พบไฟล์ในพื้นที่จัดเก็บ กรุณาติดต่อผู้ดูแล');
  }
  const actorUserId = dbUserId(accountId);
  const actorRole = await db.userRole.findFirst({where:{userId:actorUserId,isActive:true},select:{role:true}});
  await db.auditEvent.create({data:{actorUserId,actorRole:actorRole?.role ?? null,action:'EXPORT',entityType:'DocumentFile',entityId:fileId,afterValue:{versionId:file.versionId}}});
  return {...file,path};
}
async function resolveDepartment(tx: Prisma.TransactionClient, input: DocumentInput) {
  if (isCentralDocument(input.documentCode)) {
    const department = await tx.department.upsert({where:{code:CENTRAL_DEPARTMENT.code},create:CENTRAL_DEPARTMENT,update:{}});
    if ((input.departmentId && input.departmentId !== department.id) || (input.departmentName && input.departmentName !== department.nameTh)) {
      throw new DocumentError(400,'รหัส 2301 เป็นหน่วยงานสำนักงานคณบดีคณะวิศวกรรมศาสตร์');
    }
    return department.id;
  }
  if (input.departmentId) {
    if (!await tx.department.findFirst({where:{id:input.departmentId,isActive:true}})) throw new DocumentError(400,'ไม่พบหน่วยงาน');
    return input.departmentId;
  }
  if (!input.departmentName) return null;
  const existing = await tx.department.findFirst({where:{nameTh:input.departmentName,isActive:true}});
  return existing?.id ?? (await tx.department.create({data:{code:`IMPORT-${crypto.randomUUID().slice(0,16)}`,nameTh:input.departmentName}})).id;
}
async function validOwner(tx: Prisma.TransactionClient, id: string | null) {
  if (id && !await tx.user.findFirst({where:{id,isActive:true}})) throw new DocumentError(400,'ไม่พบเจ้าของเอกสาร');
}
function auditMetadata(input: DocumentInput) {
  return jsonSafe({...input,effectiveDate:input.effectiveDate?.toISOString().slice(0,10) ?? null}) as Prisma.InputJsonObject;
}
function knownDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') throw new DocumentError(409,'รหัส ฉบับ หรือไฟล์ซ้ำกับข้อมูลที่มีอยู่ กรุณาตรวจสอบก่อนนำเข้า');
    if (error.code === 'P2034') throw new DocumentError(409,'ข้อมูลถูกเปลี่ยนพร้อมกัน กรุณาลองใหม่');
  }
  throw error;
}
export type UploadedPdf = {path:string,size:number,mimetype:string,originalname:string};
export async function importDocument(accountId: string, body: Record<string,unknown>, file: UploadedPdf, source?: {sourcePath:string,sha256:string}) {
  let key: string | undefined;
  try {
    requireDcc(accountId);
    const input = parseDocumentInput({...body,verified:false});
    const hash = await inspectPdf(file.path,file.size,file.mimetype,file.originalname);
    if (source && hash !== source.sha256) throw new DocumentError(409,'ต้นฉบับเปลี่ยนหลังจัดทำรายการนำเข้า');
    const existing = await database().documentFile.findUnique({where:{sha256:hash}});
    if (existing) {
      if (!source) throw new DocumentError(409,'ไฟล์นี้อยู่ในทะเบียนแล้ว');
      await database().documentImportSource.upsert({where:{sourcePath:source.sourcePath},create:{sourcePath:source.sourcePath,sourceHash:hash,fileId:existing.id},update:{}});
      await discardFile(file.path);
      const version = await database().documentVersion.findUniqueOrThrow({where:{id:existing.versionId}});
      return {id:version.documentId,fileId:existing.id,duplicate:true};
    }
    key = await storePdf(file.path);
    const result = await database().$transaction(async tx => {
      const departmentId = await resolveDepartment(tx,input);
      await validOwner(tx,input.ownerUserId);
      const existingDocument = input.documentCode ? await tx.document.findUnique({where:{documentCode:input.documentCode},include:{versions:{select:{id:true}}}}) : null;
      // ตรวจผ่านหน้าจอไม่เพิ่มฉบับให้รหัสเดิมโดยไม่ตั้งใจ; สคริปต์ตั้งต้นเก็บข้อขัดแย้งเพื่อทบทวน
      if (existingDocument && !source) throw new DocumentError(409,'รหัสเอกสารนี้มีอยู่แล้ว การเพิ่มฉบับใหม่จะทำผ่าน DAR');
      const document = existingDocument ?? await tx.document.create({data:{documentCode:input.documentCode,title:input.title,docType:input.docType,departmentId,ownerUserId:input.ownerUserId}});
      const notes = [input.reviewNotes, existingDocument ? `พบหลายไฟล์ใช้รหัสเดียวกัน; ตรวจความสัมพันธ์กับฉบับอื่นก่อนยืนยัน ชื่อจากต้นทาง: ${input.title}` : null].filter(Boolean).join('\n') || null;
      const version = await tx.documentVersion.create({data:{documentId:document.id,issueNo:input.issueNo,revisionNo:input.revisionNo,effectiveDate:input.effectiveDate,status:input.status,reviewStatus:'PENDING',reviewNotes:notes}});
      const saved = await tx.documentFile.create({data:{versionId:version.id,fileName:file.originalname,mimeType:'application/pdf',sizeBytes:file.size,storagePath:key!,sha256:hash,uploadedById:dbUserId(accountId)}});
      if (source) await tx.documentImportSource.create({data:{sourcePath:source.sourcePath,sourceHash:hash,fileId:saved.id}});
      await tx.auditEvent.create({data:{actorUserId:dbUserId(accountId),actorRole:'ISO_QA_ADMIN',action:'CREATE',entityType:'Document',entityId:document.id,afterValue:{...auditMetadata(input),departmentId,versionId:version.id,fileName:file.originalname,sha256:hash,reviewStatus:'PENDING'}}});
      return {id:document.id,fileId:saved.id,duplicate:false};
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
    return result;
  } catch(error) {
    await discardFile(key ? storedPath(key):file.path);
    knownDatabaseError(error);
  }
}
export async function updateImportedVersion(accountId: string, versionId: string, body: Record<string,unknown>) {
  requireDcc(accountId);
  if (!/^[0-9a-f-]{36}$/i.test(versionId)) throw new DocumentError(404,'ไม่พบฉบับเอกสาร');
  const input = parseDocumentInput(body);
  try {
    return await database().$transaction(async tx => {
      const old = await tx.documentVersion.findUnique({where:{id:versionId},include:{document:{include:{versions:{select:{id:true,reviewStatus:true}}}},files:{select:{id:true}}}});
      if (!old) throw new DocumentError(404,'ไม่พบฉบับเอกสาร');
      if (old.reviewStatus !== 'PENDING' && !old.sourceConfirmedAt) throw new DocumentError(409,'แก้ไขได้เฉพาะข้อมูลนำเข้าที่รอตรวจสอบ');
      if (old.sourceConfirmedAt && input.status !== old.status) throw new DocumentError(409,'การแก้ข้อมูลทะเบียนไม่เปลี่ยนสถานะประกาศใช้ การเปลี่ยนฉบับต้องผ่าน DAR');
      const departmentId = await resolveDepartment(tx,input);
      await validOwner(tx,input.ownerUserId);
      const core = {documentCode:input.documentCode,title:input.title,docType:input.docType,departmentId,ownerUserId:input.ownerUserId};
      if (old.document.versions.some(v=>v.id !== old.id && v.reviewStatus === 'VERIFIED') && Object.entries(core).some(([k,v])=>old.document[k as keyof typeof core] !== v)) throw new DocumentError(409,'ทะเบียนนี้มีฉบับอื่นที่ยืนยันแล้ว ไม่สามารถแก้ข้อมูลหลักร่วมผ่านฉบับนี้');
      if (input.verified && !old.files.length) throw new DocumentError(400,'ต้องมีไฟล์ก่อนตรวจยืนยัน');
      await tx.document.update({where:{id:old.documentId},data:core});
      const reviewStatus = (input.verified || old.sourceConfirmedAt) ? 'VERIFIED':'PENDING';
      await tx.documentVersion.update({where:{id:versionId},data:{issueNo:input.issueNo,revisionNo:input.revisionNo,effectiveDate:input.effectiveDate,status:input.status,reviewNotes:input.reviewNotes,reviewStatus}});
      const before = {...old.document,issueNo:old.issueNo,revisionNo:old.revisionNo,effectiveDate:old.effectiveDate,status:old.status,reviewStatus:old.reviewStatus,reviewNotes:old.reviewNotes};
      await tx.auditEvent.create({data:{actorUserId:dbUserId(accountId),actorRole:'ISO_QA_ADMIN',action:'UPDATE',entityType:'Document',entityId:old.documentId,beforeValue:jsonSafe(before) as unknown as Prisma.InputJsonObject,afterValue:{...auditMetadata(input),departmentId,versionId,reviewStatus}}});
      return {id:old.documentId};
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
  } catch(error) { knownDatabaseError(error); }
}
