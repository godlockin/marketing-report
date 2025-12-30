import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Pencil, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useProjects } from '../../context/ProjectContext';

interface MonthlyMetric {
  id: string;
  month: number;
  year: number;
  fiscalYear: string;
  conversionRate: number;
  highlights: string;
  lessons: string;
  improvements: string;
}

export default function MetricManager() {
  const { currentFiscalYear, getFiscalYearMonths } = useProjects();
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<{ month: number; year: number; label: string } | null>(null);
  const [formData, setFormData] = useState({
    conversionRate: '',
    highlights: '',
    lessons: '',
    improvements: ''
  });

  const fiscalMonths = getFiscalYearMonths();

  useEffect(() => {
    fetchMetrics();
  }, [currentFiscalYear]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monthly-metrics');
      if (response.ok) {
        const data = await response.json();
        // Filter by current fiscal year on client side for now (API returns all)
        // In a real app, API should support filtering
        const filtered = data.filter((m: MonthlyMetric) => m.fiscalYear === currentFiscalYear);
        setMetrics(filtered);
      } else {
        toast.error('获取月度信息失败');
      }
    } catch (error) {
      toast.error('获取月度信息出错');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (monthData: { month: number; year: number; label: string }) => {
    setCurrentMonth(monthData);
    const existingMetric = metrics.find(m => m.month === monthData.month && m.year === monthData.year);
    
    setFormData({
      conversionRate: existingMetric?.conversionRate?.toString() || '',
      highlights: existingMetric?.highlights || '',
      lessons: existingMetric?.lessons || '',
      improvements: existingMetric?.improvements || ''
    });
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMonth) return;

    try {
      const payload = {
        month: currentMonth.month,
        year: currentMonth.year,
        fiscalYear: currentFiscalYear,
        conversionRate: parseFloat(formData.conversionRate) || 0,
        highlights: formData.highlights,
        lessons: formData.lessons,
        improvements: formData.improvements
      };

      const response = await fetch('/api/monthly-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('保存成功');
        setIsDialogOpen(false);
        fetchMetrics();
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      toast.error('保存出错');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>月度信息管理 ({currentFiscalYear})</CardTitle>
        <CardDescription>记录每月的关键指标、亮点和总结。</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>加载中...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>月份</TableHead>
                <TableHead>转化率</TableHead>
                <TableHead>亮点摘要</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fiscalMonths.map((monthData, index) => {
                const metric = metrics.find(m => m.month === monthData.month && m.year === monthData.year);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {monthData.year}年{monthData.label}
                    </TableCell>
                    <TableCell>
                      {metric ? `${metric.conversionRate}%` : '-'}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {metric?.highlights || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(monthData)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        {metric ? '编辑' : '填写'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                编辑月度信息 - {currentMonth?.year}年{currentMonth?.label}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conversionRate">转化率 (%)</Label>
                <Input
                  id="conversionRate"
                  type="number"
                  step="0.01"
                  value={formData.conversionRate}
                  onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlights">本月亮点</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="列出本月的主要成就..."
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessons">经验教训</Label>
                <Textarea
                  id="lessons"
                  value={formData.lessons}
                  onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                  placeholder="本月遇到的问题及反思..."
                  className="h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="improvements">改进计划</Label>
                <Textarea
                  id="improvements"
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  placeholder="下个月的改进方向..."
                  className="h-24"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
