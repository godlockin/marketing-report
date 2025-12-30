import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import ProjectDialog from './ProjectDialog';
import TrainingDialog from './TrainingDialog';
import { BarChart3, CheckCircle2, Plus, Users, Clock, BookOpen, Edit, Calendar, TrendingUp, Save, FileText } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { Project, TrainingRecord, MonthlyMetric } from '../types/project';
import { toast } from 'sonner';

interface MonthDetailProps {
  month: number;
  year: number;
  onNavigate?: (view: string) => void;
}

export default function MonthDetail({ month, year, onNavigate }: MonthDetailProps) {
  const {
    getProjectsByMonth,
    getTrainingByMonth,
    addProject,
    updateProject,
    deleteProject,
    addTrainingRecord,
    updateTrainingRecord,
    deleteTrainingRecord,
    getFiscalYearMonths,
    currentFiscalYear,
    monthlyMetrics,
    updateMonthlyMetric,
    employees,
  } = useProjects();

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingRecord | undefined>();
  
  // 获取当前月份的指标数据
  const currentMetric = monthlyMetrics.find(
    m => m.month === month && m.year === year && m.fiscalYear === currentFiscalYear
  );

  const [conversionRateInput, setConversionRateInput] = useState(currentMetric?.conversionRate.toString() || '0');
  const [highlights, setHighlights] = useState(currentMetric?.highlights || '');
  const [lessons, setLessons] = useState(currentMetric?.lessons || '');
  const [improvements, setImprovements] = useState(currentMetric?.improvements || '');

  useEffect(() => {
    setConversionRateInput(currentMetric?.conversionRate.toString() || '0');
    setHighlights(currentMetric?.highlights || '');
    setLessons(currentMetric?.lessons || '');
    setImprovements(currentMetric?.improvements || '');
  }, [currentMetric]);

  const handleUpdateMonthlyData = () => {
    const rate = parseFloat(conversionRateInput);
    updateMonthlyMetric({
      month,
      year,
      fiscalYear: currentFiscalYear,
      conversionRate: isNaN(rate) ? 0 : rate,
      highlights,
      lessons,
      improvements,
    });
    toast.success('月度数据已保存');
  };

  const monthProjects = getProjectsByMonth(month, year);
  const monthTrainings = getTrainingByMonth(month, year);
  
  const completedCount = monthProjects.filter(p => p.status === 'completed').length;
  const totalHours = monthProjects.reduce((sum, p) => sum + p.hoursInvested, 0);
  const totalTeamMembers = monthProjects.reduce((sum, p) => sum + p.teamSize, 0);
  const totalTrainingHours = monthTrainings.reduce((sum, t) => sum + t.hours, 0);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setIsProjectDialogOpen(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id'> | Project) => {
    if ('id' in projectData) {
      updateProject(projectData.id, projectData);
    } else {
      addProject({ ...projectData, month, year });
    }
  };

  const handleCloseProjectDialog = () => {
    setIsProjectDialogOpen(false);
    setSelectedProject(undefined);
  };

  const handleAddTraining = () => {
    setSelectedTraining(undefined);
    setIsTrainingDialogOpen(true);
  };

  const handleEditTraining = (training: TrainingRecord) => {
    setSelectedTraining(training);
    setIsTrainingDialogOpen(true);
  };

  const handleSaveTraining = (trainingData: Omit<TrainingRecord, 'id' | 'fiscalYear'> | TrainingRecord) => {
    if ('id' in trainingData && 'fiscalYear' in trainingData) {
      updateTrainingRecord(trainingData.id, trainingData);
    } else {
      addTrainingRecord({ ...trainingData, month, year });
    }
  };

  const handleCloseTrainingDialog = () => {
    setIsTrainingDialogOpen(false);
    setSelectedTraining(undefined);
  };

  // 计算本月每个员工的汇总信息
  const employeeMonthlySummary = employees.map(emp => {
    const empProjects = monthProjects.filter(p => p.owner === emp.name);
    const empTrainingHours = monthTrainings.reduce((sum, t) => sum + t.hours, 0); // 暂时全员分摊或模拟
    return {
      ...emp,
      projects: empProjects,
      trainingHours: empProjects.length > 0 ? 2 : 0, // 模拟数据
    };
  });

  return (
    <div className="p-8 space-y-6">
      {/* 快速导航 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-gray-900">快速导航</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate?.('overview')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            年度总览
          </button>
          {getFiscalYearMonths().map((m, index) => (
            <button
              key={index}
              onClick={() => onNavigate?.(`month-${m.month}-${m.year}`)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                m.month === month && m.year === year 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.year}年{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="space-y-6">
        {/* 月度标题和核心趋势输入 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-gray-900 mb-2">{year}年{month}月详情</h2>
            <p className="text-gray-600">本月共 {monthProjects.length} 个项目，已完成 {completedCount} 个</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-200 flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">点击转化率 (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={conversionRateInput}
                onChange={(e) => setConversionRateInput(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleUpdateMonthlyData}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>

          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit self-end"
          >
            <Plus className="w-5 h-5" />
            添加项目
          </button>
        </div>

        {/* 月度统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">点击转化率</p>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-end gap-2">
              <input
                type="number"
                step="0.1"
                value={conversionRateInput}
                onChange={(e) => setConversionRateInput(e.target.value)}
                className="w-20 text-2xl font-bold text-gray-900 border-b border-gray-200 focus:border-blue-500 outline-none"
              />
              <span className="text-gray-500 mb-1">%</span>
              <button 
                onClick={handleUpdateMonthlyData}
                className="ml-auto p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="保存指标"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">总投入时长</p>
                <p className="text-2xl text-gray-900">{totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">参与人次</p>
                <p className="text-2xl text-gray-900">{totalTeamMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">培训时长</p>
                <p className="text-2xl text-gray-900">{totalTrainingHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* 员工月度工作汇总 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            员工月度工作汇总
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employeeMonthlySummary.map(emp => (
              <div key={emp.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {emp.name[0]}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">{emp.name}</h4>
                    <p className="text-gray-500 text-xs">{emp.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">参与项目</span>
                    <span className="text-gray-900 font-medium">{emp.projects.length} 个</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">本月培训</span>
                    <span className="text-gray-900 font-medium">{emp.trainingHours} 小时</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2 font-medium">重点项目：</p>
                    <div className="flex flex-wrap gap-2">
                      {emp.projects.length > 0 ? (
                        emp.projects.map(p => (
                          <span key={p.id} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100">
                            {p.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400">暂无关联项目</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 亮点与复盘模块 - 修改为可编辑模式 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              本月亮点与复盘
            </h3>
            <button
              onClick={handleUpdateMonthlyData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              保存复盘内容
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                亮点成果
              </div>
              <textarea
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="请输入本月核心产出与亮点成果..."
                className="w-full h-40 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                经验总结
              </div>
              <textarea
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                placeholder="请输入项目过程中的经验积累与问题反思..."
                className="w-full h-40 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:ring-1 focus:ring-purple-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                改进方向
              </div>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="请输入下阶段需要优化的环节与具体举措..."
                className="w-full h-40 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* 培训记录卡片 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-gray-900">本月培训记录</h3>
            </div>
            <button
              onClick={handleAddTraining}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              添加培训
            </button>
          </div>
          
          {monthTrainings.length > 0 ? (
            <div className="space-y-3">
              {monthTrainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                  onClick={() => handleEditTraining(training)}
                >
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">{training.topic}</h4>
                    {training.description && (
                      <p className="text-sm text-gray-600">{training.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600">{training.hours}小时</span>
                    <Edit className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              本月暂无培训记录
            </div>
          )}
        </div>

        {/* 项目网格 */}
        {monthProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {monthProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                status={project.status}
                owner={project.owner}
                metric={project.metric}
                hoursInvested={project.hoursInvested}
                teamSize={project.teamSize}
                projectType={project.type}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">本月暂无项目</p>
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加第一个项目
            </button>
          </div>
        )}
      </div>

      {/* 项目对话框 */}
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={handleCloseProjectDialog}
        onSave={handleSaveProject}
        onDelete={deleteProject}
        project={selectedProject}
        defaultMonth={month}
      />

      {/* 培训对话框 */}
      <TrainingDialog
        isOpen={isTrainingDialogOpen}
        onClose={handleCloseTrainingDialog}
        onSave={handleSaveTraining}
        onDelete={deleteTrainingRecord}
        record={selectedTraining}
        defaultMonth={month}
        defaultYear={year}
      />
    </div>
  );
}