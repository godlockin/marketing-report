# 部署指南

本项目使用 **Cloudflare Pages** 托管前端，并使用 **Cloudflare D1** 作为数据库，**Cloudflare Pages Functions** 作为后端 API。

## 1. 准备工作

确保已安装 Wrangler 命令行工具：
```bash
npm install -g wrangler
```

## 2. 配置 Cloudflare D1 数据库

1. 登录 Cloudflare Dashboard。
2. 创建一个新的 D1 数据库，命名为 `marketing-report-db`。
   ```bash
   wrangler d1 create marketing-report-db
   ```
3. 获取生成的 `database_id`，填入 `wrangler.toml` 文件中：
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "marketing-report-db"
   database_id = "你的数据库ID"
   ```

## 3. 初始化数据库结构

使用以下 SQL 语句初始化数据库表。你可以通过 Cloudflare Dashboard 的 D1 控制台执行，或者使用 Wrangler 命令：

```bash
wrangler d1 execute marketing-report-db --file=./schema.sql
```
*(你需要先创建一个 schema.sql 文件，内容如下)*

### schema.sql 内容

```sql
-- 项目表
DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  status TEXT,
  owner TEXT,
  month INTEGER,
  year INTEGER,
  fiscal_year TEXT,
  start_date TEXT,
  end_date TEXT,
  hours_invested INTEGER,
  team_size INTEGER,
  category TEXT,
  metric TEXT, -- JSON string
  description TEXT,
  created_at TEXT
);

-- 培训记录表
DROP TABLE IF EXISTS training_records;
CREATE TABLE training_records (
  id TEXT PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  fiscal_year TEXT,
  hours INTEGER,
  topic TEXT,
  description TEXT,
  created_at TEXT
);

-- 财年表
DROP TABLE IF EXISTS fiscal_years;
CREATE TABLE fiscal_years (
  id TEXT PRIMARY KEY,
  name TEXT,
  start_month INTEGER,
  start_year INTEGER,
  created_at TEXT
);

-- 年度目标
DROP TABLE IF EXISTS annual_goals;
CREATE TABLE annual_goals (
  id TEXT PRIMARY KEY,
  name TEXT,
  value TEXT,
  description TEXT,
  progress INTEGER,
  created_at TEXT
);

-- 月度指标
DROP TABLE IF EXISTS monthly_metrics;
CREATE TABLE monthly_metrics (
  id TEXT PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  fiscal_year TEXT,
  conversion_rate REAL,
  highlights TEXT,
  lessons TEXT,
  improvements TEXT,
  created_at TEXT
);

-- 员工表
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  avatar TEXT,
  created_at TEXT
);
```

## 4. 设置管理员密码

在 Cloudflare Pages 项目设置中（Settings -> Environment variables），添加一个环境变量：
- **Key**: `ADMIN_PASSWORD`
- **Value**: (你的密码，默认是 `admin123`)

## 5. 部署

### 方法 A: Git 集成 (推荐)
1. 推送代码到 Git 仓库。
2. Cloudflare Pages 会自动构建和部署。

### 方法 B: Wrangler 命令行
```bash
npm run build
wrangler pages deploy dist
```

## 6. 本地开发

要在本地运行并连接到 D1（模拟）：
```bash
npm run dev
# 注意：本地开发通常使用 wrangler pages dev，Vite 开发服务器可能无法直接通过 fetch 访问 functions，需要代理配置。
# 推荐使用 wrangler pages dev:
npx wrangler pages dev -- d1=marketing-report-db npm run dev
```
