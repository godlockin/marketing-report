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
  metric TEXT,
  description TEXT,
  created_at TEXT
);

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

DROP TABLE IF EXISTS fiscal_years;
CREATE TABLE fiscal_years (
  id TEXT PRIMARY KEY,
  name TEXT,
  start_month INTEGER,
  start_year INTEGER,
  created_at TEXT
);

DROP TABLE IF EXISTS annual_goals;
CREATE TABLE annual_goals (
  id TEXT PRIMARY KEY,
  name TEXT,
  value TEXT,
  description TEXT,
  progress INTEGER,
  created_at TEXT
);

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

DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  avatar TEXT,
  created_at TEXT
);
