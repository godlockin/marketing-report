import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, TrainingRecord, FiscalYear, AnnualGoal, MonthlyMetric, Employee } from '../types/project';
import { toast } from 'sonner';

// 初始示例数据 (作为未配置时的回退)
const initialFiscalYears: FiscalYear[] = [
  { id: '1', name: 'FY26', startMonth: 9, startYear: 2025 },
];

const initialProjects: Project[] = [
  {
    id: '1',
    title: '首页春节活动视觉改版',
    type: 'short-term',
    status: 'completed',
    owner: '张晓明',
    month: 1,
    year: 2026,
    fiscalYear: 'FY26',
    startDate: '2026-01-05',
    endDate: '2026-01-25',
    hoursInvested: 120,
    teamSize: 3,
    category: 'marketing',
    metric: { label: '停留时长', value: '+12%', trend: 'up' },
  },
];

interface ProjectContextType {
  projects: Project[];
  trainingRecords: TrainingRecord[];
  fiscalYears: FiscalYear[];
  annualGoals: AnnualGoal[];
  monthlyMetrics: MonthlyMetric[];
  employees: Employee[];
  currentFiscalYear: string;
  setCurrentFiscalYear: (fiscalYear: string) => void;
  addFiscalYear: (startYear: number) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTrainingRecord: (record: Omit<TrainingRecord, 'id'>) => void;
  updateTrainingRecord: (id: string, record: Partial<TrainingRecord>) => void;
  deleteTrainingRecord: (id: string) => void;
  updateAnnualGoals: (goals: AnnualGoal[]) => void;
  updateMonthlyMetric: (metric: MonthlyMetric) => void;
  updateEmployees: (employees: Employee[]) => void;
  getProjectsByMonth: (month: number, year: number) => Project[];
  getTrainingByMonth: (month: number, year: number) => TrainingRecord[];
  getCompletedProjectsCount: () => number;
  getTotalTrainingHours: () => number;
  getFiscalYearMonths: () => Array<{ month: number; year: number; label: string }>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 生成财年名称
function generateFiscalYearName(startYear: number): string {
  return `FY${startYear}-${startYear + 1}`;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(initialFiscalYears);
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<string>('FY26');
  const [isLoading, setIsLoading] = useState(true);

  // Helper for API calls
  const apiCall = async (url: string, options?: RequestInit) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Call Failed (${url}):`, error);
      throw error;
    }
  };

  // Fetch all data from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from API, if it fails (e.g. 404 or network error), we might fallback to local mock data
      // But for now, let's assume API exists.
      const [
        projectsData,
        trainingData,
        fiscalData,
        goalsData,
        metricsData,
        employeesData
      ] = await Promise.all([
        apiCall('/api/projects').catch(() => []),
        apiCall('/api/training-records').catch(() => []),
        apiCall('/api/fiscal-years').catch(() => []),
        apiCall('/api/annual-goals').catch(() => []),
        apiCall('/api/monthly-metrics').catch(() => []),
        apiCall('/api/employees').catch(() => [])
      ]);

      if (projectsData.length > 0) setProjects(projectsData);
      if (trainingData.length > 0) setTrainingRecords(trainingData);
      if (fiscalData.length > 0) setFiscalYears(fiscalData);
      if (goalsData.length > 0) setAnnualGoals(goalsData);
      if (metricsData.length > 0) setMonthlyMetrics(metricsData);
      if (employeesData.length > 0) setEmployees(employeesData);

      if (fiscalData && fiscalData.length > 0) {
        const fy26 = fiscalData.find((f: any) => f.name === 'FY26');
        setCurrentFiscalYear(fy26 ? fy26.name : fiscalData[0].name);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('数据加载失败，使用本地缓存或模拟数据');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addFiscalYear = async (startYear: number) => {
    const newFiscalYear: Omit<FiscalYear, 'id'> = {
      name: generateFiscalYearName(startYear),
      startMonth: 9,
      startYear,
    };

    try {
      const data = await apiCall('/api/fiscal-years', {
        method: 'POST',
        body: JSON.stringify(newFiscalYear),
      });
      setFiscalYears([...fiscalYears, data]);
      setCurrentFiscalYear(data.name);
      toast.success('财年添加成功');
    } catch (error) {
      toast.error('添加财年失败');
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      fiscalYear: currentFiscalYear,
    };

    try {
      const data = await apiCall('/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });
      setProjects([...projects, data]);
      toast.success('项目已创建');
    } catch (error) {
      toast.error('项目创建失败');
    }
  };

  const updateProject = async (id: string, updatedData: Partial<Project>) => {
    try {
      await apiCall(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      setProjects(projects.map(p => p.id === id ? { ...p, ...updatedData } : p));
      toast.success('项目已更新');
    } catch (error) {
      toast.error('项目更新失败');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await apiCall(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      setProjects(projects.filter(p => p.id !== id));
      toast.success('项目已删除');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const addTrainingRecord = async (record: Omit<TrainingRecord, 'id'>) => {
    const newRecord = {
      ...record,
      fiscalYear: currentFiscalYear,
    };

    try {
      const data = await apiCall('/api/training-records', {
        method: 'POST',
        body: JSON.stringify(newRecord),
      });
      setTrainingRecords([...trainingRecords, data]);
      toast.success('培训记录已添加');
    } catch (error) {
      toast.error('记录创建失败');
    }
  };

  const updateTrainingRecord = async (id: string, updatedData: Partial<TrainingRecord>) => {
    try {
      await apiCall(`/api/training-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      setTrainingRecords(trainingRecords.map(r => r.id === id ? { ...r, ...updatedData } : r));
      toast.success('记录已更新');
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const deleteTrainingRecord = async (id: string) => {
    try {
      await apiCall(`/api/training-records/${id}`, {
        method: 'DELETE',
      });
      setTrainingRecords(trainingRecords.filter(r => r.id !== id));
      toast.success('记录已删除');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const updateAnnualGoals = async (goals: AnnualGoal[]) => {
    try {
      // Assuming backend handles bulk upsert or replacement
      await apiCall('/api/annual-goals', {
        method: 'PUT', // or POST with bulk flag
        body: JSON.stringify(goals),
      });
      setAnnualGoals(goals);
      toast.success('年度目标已保存');
    } catch (error) {
      toast.error('保存目标失败');
    }
  };

  const updateMonthlyMetric = async (metric: MonthlyMetric) => {
    try {
      await apiCall('/api/monthly-metrics', {
        method: 'POST', // Upsert logic on server
        body: JSON.stringify(metric),
      });
      
      const exists = monthlyMetrics.find(
        m => m.month === metric.month && m.year === metric.year && m.fiscalYear === metric.fiscalYear
      );
      if (exists) {
        setMonthlyMetrics(monthlyMetrics.map(m => 
          (m.month === metric.month && m.year === metric.year && m.fiscalYear === metric.fiscalYear) ? metric : m
        ));
      } else {
        setMonthlyMetrics([...monthlyMetrics, metric]);
      }
      toast.success('指标已更新');
    } catch (error) {
      toast.error('保存指标失败');
    }
  };

  const updateEmployees = async (updatedEmployees: Employee[]) => {
    try {
      await apiCall('/api/employees', {
        method: 'PUT',
        body: JSON.stringify(updatedEmployees),
      });
      setEmployees(updatedEmployees);
      toast.success('员工信息已保存');
    } catch (error) {
      toast.error('保存员工信息失败');
    }
  };

  const getProjectsByMonth = (month: number, year: number) => {
    return projects.filter(p => p.month === month && p.year === year && p.fiscalYear === currentFiscalYear);
  };

  const getTrainingByMonth = (month: number, year: number) => {
    return trainingRecords.filter(r => r.month === month && r.year === year && r.fiscalYear === currentFiscalYear);
  };

  const getCompletedProjectsCount = () => {
    return projects.filter(p => p.status === 'completed' && p.fiscalYear === currentFiscalYear).length;
  };

  const getTotalTrainingHours = () => {
    return trainingRecords
      .filter(r => r.fiscalYear === currentFiscalYear)
      .reduce((sum, record) => sum + record.hours, 0);
  };

  // 获取当前财年的12个月份（从9月到次年8月）
  const getFiscalYearMonths = () => {
    const currentFY = fiscalYears.find(fy => fy.name === currentFiscalYear);
    if (!currentFY) return [];

    const months: Array<{ month: number; year: number; label: string }> = [];
    for (let i = 0; i < 12; i++) {
      const monthNum = ((currentFY.startMonth + i - 1) % 12) + 1;
      const yearOffset = currentFY.startMonth + i > 12 ? 1 : 0;
      const year = currentFY.startYear + yearOffset;
      months.push({
        month: monthNum,
        year: year,
        label: `${monthNum}月`,
      });
    }
    return months;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        trainingRecords,
        fiscalYears,
        annualGoals,
        monthlyMetrics,
        employees,
        currentFiscalYear,
        setCurrentFiscalYear,
        addFiscalYear,
        addProject,
        updateProject,
        deleteProject,
        addTrainingRecord,
        updateTrainingRecord,
        deleteTrainingRecord,
        updateAnnualGoals,
        updateMonthlyMetric,
        updateEmployees,
        getProjectsByMonth,
        getTrainingByMonth,
        getCompletedProjectsCount,
        getTotalTrainingHours,
        getFiscalYearMonths,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
}
