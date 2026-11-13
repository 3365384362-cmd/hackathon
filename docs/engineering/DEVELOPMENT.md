# 开发基线与规范

本文维护看板的工程基线、验收和 Git 规则。技术栈、运行命令或交付方式变更时更新本文，并在 [日志](../../log.md) 中记录。

## 当前基线
赛事时间、冻结规则和功能验收依据见 [参赛赛程与工作台开发基线](HACKATHON_BASELINE.md)。

Sprint 是黑客松产品设计看板，包含问题与用户、功能优先级、用户流程、页面原型和路演检查。空白项目起步，路演区提供通用检查项。项目内容保存在 D1，按当前部署权限访问。

| 位置 | 职责 |
| --- | --- |
| `app/workbench.tsx`、`app/globals.css` | 看板页面、交互和响应式样式 |
| `lib/workspace.ts` | 数据校验、初始状态、进度和简报格式 |
| `app/api/workspace/`、`app/api/export/` | 工作台读取、带版本校验的保存和简报下载 |
| `db/`、`drizzle/` | D1 表结构及迁移 |
| `.openai/hosting.json` | 既有 Sites 部署配置 |

技术栈为 React、TypeScript、Vinext/Vite、Cloudflare Workers 与 D1。采用 Node.js 22.13 或更新版本以及已提交的 pnpm 锁文件。从仓库根目录运行 `pnpm install --frozen-lockfile` 安装依赖，`pnpm dev` 启动开发预览，`pnpm build` 构建。首次运行涉及 D1 的预览时，按 [本地迁移说明](../../README.md#local-d1-migrations) 应用迁移。源码仓库供协作和版本管理，运行站点沿用带服务端和数据库的私有部署。

## 开发与验收

1. 核对需求、当前分支和工作区差异，阅读相关代码。优先复用现有组件、数据校验和进度逻辑。
2. 改动界面后，操作受影响的入口并检查窄屏可读性。修改存储后，覆盖保存、刷新恢复、输入校验及并发版本冲突。测试使用空白项目或合成数据。
3. 按改动运行构建和相关检查，记录实际命令、环境、结果及未覆盖环节。构建、交互验收和上线回读分别记录。
4. 核对 `git status --short --branch`、`git diff --check` 和 `git diff --cached --check`，按路径暂存并审查差异。主分支 `main` 保持可用，独立工作可使用 `codex/` 短期分支，提交标题采用 `feat:`、`fix:`、`docs:` 等前缀。
5. 在明确授权范围内推送，核对远端分支与提交号。部署前另行核对运行目标、访问权限、迁移和恢复点，部署后核验实际版本。

依赖锁文件入库。运行时凭据、用户数据、数据库导出、构建产物和本机缓存留在仓库之外。保留其他协作者的未提交改动，避免强推和改写共享历史。

流程参考小绩的 [开发入口](https://github.com/kuaizengji/xiaoji/blob/main/AGENTS.md)、[开发与 Git 规范](https://github.com/kuaizengji/xiaoji/blob/main/docs/engineering/DEVELOPMENT.md) 和 [测试、验收与交付规范](https://github.com/kuaizengji/xiaoji/blob/main/docs/engineering/TESTING_AND_RELEASE.md)。
