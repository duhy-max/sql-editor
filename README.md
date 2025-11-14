# SQL Editor

一个基于 **Vue 3 + Vite** 构建的轻量级 SQL 在线编辑器，支持多环境切换、并行加载数据库信息、SQL 清洗、执行 SQL、结果展示等功能。

## 🌟 功能特性

### ✔️ 多环境切换
- 可选择不同运行环境（如 dev / test / prod）
- 环境切换后自动读取数据库列表
- 对每个环境 **并行** 加载数据库，减少等待时间

### ✔️ 数据库与表管理
- 点击数据库可加载对应表列表
- 加载表信息时带缓存机制，避免重复请求
- 支持按名称搜索过滤表

### ✔️ SQL 编辑功能
- 支持多 Tab 编辑模式
- 支持执行单条 SQL 或批量 SQL
- 提供 SQL 清洗函数：
  - 去掉注释
  - 去掉多余空格
  - 去掉结尾分号
  - 确保只提交 1 条 SQL

### ✔️ SQL 执行与输出
- 执行按钮带 Loading 状态，避免重复提交
- 执行成功 / 失败都展示返回信息
- 返回内容支持换行和格式化展示
- 自动生成结果标签页（Result Tabs）

### ✔️ Mock 支持
项目内置了 mock 接口 `/api/run-sql`，可模拟 SQL 运行延迟、执行成功或失败结果，方便前端单独调试。

---

## 📂 项目结构

sql-editor/
│── src/
│ ├── components/
│ │ ├── sql-editor.vue # 主编辑器
│ │ ├── OutputTabs.vue # 输出结果 Tab
│ ├── utils/
│ │ ├── sqlCleaner.js # SQL 清洗工具
│ ├── mock/
│ │ ├── run-sql.js # 模拟 SQL 执行接口
│ ├── assets/ # 图标和图片
│── public/
│── .gitignore
│── package.json
│── README.md



## 🚀 本地运行

克隆仓库：

```bash
git clone https://github.com/duhy-max/sql-editor.git
cd sql-editor

安装依赖：
npm install
启动开发环境：
npm run dev


打包构建
npm run build
```




