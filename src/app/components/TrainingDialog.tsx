import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { TrainingRecord } from '../types/project';

interface TrainingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<TrainingRecord, 'id' | 'fiscalYear'> | TrainingRecord) => void;
  onDelete?: (id: string) => void;
  record?: TrainingRecord;
  defaultMonth?: number;
  defaultYear?: number;
}

export default function TrainingDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  record,
  defaultMonth = 1,
  defaultYear = 2025,
}: TrainingDialogProps) {
  const [formData, setFormData] = useState({
    month: defaultMonth,
    year: defaultYear,
    hours: 0,
    topic: '',
    description: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        month: record.month,
        year: record.year,
        hours: record.hours,
        topic: record.topic,
        description: record.description || '',
      });
    } else {
      setFormData({
        month: defaultMonth,
        year: defaultYear,
        hours: 0,
        topic: '',
        description: '',
      });
    }
  }, [record, defaultMonth, defaultYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (record) {
      onSave({ ...formData, id: record.id, fiscalYear: record.fiscalYear });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (record && onDelete && confirm('确定要删除这条培训记录吗？')) {
      onDelete(record.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-gray-900">{record ? '编辑培训记录' : '添加培训记录'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">月份 *</label>
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
              <label className="block text-gray-700 mb-2 text-sm">培训时长（小时）*</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-sm">培训主题 *</label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：Figma高级技巧培训"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-sm">培训描述</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="培训内容的详细描述..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {record ? '保存修改' : '添加记录'}
            </button>
            {record && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
