import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Download, Upload, LogOut, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Project } from '../../types/project';
import { toast } from 'sonner';

import EmployeeManager from './EmployeeManager';
import GoalManager from './GoalManager';
import MetricManager from './MetricManager';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { addProject } = useProjects();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const template: Omit<Project, 'id'>[] = [
      {
        title: "示例项目",
        type: "short-term",
        status: "completed",
        owner: "张三",
        month: 1,
        year: 2026,
        fiscalYear: "FY26",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        hoursInvested: 40,
        teamSize: 2,
        category: "marketing",
        metric: {
          label: "转化率",
          value: "+10%",
          trend: "up"
        },
        description: "这是一个示例项目导入模板"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-import-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (!Array.isArray(data)) {
          throw new Error('文件格式错误：必须是项目数组');
        }

        let successCount = 0;
        let failCount = 0;

        // 简单的批量导入
        for (const item of data) {
          try {
            // 简单的验证
            if (!item.title || !item.month || !item.year) {
              console.warn('跳过无效数据', item);
              failCount++;
              continue;
            }
            await addProject(item);
            successCount++;
          } catch (err) {
            console.error('导入项目失败', item, err);
            failCount++;
          }
        }

        toast.success(`导入完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('解析文件失败', error);
        toast.error('解析 JSON 文件失败，请检查格式');
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">后台管理系统</h1>
          <p className="text-muted-foreground mt-2">
            当前登录: 管理员
          </p>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">项目数据</TabsTrigger>
          <TabsTrigger value="employees">员工管理</TabsTrigger>
          <TabsTrigger value="goals">年度目标</TabsTrigger>
          <TabsTrigger value="metrics">月度信息</TabsTrigger>
          <TabsTrigger value="users">系统状态</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>批量导入项目数据</CardTitle>
              <CardDescription>
                上传 JSON 文件以批量添加项目数据。请先下载模板以确保格式正确。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  下载数据模板 (JSON)
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 transition-colors">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium">点击或拖拽上传文件</h3>
                  <p className="text-sm text-muted-foreground mt-1">支持 .json 格式文件</p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button asChild disabled={isUploading}>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    {isUploading ? '正在导入...' : '选择文件'}
                  </Label>
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>注意事项</AlertTitle>
                <AlertDescription>
                  导入的数据将直接添加到数据库中。请确保 fiscalYear (财年) 字段正确，以便在仪表板中正确显示。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManager />
        </TabsContent>

        <TabsContent value="goals">
          <GoalManager />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricManager />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户权限管理</CardTitle>
              <CardDescription>
                当前系统仅支持基本的登录验证。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">当前状态</AlertTitle>
                <AlertDescription className="text-green-700">
                  您已通过验证，拥有管理员权限。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
