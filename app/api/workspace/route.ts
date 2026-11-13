import { env } from 'cloudflare:workers';
import { createEmpty, workspaceSchema } from '@/lib/workspace';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
// This is a shared board behind the Sites owner-private authentication boundary.
// The platform gates the complete origin, including these API routes.
function database() { if (!env.DB) throw new Error('Database unavailable'); return env.DB; }
export async function GET() {
 try {
  const db=database();
  await db.prepare('INSERT OR IGNORE INTO workspaces (id,data,revision,updated_at) VALUES (?,?,0,?)').bind('main',JSON.stringify(createEmpty()),new Date().toISOString()).run();
  const row=await db.prepare('SELECT data,revision,updated_at FROM workspaces WHERE id=?').bind('main').first<{data:string;revision:number;updated_at:string}>();
  return Response.json({data:JSON.parse(row!.data),revision:row!.revision,updatedAt:row!.updated_at},{headers});
 } catch { return Response.json({error:'暂时无法读取云端数据，请稍后重试。'},{status:503,headers}); }
}
export async function PUT(request:Request) {
 try {
  if (Number(request.headers.get('content-length'))>700000) return Response.json({error:'内容过大'},{status:413,headers});
  const raw=await request.text();
  if(raw.length>700000) return Response.json({error:'内容过大'},{status:413,headers});
  let body;try {body=JSON.parse(raw);} catch{return Response.json({error:'无效数据'},{status:400,headers});}
  const result=workspaceSchema.safeParse(body.data);
  if(!result.success||!Number.isInteger(body.revision)||body.revision<0) return Response.json({error:'数据格式有误'},{status:400,headers});
  const updatedAt=new Date().toISOString();
  const row=await database().prepare('UPDATE workspaces SET data=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? RETURNING revision').bind(JSON.stringify(result.data),updatedAt,'main',body.revision).first<{revision:number}>();
  if(!row) return Response.json({error:'其他窗口已更新这个项目。请先导出当前内容，再载入云端版本。'},{status:409,headers});
  return Response.json({revision:row.revision,updatedAt},{headers});
 } catch {return Response.json({error:'保存失败，请重试。'},{status:503,headers});}
}
