import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Project } from '../types/project';
import { useProjects } from '../context/ProjectContext';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'> | Project) => void;
  onDelete?: (id: string) => void;
  project?: Project;
  defaultMonth?: number;
}

export default function ProjectDialog({ isOpen, onClose, onSave, onDelete, project, defaultMonth = 1 }: ProjectDialogProps) {
  const { employees } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    type: 'short-term' as 'short-term' | 'long-term',
    status: 'pending' as 'completed' | 'in-progress' | 'pending',
    owner: '',
    month: defaultMonth,
    year: 2025,
    startDate: '',
    endDate: '',
    hoursInvested: 0,
    teamSize: 1,
    category: 'product' as 'product' | 'marketing' | 'ux',
    metricLabel: '转化率',
    metricValue: '+0%',
    metricTrend: 'up' as 'up' | 'down',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        type: project.type,
        status: project.status,
        owner: project.owner,
        month: project.month,
        year: project.year,
        startDate: project.startDate,
        endDate: project.endDate || '',
        hoursInvested: project.hoursInvested,
        teamSize: project.teamSize,
        category: project.category,
        metricLabel: project.metric.label,
        metricValue: project.metric.value,
        metricTrend: project.metric.trend,
        description: project.description || '',
      });
    } else {
      setFormData(prev => ({ ...prev, month: defaultMonth }));
    }
  }, [project, defaultMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      title: formData.title,
      type: formData.type,
      status: formData.status,
      owner: formData.owner,
      month: formData.month,
      year: formData.year,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      hoursInvested: formData.hoursInvested,
      teamSize: formData.teamSize,
      category: formData.category,
      metric: {
        label: formData.metricLabel,
        value: formData.metricValue,
        trend: formData.metricTrend,
      },
      description: formData.description,
    };

    if (project) {
      onSave({ ...projectData, id: project.id, fiscalYear: project.fiscalYear });
    } else {
      onSave(projectData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (project && onDelete) {
      onDelete(project.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-gray-900">{project ? '编辑项目' : '添加新项目'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-700 mb-2 text-sm">项目名称 *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入项目名称"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">项目类型 *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short-term">短期项目</option>
                <option value="long-term">长期项目</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">项目状态 *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">待启动</option>
                <option value="in-progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">负责人 *</label>
              <select
                required
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择负责人</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">所属月份 *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">开始日期 *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">结束日期</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">投入时间（小时）*</label>
              <input
                type="number"
                required
                min="0"
                value={formData.hoursInvested}
                onChange={(e) => setFormData({ ...formData, hoursInvested: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">投入人数 *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">项目分类 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="product">Acommercial calendar</option>
                <option value="marketing">BRunning business needs</option>
                <option value="ux">C用户体验优化</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">核心指标名称</label>
              <input
                type="text"
                value={formData.metricLabel}
                onChange={(e) => setFormData({ ...formData, metricLabel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：转化率、停留时长"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">指标变化</label>
              <input
                type="text"
                value={formData.metricValue}
                onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：+12%、-5%"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 mb-2 text-sm">项目描述</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="项目的详细描述..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {project ? '保存修改' : '添加项目'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            {project && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                删除项目
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}