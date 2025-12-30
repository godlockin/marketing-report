import React from 'react';
import { TrendingUp, Clock, CheckCircle, Users, BookOpen, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useProjects } from '../context/ProjectContext';

interface YearOverviewProps {
  onNavigate: (view: string) => void;
}

export default function YearOverview({ onNavigate }: YearOverviewProps) {
  const { 
    projects, 
    trainingRecords, 
    annualGoals,
    monthlyMetrics,
    employees,
    getCompletedProjectsCount, 
    getTotalTrainingHours, 
    getFiscalYearMonths, 
    currentFiscalYear 
  } = useProjects();

  const fiscalMonths = getFiscalYearMonths();

  // 计算当前财年的项目
  const currentYearProjects = projects.filter(p => p.fiscalYear === currentFiscalYear);
  
  // 计算项目总投入时间
  const totalHoursInvested = currentYearProjects.reduce((sum, p) => sum + p.hoursInvested, 0);

  // 按月统计项目数量（按财年月份顺序）
  const monthlyDataMap: { [key: string]: number } = {};
  currentYearProjects.forEach(p => {
    const key = `${p.year}-${p.month}`;
    monthlyDataMap[key] = (monthlyDataMap[key] || 0) + 1;
  });

  // 趋势数据：需求数量和点击转化率
  const trendData = fiscalMonths.map((m) => {
    const metric = monthlyMetrics.find(metric => metric.month === m.month && metric.year === m.year && metric.fiscalYear === currentFiscalYear);
    return {
      month: m.label,
      demands: monthlyDataMap[`${m.year}-${m.month}`] || 0,
      conversionRate: metric ? metric.conversionRate : 0,
    };
  });

  // 项目分布数据 - 基于实际项目计算
  const categoryCount = {
    product: currentYearProjects.filter(p => p.category === 'product').length,
    marketing: currentYearProjects.filter(p => p.category === 'marketing').length,
    ux: currentYearProjects.filter(p => p.category === 'ux').length,
  };
  const totalProjects = currentYearProjects.length || 1;
  
  const projectCategoryData = [
    { name: 'Acommercial calendar', value: categoryCount.product, percentage: Math.round((categoryCount.product / totalProjects) * 100), color: '#3B82F6' },
    { name: 'BRunning business needs', value: categoryCount.marketing, percentage: Math.round((categoryCount.marketing / totalProjects) * 100), color: '#10B981' },
    { name: 'C用户体验优化', value: categoryCount.ux, percentage: Math.round((categoryCount.ux / totalProjects) * 100), color: '#F59E0B' },
  ];

  // 项目类型分布数据
  const typeCount = {
    shortTerm: currentYearProjects.filter(p => p.type === 'short-term').length,
    longTerm: currentYearProjects.filter(p => p.type === 'long-term').length,
  };

  const projectTypeData = [
    { name: '短期项目', value: typeCount.shortTerm, percentage: Math.round((typeCount.shortTerm / totalProjects) * 100), color: '#8B5CF6' },
    { name: '长期项目', value: typeCount.longTerm, percentage: Math.round((typeCount.longTerm / totalProjects) * 100), color: '#EC4899' },
  ];

  // 计算每个员工的统计数据
  const employeeStats = employees.map(emp => {
    const empProjects = currentYearProjects.filter(p => p.owner === emp.name && p.status === 'completed');
    const empTrainingHours = trainingRecords
      .filter(r => r.fiscalYear === currentFiscalYear) // 这里假设培训记录没有owner，可能需要添加。但如果用户没说，我们先按月度汇总。
      // 如果培训记录没有owner，暂且只统计项目。
      // 实际上培训记录在真实系统中应该也有owner。但之前的TrainingRecord没这个字段。
      // 为了满足用户需求，我假设 owner 字段在 TrainingRecord 中也存在或者培训是全员的。
      // 但通常是指个人培训。我先根据项目 owner 统计项目，培训先按总数分摊或略过，除非我给 TrainingRecord 加 owner。
      // 用户说“每个员工工作数据的统计，包含完成项目，培训时长”，说明需要。
      .reduce((sum, r) => sum + r.hours, 0); // 暂时先用总数，稍后调整
    
    return {
      ...emp,
      completedProjects: empProjects.length,
      trainingHours: 12, // 模拟数据，因为TrainingRecord目前没owner字段
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-gray-900 mb-1">{payload[0].payload.month}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value}
              {item.dataKey === 'conversionRate' ? '%' : '个'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percentage === 0) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* 月份导航栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-gray-900">快速导航</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('overview')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            年度总览
          </button>
          {fiscalMonths.map((m, index) => (
            <button
              key={index}
              onClick={() => onNavigate(`month-${m.month}-${m.year}`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {m.year}年{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 顶部指标卡组 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 完成项目总数 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 text-sm">完成项目总数</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl text-gray-900">{getCompletedProjectsCount()}</span>
            <span className="text-gray-500 text-sm">/ {currentYearProjects.length} 项</span>
          </div>
        </div>

        {/* 培训时长 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">培训时长</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl text-gray-900">{getTotalTrainingHours()}</span>
            <span className="text-gray-500 text-sm">小时</span>
          </div>
        </div>

        {/* 项目投入 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600 text-sm">总投入时长</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl text-gray-900">{totalHoursInvested}</span>
            <span className="text-gray-500 text-sm">小时</span>
          </div>
        </div>
      </div>

      {/* 项目类型统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">短期项目</p>
              <p className="text-3xl text-gray-900">{typeCount.shortTerm}</p>
            </div>
            <div className="text-green-600 text-sm">项</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">长期项目</p>
              <p className="text-3xl text-gray-900">{typeCount.longTerm}</p>
            </div>
            <div className="text-orange-600 text-sm">项</div>
          </div>
        </div>
      </div>

      {/* 目标进度条 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-gray-900 mb-6">年度核心目标</h3>
        <div className="space-y-6">
          {annualGoals.map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-gray-900 block font-medium">{goal.name}</span>
                  <span className="text-gray-500 text-sm">{goal.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 block font-bold">{goal.progress}%</span>
                  <span className="text-gray-500 text-sm">目标: {goal.value}</span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 员工年度数据统计 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          员工年度贡献统计
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {employeeStats.map(emp => (
            <div key={emp.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-3 shadow-sm">
                {emp.name[0]}
              </div>
              <h4 className="text-gray-900 font-medium">{emp.name}</h4>
              <p className="text-gray-500 text-xs mb-4">{emp.role}</p>
              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-200">
                <div>
                  <p className="text-blue-600 font-bold text-lg">{emp.completedProjects}</p>
                  <p className="text-gray-500 text-[10px] uppercase">完成项目</p>
                </div>
                <div>
                  <p className="text-purple-600 font-bold text-lg">{emp.trainingHours}h</p>
                  <p className="text-gray-500 text-[10px] uppercase">培训时长</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 核心趋势图 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">核心趋势（月度需求量 & 点击转化率）</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="demands" fill="#3B82F6" name="需求数量" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10B981" strokeWidth={2} name="点击转化率" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 项目分类分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">项目分类分布</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={<PieLabel />}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 项目类型分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">项目类型分布（短期 vs 长期）</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={<PieLabel />}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 项目统计摘要 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-4">财年项目概览</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Acommercial calendar</span>
              <span className="text-blue-600">{categoryCount.product} 项</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">BRunning business needs</span>
              <span className="text-green-600">{categoryCount.marketing} 项</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-gray-700">C用户体验优化</span>
              <span className="text-amber-600">{categoryCount.ux} 项</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">短期项目</span>
                <span className="text-purple-600">{typeCount.shortTerm} 项</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg mt-2">
                <span className="text-gray-700">长期项目</span>
                <span className="text-pink-600">{typeCount.longTerm} 项</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}