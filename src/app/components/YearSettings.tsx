import React from 'react';
import { Settings, Plus, Trash2, Save, Users } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { AnnualGoal, Employee } from '../types/project';
import { toast } from 'sonner';

export default function YearSettings() {
  const { annualGoals, updateAnnualGoals, employees, updateEmployees } = useProjects();
  const [localGoals, setLocalGoals] = React.useState<AnnualGoal[]>(annualGoals);
  const [localEmployees, setLocalEmployees] = React.useState<Employee[]>(employees);

  const handleAddGoal = () => {
    setLocalGoals([
      ...localGoals,
      {
        id: Date.now().toString(),
        name: '',
        value: '',
        description: '',
        progress: 0,
      },
    ]);
  };

  const handleUpdateGoal = (id: string, field: keyof AnnualGoal, value: string | number) => {
    setLocalGoals(
      localGoals.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setLocalGoals(localGoals.filter((g) => g.id !== id));
  };

  const handleAddEmployee = () => {
    setLocalEmployees([
      ...localEmployees,
      {
        id: Date.now().toString(),
        name: '',
        role: '',
      },
    ]);
  };

  const handleUpdateEmployee = (id: string, field: keyof Employee, value: string) => {
    setLocalEmployees(
      localEmployees.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleDeleteEmployee = (id: string) => {
    setLocalEmployees(localEmployees.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    updateAnnualGoals(localGoals);
    updateEmployees(localEmployees);
    toast.success('年度设置已保存');
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">年度设置</h2>
          <p className="text-gray-600">配置年度工作台的核心参数和目标</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          保存设置
        </button>
      </div>

      <div className="space-y-6">
        {/* 年度目标设置 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              年度核心目标
            </h3>
            <button
              onClick={handleAddGoal}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              添加目标
            </button>
          </div>

          <div className="space-y-8">
            {localGoals.map((goal, index) => (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">目标名称</label>
                    <input
                      type="text"
                      value={goal.name}
                      onChange={(e) => handleUpdateGoal(goal.id, 'name', e.target.value)}
                      placeholder="例如：提升详情页转化率"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">目标值 (Label)</label>
                    <input
                      type="text"
                      value={goal.value}
                      onChange={(e) => handleUpdateGoal(goal.id, 'value', e.target.value)}
                      placeholder="例如：+15%"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm font-medium">目标描述</label>
                  <textarea
                    rows={2}
                    value={goal.description}
                    onChange={(e) => handleUpdateGoal(goal.id, 'description', e.target.value)}
                    placeholder="简要描述目标的背景和意义"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 text-sm font-medium">当前进度 (%)</label>
                    <span className="text-blue-600 font-bold">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => handleUpdateGoal(goal.id, 'progress', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            ))}
            
            {localGoals.length === 0 && (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                暂未设置年度核心目标
              </div>
            )}
          </div>
        </div>

        {/* 员工信息管理 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              员工信息配置
            </h3>
            <button
              onClick={handleAddEmployee}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              添加员工
            </button>
          </div>

          <div className="space-y-4">
            {localEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 group">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {employee.name ? employee.name[0] : '?'}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={employee.name}
                    onChange={(e) => handleUpdateEmployee(employee.id, 'name', e.target.value)}
                    placeholder="姓名"
                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm"
                  />
                  <input
                    type="text"
                    value={employee.role}
                    onChange={(e) => handleUpdateEmployee(employee.id, 'role', e.target.value)}
                    placeholder="职位"
                    className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {localEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                暂未添加员工信息
              </div>
            )}
          </div>
        </div>

        {/* 保存提示 */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-700 text-sm">
          💡 温馨提示：修改后的设置将实时反映在年度总览页面的进度条和目标展示中。
        </div>
      </div>
    </div>
  );
}