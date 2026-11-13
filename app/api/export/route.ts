import { workspaceSchema, markdown } from '@/lib/workspace';
export async function POST(request:Request){
 try{
  const f=await request.formData();const raw=String(f.get('data')||'');
  if(raw.length>700000)return new Response('内容过大',{status:413});
  const result=workspaceSchema.safeParse(JSON.parse(raw));
  if(!result.success)return new Response('无效的项目内容',{status:400});
  const format=f.get('format')==='json'?'json':'md';
  const filename=(result.data.project.name||'Sprint-项目').replace(/[\\/\x00-\x1f]/g,'-')+'.'+format;
  return new Response(format==='md'?markdown(result.data):JSON.stringify(result.data,null,2),{headers:{'Content-Type':format==='md'?'text/markdown; charset=utf-8':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="sprint-project.${format}"; filename*=UTF-8''${encodeURIComponent(filename)}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('导出失败，请重试',{status:400});}
}
