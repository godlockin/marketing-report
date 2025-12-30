import React from 'react';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
  owner: string;
  metric: {
    label: string;
    value: string;
    trend: 'up' | 'down';
  };
  hoursInvested?: number;
  teamSize?: number;
  projectType?: 'short-term' | 'long-term';
  onClick?: () => void;
}

export default function ProjectCard({ 
  title, 
  status, 
  owner, 
  metric, 
  hoursInvested,
  teamSize,
  projectType,
  onClick 
}: ProjectCardProps) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    completed: '已完成',
    'in-progress': '进行中',
    pending: '待启动',
  };

  const typeLabels = {
    'short-term': '短期',
    'long-term': '长期',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-gray-900 flex-1 pr-2">{title}</h3>
        <div className="flex gap-2">
          {projectType && (
            <span className="px-2.5 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
              {typeLabels[projectType]}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded text-sm ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm">
          {owner.charAt(0)}
        </div>
        <span className="text-gray-600 text-sm">{owner}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">{metric.label}</span>
          <span className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {metric.trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm">{metric.value}</span>
          </span>
        </div>

        {(hoursInvested !== undefined || teamSize !== undefined) && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            {hoursInvested !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{hoursInvested}h</span>
              </div>
            )}
            {teamSize !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{teamSize}人</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}