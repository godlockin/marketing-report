import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', avatar: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        toast.error('获取员工列表失败');
      }
    } catch (error) {
      toast.error('获取员工列表出错');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employeeData = {
        id: currentEmployee?.id, // If update
        ...formData
      };

      const response = await fetch('/api/employees', {
        method: 'PUT', // Our API uses PUT for upsert
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([employeeData]) // API expects an array
      });

      if (response.ok) {
        toast.success(currentEmployee ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchEmployees();
        setFormData({ name: '', role: '', avatar: '' });
        setCurrentEmployee(null);
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作出错');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这位员工吗？')) return;

    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('删除成功');
        fetchEmployees();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除出错');
    }
  };

  const openEdit = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      avatar: employee.avatar || ''
    });
    setIsDialogOpen(true);
  };

  const openAdd = () => {
    setCurrentEmployee(null);
    setFormData({ name: '', role: '', avatar: '' });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>员工管理</CardTitle>
          <CardDescription>管理团队成员信息，这些信息将显示在项目详情中。</CardDescription>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加员工
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>加载中...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>头像</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    暂无员工数据
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(employee)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(employee.id)}>
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
              <DialogTitle>{currentEmployee ? '编辑员工' : '添加员工'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">头像 URL (可选)</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
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
