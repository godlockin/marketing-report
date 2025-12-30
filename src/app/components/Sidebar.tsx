import React, { useState } from 'react';
import { Home, Calendar, Settings, ChevronDown, Plus, Shield } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { fiscalYears, currentFiscalYear, setCurrentFiscalYear, addFiscalYear, getFiscalYearMonths } = useProjects();
  const [showFiscalYearDropdown, setShowFiscalYearDropdown] = useState(false);
  const [showNewFYDialog, setShowNewFYDialog] = useState(false);
  const [newFYYear, setNewFYYear] = useState(new Date().getFullYear());

  const fiscalMonths = getFiscalYearMonths();

  const handleCreateFiscalYear = () => {
    addFiscalYear(newFYYear);
    setShowNewFYDialog(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* 财年选择器 */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowFiscalYearDropdown(!showFiscalYearDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-900">{currentFiscalYear}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showFiscalYearDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {fiscalYears.map(fy => (
                  <button
                    key={fy.id}
                    onClick={() => {
                      setCurrentFiscalYear(fy.name);
                      setShowFiscalYearDropdown(false);
                      onNavigate('overview');
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                      fy.name === currentFiscalYear ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {fy.name}
                  </button>
                ))}
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowFiscalYearDropdown(false);
                      setShowNewFYDialog(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-blue-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    新建财年
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-4">
          <button
            onClick={() => onNavigate('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>年度总览</span>
          </button>
        </div>

        <div className="px-3">
          <div className="text-xs text-gray-500 px-4 py-2 mb-2">月度详情</div>
          <div className="space-y-1">
            {fiscalMonths.map((monthData, index) => (
              <button
                key={index}
                onClick={() => onNavigate(`month-${monthData.month}-${monthData.year}`)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeView === `month-${monthData.month}-${monthData.year}`
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{monthData.year}年{monthData.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 mt-6">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeView === 'settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>年度设置</span>
          </button>
        </div>

        <div className="px-3 mt-4 border-t border-gray-200 pt-4">
          <button
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              activeView === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>后台管理</span>
          </button>
        </div>
      </nav>

      {/* 新建财年对话框 */}
      {showNewFYDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-gray-900 mb-4">新建财年</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">起始年份（9月开始）</label>
              <input
                type="number"
                value={newFYYear}
                onChange={(e) => setNewFYYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
              />
              <p className="text-xs text-gray-500 mt-1">
                将创建财年 FY{newFYYear}-{newFYYear + 1}（{newFYYear}年9月至{newFYYear + 1}年8月）
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateFiscalYear}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建
              </button>
              <button
                onClick={() => setShowNewFYDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}