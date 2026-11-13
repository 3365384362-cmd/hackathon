import { z } from 'zod';
const text = z.string().max(12000);
const id = z.string().min(1).max(80);
export const workspaceSchema = z.object({
  project: z.object({ name: z.string().max(100), tagline: z.string().max(300), team: z.string().max(200), deadline: z.string().max(50) }),
  definition: z.object({ problem: text, audience: text, scenario: text, workaround: text, value: text, success: text }),
  features: z.array(z.object({ id, title: z.string().min(1).max(200), description: text, priority: z.enum(['P0','P1','P2']), owner: z.string().max(100), effort: z.string().max(50), done: z.boolean() })).max(200),
  flow: z.array(z.object({ id, title: z.string().min(1).max(200), action: text, result: text, done: z.boolean() })).max(100),
  screens: z.array(z.object({ id, title: z.string().min(1).max(200), purpose: text, link: z.string().max(2000), owner: z.string().max(100), done: z.boolean() })).max(100),
  checks: z.array(z.object({ id, title: z.string().min(1).max(300), group: z.enum(['story','demo','delivery']), owner: z.string().max(100), done: z.boolean() })).max(100),
  pitch: z.object({ opening: text, solution: text, differentiation: text, next: text })
});
export type Workspace = z.infer<typeof workspaceSchema>;
export type Feature = Workspace['features'][number];
export type FlowStep = Workspace['flow'][number];
export type Screen = Workspace['screens'][number];
export type CheckItem = Workspace['checks'][number];
export type Section = 'overview'|'definition'|'features'|'flow'|'screens'|'pitch';
export const definitionFields = [
 ['problem','要解决什么问题？','描述一个具体、反复发生的问题，而不只是一种产品想法。'],
 ['audience','谁最需要它？','聚焦一类核心用户：他们是谁，有什么共同特征？'],
 ['scenario','问题在什么场景发生？','什么时间、什么地点、什么触发条件下，用户会遇到这个问题？'],
 ['workaround','用户现在怎么解决？','现有工具或替代方法是什么？还有哪些明显的成本和不便？'],
 ['value','你的核心价值是什么？','用一句话说明：为谁，在什么场景下，带来什么改变。'],
 ['success','怎样判断做对了？','定义一个比赛期间可验证的结果或指标。']
] as const;
export const sections: {id:Section;title:string;short:string;description:string;number:string}[] = [
 {id:'overview',title:'项目总览',short:'总览',description:'把每一个决定，推进成可展示的成果。',number:'00'},
 {id:'definition',title:'问题与用户',short:'需求定义',description:'先对齐值得解决的问题，再开始设计答案。',number:'01'},
 {id:'features',title:'功能优先级',short:'功能范围',description:'把有限的比赛时间，留给真正重要的功能。',number:'02'},
 {id:'flow',title:'用户流程',short:'用户流程',description:'串起从进入产品到获得价值的完整路径。',number:'03'},
 {id:'screens',title:'页面原型',short:'页面原型',description:'让每一张页面，都有清晰的目的和交付标准。',number:'04'},
 {id:'pitch',title:'路演前检查',short:'路演准备',description:'让产品能演示，让价值被听懂。',number:'05'}
];
export function createEmpty(): Workspace {
 return {project:{name:'',tagline:'',team:'',deadline:''},definition:{problem:'',audience:'',scenario:'',workaround:'',value:'',success:''},features:[],flow:[],screens:[],checks:[
 {id:'c1',title:'用一句话讲清用户与问题',group:'story',owner:'',done:false},
 {id:'c2',title:'说明核心方案与用户价值',group:'story',owner:'',done:false},
 {id:'c3',title:'准备验证结果或用户反馈',group:'story',owner:'',done:false},
 {id:'c4',title:'完成一次端到端演示',group:'demo',owner:'',done:false},
 {id:'c5',title:'检查演示环境、网络和账号',group:'demo',owner:'',done:false},
 {id:'c6',title:'准备录屏或离线备用方案',group:'demo',owner:'',done:false},
 {id:'c7',title:'控制讲述时间并完成一次彩排',group:'delivery',owner:'',done:false},
 {id:'c8',title:'核对提交链接与比赛要求',group:'delivery',owner:'',done:false},
 {id:'c9',title:'明确团队分工与问答负责人',group:'delivery',owner:'',done:false}
 ],pitch:{opening:'',solution:'',differentiation:'',next:''}};
}
export function metrics(w:Workspace) {
 const definition={done:Object.values(w.definition).filter(v=>v.trim()).length,total:6};
 const progress=(items:{done:boolean}[])=>({done:items.filter(i=>i.done).length,total:items.length});
 const modules={definition,features:progress(w.features.filter(f=>f.priority!=='P2')),flow:progress(w.flow),screens:progress(w.screens),pitch:progress(w.checks)};
 const percent=(m:{done:number;total:number})=>m.total?Math.round(m.done/m.total*100):0;
 return {modules,percent,overall:Math.round(Object.values(modules).reduce((n,m)=>n+percent(m),0)/5)};
}
export function markdown(w:Workspace) {
 const list=(s:string)=>s.trim()||'待填写';
 return `# ${w.project.name||'未命名项目'}\n\n${w.project.tagline}\n\n团队：${w.project.team||'待填写'}\n截止时间：${w.project.deadline?new Date(w.project.deadline).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'}):'待设置'}（北京时间）\n\n## 问题与用户\n\n${definitionFields.map(([key,label])=>`### ${label}\n\n${list(w.definition[key])}`).join('\n\n')}\n\n## 功能优先级\n\n${w.features.map(f=>`- [${f.done?'x':' '}] ${f.priority} · ${f.title}（负责人：${f.owner||'待分配'}；工作量：${f.effort||'待估算'}）\n  ${f.description}`).join('\n')||'待添加功能'}\n\n## 用户流程\n\n${w.flow.map((f,i)=>`${i+1}. ${f.done?'[已确认] ':''}${f.title}\n   用户操作：${f.action||'待填写'}\n   预期结果：${f.result||'待填写'}`).join('\n')||'待添加流程'}\n\n## 页面原型\n\n${w.screens.map(s=>`- [${s.done?'x':' '}] ${s.title} · ${s.purpose} · ${s.owner||'待分配'}\n  ${s.link}`).join('\n')||'待添加页面'}\n\n## 路演检查\n\n${w.checks.map(c=>`- [${c.done?'x':' '}] ${c.title}${c.owner?' · '+c.owner:''}`).join('\n')}\n\n## 路演提纲\n\n${Object.entries({开场:w.pitch.opening,解决方案:w.pitch.solution,差异与证据:w.pitch.differentiation,下一步:w.pitch.next}).map(([k,v])=>`### ${k}\n\n${list(v)}`).join('\n\n')}\n`;
}
