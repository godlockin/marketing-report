export interface Project {
  id: string;
  title: string;
  type: 'short-term' | 'long-term'; // 短期项目 | 长期项目
  status: 'completed' | 'in-progress' | 'pending';
  owner: string;
  month: number; // 1-12
  year: number;
  fiscalYear: string; // 财年标识，如 "FY2024-2025"
  startDate: string;
  endDate?: string;
  hoursInvested: number; // 投入时间（小时）
  teamSize: number; // 投入人数
  metric: {
    label: string;
    value: string;
    trend: 'up' | 'down';
  };
  category: 'product' | 'marketing' | 'ux'; // A产品线 | B市场活动 | C用户体验优化
  description?: string;
}

export interface TrainingRecord {
  id: string;
  month: number;
  year: number;
  fiscalYear: string;
  hours: number;
  topic: string;
  description?: string;
}

export interface FiscalYear {
  id: string;
  name: string; // 如 "FY2024-2025"
  startMonth: number; // 开始月份（9）
  startYear: number; // 开始年份
}

export interface AnnualGoal {
  id: string;
  name: string;
  value: string;
  description: string;
  progress: number;
}

export interface MonthlyMetric {
  month: number;
  year: number;
  fiscalYear: string;
  conversionRate: number;
  highlights?: string;
  lessons?: string;
  improvements?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}