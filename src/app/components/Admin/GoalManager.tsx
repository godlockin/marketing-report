import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  name: string;
  value: string;
  description: string;
  progress: number;
}

export default function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({ name: '', value: '', description: '', progress: 0 });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/annual-goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      } else {
        toast.error('获取目标列表失败');
      }
    } catch (error) {
      toast.error('获取目标列表出错');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goalData = {
        id: currentGoal?.id,
        ...formData
      };

      const response = await fetch('/api/annual-goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([goalData])
      });

      if (response.ok) {
        toast.success(currentGoal ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchGoals();
        setFormData({ name: '', value: '', description: '', progress: 0 });
        setCurrentGoal(null);
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作出错');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个目标吗？')) return;

    try {
      const response = await fetch(`/api/annual-goals?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('删除成功');
        fetchGoals();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除出错');
    }
  };

  const openEdit = (goal: Goal) => {
    setCurrentGoal(goal);
    setFormData({
      name: goal.name,
      value: goal.value,
      description: goal.description || '',
      progress: goal.progress || 0
    });
    setIsDialogOpen(true);
  };

  const openAdd = () => {
    setCurrentGoal(null);
    setFormData({ name: '', value: '', description: '', progress: 0 });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>年度目标管理</CardTitle>
          <CardDescription>设置和追踪年度关键目标。</CardDescription>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加目标
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>加载中...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>目标名称</TableHead>
                <TableHead>目标值</TableHead>
                <TableHead>进度</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    暂无目标数据
                  </TableCell>
                </TableRow>
              ) : (
                goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <div>
                          <div>{goal.name}</div>
                          <div className="text-xs text-gray-500">{goal.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{goal.value}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{goal.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(goal)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(goal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentGoal ? '编辑目标' : '添加目标'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">目标名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：年收入"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">目标值</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="例如：¥10,000,000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="progress">当前进度</Label>
                  <span className="text-sm text-gray-500">{formData.progress}%</span>
                </div>
                <Slider
                  value={[formData.progress]}
                  onValueChange={(vals) => setFormData({ ...formData, progress: vals[0] })}
                  max={100}
                  step={1}
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
